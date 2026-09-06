/**
 * Server-only post-commit notifications for member sample requests.
 *
 * Notifications are intentionally detached from the API response. Email and
 * database notification failures must never turn a committed pipeline result
 * into an API failure.
 */

import 'server-only';

import { notifySampleRequest } from '@/lib/admin-notifications';
import { sendSampleRequestEmail } from '@/lib/email/send-contact';
import { FIXED_ITEM } from '@/lib/samples/create-fixed-sample-request';
import type { SampleRequestConfirmation } from '@/lib/member/sample-prefill';

export interface MemberSampleNotificationContext {
  sessionEmail: string;
  confirmation: SampleRequestConfirmation;
  inquiryId: string;
  sampleRequestId: string;
  sampleItemId: string;
  destinationId: string;
  labelId: string;
  inquiryNumber: string;
  requestNumber: string;
}

const FIXED_SAMPLES = [
  {
    productName: FIXED_ITEM.product_name,
    quantity: FIXED_ITEM.quantity,
  },
] as const;

/** Build the destination payload required by the shared sample email. */
function buildEmailDestination(confirmation: SampleRequestConfirmation) {
  return {
    companyName: confirmation.companyName || undefined,
    contactPerson: confirmation.contactPerson,
    phone: confirmation.phone,
    address: [
      confirmation.postalCode,
      confirmation.prefecture,
      confirmation.city,
      confirmation.street,
      confirmation.building,
    ]
      .filter(Boolean)
      .join(' '),
  };
}

/** Safe metadata used for both admin notification and failure logs. */
function traceabilityMetadata(context: MemberSampleNotificationContext) {
  return {
    inquiry_id: context.inquiryId,
    sample_request_id: context.sampleRequestId,
    sample_item_id: context.sampleItemId,
    destination_id: context.destinationId,
    label_id: context.labelId,
    inquiry_number: context.inquiryNumber,
    request_number: context.requestNumber,
  };
}

/**
 * Run both notification lanes independently and report only safe identifiers.
 * The returned promise never rejects; callers may detach it after commit.
 */
export async function dispatchMemberSampleNotifications(
  context: MemberSampleNotificationContext,
): Promise<void> {
  const metadata = traceabilityMetadata(context);

  const [emailResult, notificationResult] = await Promise.allSettled([
    sendSampleRequestEmail({
      requestId: context.requestNumber,
      customerName: context.confirmation.contactPerson,
      customerEmail: context.sessionEmail,
      customerPhone: context.confirmation.phone,
      company: context.confirmation.companyName || undefined,
      samples: FIXED_SAMPLES.map((sample) => ({ ...sample })),
      deliveryType: 'standard',
      deliveryDestinations: [buildEmailDestination(context.confirmation)],
      message: 'パウチサンプルセットをご依頼いたします。',
    }),
    notifySampleRequest(
      context.sampleRequestId,
      context.confirmation.contactPerson,
      1,
      metadata,
    ),
  ]);

  if (emailResult.status === 'rejected') {
    console.error('[member sample notifications] Email dispatch failed', {
      reason: emailResult.reason instanceof Error
        ? emailResult.reason.message
        : 'unknown',
      ...metadata,
    });
  } else if (!emailResult.value.success) {
    console.warn('[member sample notifications] Email delivery failed', metadata);
  }

  if (notificationResult.status === 'rejected') {
    console.error(
      '[member sample notifications] Admin notification failed',
      {
        reason: notificationResult.reason instanceof Error
          ? notificationResult.reason.message
          : 'unknown',
        ...metadata,
      },
    );
  } else if (!notificationResult.value) {
    console.warn(
      '[member sample notifications] Admin notification was not created',
      metadata,
    );
  }
}

/** Detached entry point that also isolates unexpected dispatcher failures. */
export function scheduleMemberSampleNotifications(
  context: MemberSampleNotificationContext,
): void {
  void dispatchMemberSampleNotifications(context).catch((error: unknown) => {
    console.error('[member sample notifications] Dispatch crashed', {
      reason: error instanceof Error ? error.message : 'unknown',
      ...traceabilityMetadata(context),
    });
  });
}
