'use client';

/**
 * B2B 見積リクエストページ (B2B Quotation Request Page)
 * /member/quotations/request
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import B2BQuotationRequestForm from '@/components/b2b/B2BQuotationRequestForm';
import { createSupabaseClient } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';

interface Company {
  id: string;
  name: string;
  name_kana: string;
  corporate_number: string;
}

export default function B2BQuotationRequestPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication and load user data
    const loadUserData = async () => {
      try {
        const supabase = await createSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/auth/signin?redirect=/member/quotations/request');
          return;
        }

        setUserId(user.id);

        // Load user's companies
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('id, name, name_kana, corporate_number')
          .eq('status', 'ACTIVE');

        if (companiesError) {
          console.error('Error loading companies:', companiesError);
        } else {
          setCompanies(companiesData || []);
        }

      } catch (err) {
        console.error('Error loading user data:', err);
        setError('ユーザー情報の読み込み中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const handleSuccess = (quotationId: string) => {
    router.push(`/member/quotations/${quotationId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 max-w-md">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => router.back()} className="mt-4">
            戻る
          </Button>
        </Card>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <B2BQuotationRequestForm
        userId={userId}
        companies={companies}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
