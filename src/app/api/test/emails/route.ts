import { NextRequest, NextResponse } from 'next/server';
import { getStoredEmails, clearStoredEmails } from '../../../../lib/email';

/**
 * GET /api/test/emails
 *
 * Retrieve emails sent to a specific recipient during test execution.
 *
 * Query Parameters:
 * - recipient: Email address to filter by (required)
 * - limit: Maximum number of emails to return (optional, default: 10)
 * - since: Timestamp to filter emails after (optional)
 *
 * Returns:
 * - emails: Array of email objects
 * - count: Total number of emails found
 *
 * Example:
 * GET /api/test/emails?recipient=test@example.com&limit=5
 */
export async function GET(request: NextRequest) {
  // Only allow in development/test environments
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Test endpoints are not available in production' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const recipient = searchParams.get('recipient');
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const since = parseInt(searchParams.get('since') || '0', 10);

  // Validate recipient parameter
  if (!recipient) {
    return NextResponse.json(
      { error: 'recipient parameter is required' },
      { status: 400 }
    );
  }

  // Get emails for this recipient
  const emails = getStoredEmails(recipient);

  // Filter by recipient (in case we got all emails)
  let filteredEmails = emails.filter(email => email.to === recipient);

  // Filter by timestamp if provided
  if (since > 0) {
    filteredEmails = filteredEmails.filter(email => email.timestamp >= since);
  }

  // Sort by timestamp (newest first) and apply limit
  const sortedEmails = filteredEmails
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);

  return NextResponse.json({
    recipient,
    count: sortedEmails.length,
    emails: sortedEmails.map(email => ({
      id: email.id,
      to: email.to,
      from: email.from,
      subject: email.subject,
      text: email.text,
      html: email.html,
      timestamp: email.timestamp,
      messageId: email.messageId,
      previewUrl: email.previewUrl,
    })),
  });
}

/**
 * DELETE /api/test/emails
 *
 * Clear stored emails for a recipient or all emails.
 *
 * Query Parameters:
 * - recipient: Email address to clear (optional, if not provided clears all)
 *
 * Returns:
 * - cleared: Number of emails cleared
 */
export async function DELETE(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Test endpoints are not available in production' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const recipient = searchParams.get('recipient');

  // Get count before clearing
  const emailsBefore = getStoredEmails(recipient);
  const clearedCount = emailsBefore.length;

  // Clear emails
  clearStoredEmails(recipient);

  return NextResponse.json({
    cleared: clearedCount,
    recipient: recipient || 'all',
  });
}
