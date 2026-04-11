/**
 * Admin Shipment Detail Page (Server Component)
 *
 * 出荷詳細ページ - Server Component
 * - RBAC認証チェック
 * - Client Componentでインタラクティブ操作
 */

import { redirect } from 'next/navigation';
import { requireAdminAuth } from '../../loader';
import AdminShipmentDetailClient from './AdminShipmentDetailClient';

async function ShipmentDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id: shipmentId } = await params;

  let authContext;
  try {
    authContext = await requireAdminAuth(['shipment:read']);
  } catch (error) {
    if (error instanceof Error && 'digest' in error) {
      throw error;
    }
    redirect('/auth/signin?redirect=/admin/shipments');
  }

  return <AdminShipmentDetailClient shipmentId={shipmentId} authContext={authContext} />;
}

export default async function AdminShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <ShipmentDetailContent params={params} />;
}

export const metadata = {
  title: '出荷詳細 | Epackage Lab Admin',
  description: '出荷詳細ページ',
};

export const dynamic = 'force-dynamic';
