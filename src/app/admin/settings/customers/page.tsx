'use client';

import { useEffect, useState } from 'react';
import { Building2, Mail, Percent } from 'lucide-react';

interface Customer {
  id: string;
  email: string;
  fullName: string | null;
  companyName: string | null;
  markupRate: number;
  markupRateNote: string | null;
}

export default function CustomerMarkupPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings/customer-markup');
      const result = await response.json();

      if (result.success) {
        setCustomers(result.data);
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUpdateMarkup = async (customerId: string, markupRate: number, note: string) => {
    setSaving(customerId);
    try {
      const response = await fetch(`/api/admin/settings/customer-markup/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markupRate,
          markupRateNote: note
        })
      });

      const result = await response.json();

      if (result.success) {
        setCustomers(prev => prev.map(c =>
          c.id === customerId ? { ...c, markupRate, markupRateNote: note } : c
        ));
        showMessage('success', '마크업율이 저장되었습니다');
      } else {
        showMessage('error', result.error || '저장 실패');
      }
    } catch (error) {
      console.error('Failed to update markup:', error);
      showMessage('error', '저장 실패');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">고객별 마크업율</h1>
          <p className="text-sm text-gray-500 mt-1">고객마다 다른 마크업율 적용</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      회사명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이메일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      마크업율
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      비고
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <CustomerMarkupRow
                      key={customer.id}
                      customer={customer}
                      saving={saving === customer.id}
                      onSave={(rate, note) => handleUpdateMarkup(customer.id, rate, note)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {customers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                고객이 없습니다.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CustomerMarkupRow({
  customer,
  saving,
  onSave
}: {
  customer: Customer;
  saving: boolean;
  onSave: (rate: number, note: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [markupRate, setMarkupRate] = useState(customer.markupRate);
  const [note, setNote] = useState(customer.markupRateNote || '');

  const handleSave = () => {
    onSave(markupRate, note);
    setEditing(false);
  };

  const handleCancel = () => {
    setMarkupRate(customer.markupRate);
    setNote(customer.markupRateNote || '');
    setEditing(false);
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Building2 className="h-5 w-5 text-gray-400 mr-2" />
          <div className="text-sm font-medium text-gray-900">
            {customer.companyName || customer.fullName || '-'}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center text-sm text-gray-500">
          <Mail className="h-4 w-4 mr-2" />
          {customer.email}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              max="2"
              value={markupRate}
              onChange={(e) => setMarkupRate(parseFloat(e.target.value))}
              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <span className="text-sm text-gray-500">
              ({(markupRate * 100).toFixed(0)}%)
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-900">
              {(customer.markupRate * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        {editing ? (
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="비고"
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        ) : (
          <span className="text-sm text-gray-500">{customer.markupRateNote || '-'}</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {editing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              취소
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            편집
          </button>
        )}
      </td>
    </tr>
  );
}
