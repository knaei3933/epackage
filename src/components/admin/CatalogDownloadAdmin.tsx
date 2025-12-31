"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Download,
  Users,
  FileText,
  TrendingUp,
  Calendar,
  Mail,
  Building2,
  Clock,
  Filter,
  Search,
  DownloadCloud,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface DownloadRecord {
  id: string;
  email: string;
  firstName: string;
  company?: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  downloadSuccess: boolean;
  fileSize: number;
  downloadTime?: number;
}

interface AdminDashboardProps {
  enableExport?: boolean;
  refreshInterval?: number;
}

export function CatalogDownloadAdmin({
  enableExport = true,
  refreshInterval = 30000
}: AdminDashboardProps) {
  const [records, setRecords] = useState<DownloadRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<DownloadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/catalog-download');

      if (!response.ok) {
        throw new Error('データの取得に失敗しました');
      }

      const data = await response.json();
      setRecords(data.records || []);
      setLastUpdated(new Date());

    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchRecords, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  // Filter records based on search and period
  useEffect(() => {
    let filtered = [...records];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.company && record.company.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply period filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (selectedPeriod) {
      case 'today':
        filtered = filtered.filter(record => new Date(record.timestamp) >= today);
        break;
      case 'week':
        filtered = filtered.filter(record => new Date(record.timestamp) >= weekAgo);
        break;
      case 'month':
        filtered = filtered.filter(record => new Date(record.timestamp) >= monthAgo);
        break;
    }

    setFilteredRecords(filtered);

  }, [records, searchTerm, selectedPeriod]);

  const exportToCSV = () => {
    if (!enableExport) return;

    setIsExporting(true);

    try {
      const headers = [
        'ID',
        'Email',
        'First Name',
        'Company',
        'Timestamp',
        'IP Address',
        'Download Success',
        'File Size (MB)',
        'Download Time (ms)'
      ];

      const csvContent = [
        headers.join(','),
        ...filteredRecords.map(record => [
          record.id,
          record.email,
          record.firstName,
          record.company || '',
          record.timestamp,
          record.ipAddress,
          record.downloadSuccess ? 'Yes' : 'No',
          (record.fileSize / 1024 / 1024).toFixed(2),
          record.downloadTime || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `catalog-downloads-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getStatistics = () => {
    const totalDownloads = filteredRecords.length;
    const uniqueEmails = new Set(filteredRecords.map(r => r.email)).size;
    const successfulDownloads = filteredRecords.filter(r => r.downloadSuccess).length;
    const totalFileSize = filteredRecords.reduce((sum, r) => sum + r.fileSize, 0);
    const averageDownloadTime = filteredRecords
      .filter(r => r.downloadTime)
      .reduce((sum, r, _, arr) => sum + (r.downloadTime! / arr.length), 0);

    return {
      totalDownloads,
      uniqueEmails,
      successRate: totalDownloads > 0 ? (successfulDownloads / totalDownloads) * 100 : 0,
      averageFileSize: totalDownloads > 0 ? totalFileSize / totalDownloads : 0,
      averageDownloadTime,
      totalFileSize
    };
  };

  const stats = getStatistics();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              カタログダウンロード管理
            </h2>
            <p className="text-gray-600 flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>
                最終更新: {lastUpdated?.toLocaleString('ja-JP') || 'データなし'}
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRecords}
              loading={loading}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              更新
            </Button>

            {enableExport && (
              <Button
                variant="primary"
                size="sm"
                onClick={exportToCSV}
                loading={isExporting}
                icon={<DownloadCloud className="w-4 h-4" />}
              >
                CSVエクスポート
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="メールアドレス、名前、会社名で検索..."
              leftIcon={<Search className="w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            {(['today', 'week', 'month', 'all'] as const).map(period => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
              >
                {period === 'today' && '今日'}
                {period === 'week' && '今週'}
                {period === 'month' && '今月'}
                {period === 'all' && '全期間'}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 border-l-4 border-l-brixa-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">総ダウンロード数</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.totalDownloads.toLocaleString('ja-JP')}
              </p>
            </div>
            <Download className="w-8 h-8 text-brixa-600" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">ユニークユーザー</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.uniqueEmails.toLocaleString('ja-JP')}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">成功率</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.successRate.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">平均ファイルサイズ</p>
              <p className="text-xl font-bold text-gray-900">
                {(stats.averageFileSize / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-orange-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">平均ダウンロード時間</p>
              <p className="text-xl font-bold text-gray-900">
                {(stats.averageDownloadTime / 1000).toFixed(1)}秒
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Records Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ダウンロード履歴 ({filteredRecords.length}件)
        </h3>

        {filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-700">タイムスタンプ</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">メールアドレス</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">名前</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">会社名</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">ステータス</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">ファイルサイズ</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">ダウンロード時間</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.slice(0, 50).map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      {new Date(record.timestamp).toLocaleString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="font-mono text-xs">{record.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">{record.firstName}</td>
                    <td className="py-3 px-2">
                      {record.company ? (
                        <div className="flex items-center space-x-1">
                          <Building2 className="w-3 h-3 text-gray-400" />
                          <span className="text-xs">{record.company}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <span className={cn(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        record.downloadSuccess
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      )}>
                        {record.downloadSuccess ? '成功' : '失敗'}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      {(record.fileSize / 1024 / 1024).toFixed(2)} MB
                    </td>
                    <td className="py-3 px-2">
                      {record.downloadTime
                        ? `${(record.downloadTime / 1000).toFixed(1)}秒`
                        : '-'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRecords.length > 50 && (
              <div className="mt-4 text-center text-sm text-gray-500">
                最新50件を表示しています（全{filteredRecords.length}件）
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Download className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchTerm || selectedPeriod !== 'all'
                ? '条件に一致するダウンロード履歴がありません'
                : 'ダウンロード履歴がありません'
              }
            </p>
          </div>
        )}
      </Card>

      {/* Analytics Dashboard */}
      {/* <DownloadAnalytics refreshInterval={0} /> */}
    </motion.div>
  );
}

