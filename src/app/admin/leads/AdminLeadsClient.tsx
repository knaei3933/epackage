'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Users, TrendingUp, Calendar,
  Filter, Search, Download, Eye,
  AlertCircle, CheckCircle, Loader2, X, Mail, Phone, Building, User
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { PageLoadingState } from '@/components/ui'
import {
  fetchLeads,
  updateLeadStatus,
  revealLeadContact,
  type ChatLeadListItem,
  type ChatLeadRevealResponse,
} from '@/lib/api/admin/leads';

const STATUS_OPTIONS = [
  { value: 'new', label: '新規' },
  { value: 'contacted', label: '連絡済み' },
  { value: 'qualified', label: '有見込' },
  { value: 'in_progress', label: '対応中' },
  { value: 'closed_won', label: '成約' },
  { value: 'closed_lost', label: '失注' },
  { value: 'invalid', label: '無効' },
] as const;

const OUTCOME_OPTIONS = [
  { value: 'pending', label: '保留' },
  { value: 'self_resolved', label: '自己解決' },
  { value: 'human_followup', label: '要対応' },
  { value: 'converted', label: '成約' },
  { value: 'abandoned', label: '放棄' },
] as const;

const INTENT_OPTIONS = [
  { value: 'quote', label: '見積相談' },
  { value: 'sample', label: 'サンプル相談' },
  { value: 'technical', label: '技術相談' },
  { value: 'general', label: '一般' },
  { value: 'human', label: '担当者相談' },
] as const;

interface ContactRevealData {
  readonly redacted: boolean;
  readonly contact: {
    readonly contactChannel: string;
    readonly email: string | null;
    readonly phone: string | null;
    readonly companyName: string | null;
    readonly contactName: string | null;
    readonly preferredChannel: string;
    readonly contactWindow: string;
  } | null;
}

export default function AdminLeadsClient() {
  const [leads, setLeads] = useState<readonly ChatLeadListItem[]>([])
  const [filteredLeads, setFilteredLeads] = useState<readonly ChatLeadListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [revealing, setRevealing] = useState<string | null>(null)
  const [contactModal, setContactModal] = useState<ContactRevealData | null>(null)
  const [filter, setFilter] = useState({
    status: 'all',
    intent: 'all',
  })
  const [searchTerm, setSearchTerm] = useState('')

  const loadLeads = useCallback(async (cancelled = false) => {
    try {
      const json = await fetchLeads();
      if (cancelled) return;
      setLeads(json.data ?? []);
      setFilteredLeads(json.data ?? []);
    } catch (err) {
      console.error('[AdminLeadsClient] Failed to fetch leads:', err);
      if (!cancelled) {
        setLeads([]);
        setFilteredLeads([]);
      }
    } finally {
      if (!cancelled) setLoading(false);
    }
  }, [])

  useEffect(() => {
    let cancelled = false;
    void loadLeads(cancelled);
    return () => { cancelled = true; };
  }, [loadLeads])

  useEffect(() => {
    let filtered = [...leads]

    if (filter.status !== 'all') {
      filtered = filtered.filter(lead => lead.status === filter.status)
    }
    if (filter.intent !== 'all') {
      filtered = filtered.filter(lead => lead.intent === filter.intent)
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.id.toLowerCase().includes(term) ||
        lead.intent.toLowerCase().includes(term) ||
        lead.routeFamily.toLowerCase().includes(term) ||
        lead.status.toLowerCase().includes(term)
      )
    }

    setFilteredLeads(filtered)
  }, [leads, filter, searchTerm])

  const calculateStats = () => {
    const total = filteredLeads.length
    const newLeads = filteredLeads.filter(l => l.status === 'new').length
    const inProgress = filteredLeads.filter(l => l.status === 'in_progress').length
    const won = filteredLeads.filter(l => l.status === 'closed_won').length
    const linked = filteredLeads.filter(l => l.memberLinkageState === 'linked').length

    return { total, newLeads, inProgress, won, linked }
  }

  const stats = calculateStats()

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-purple-100 text-purple-800',
      in_progress: 'bg-indigo-100 text-indigo-800',
      closed_won: 'bg-green-100 text-green-800',
      closed_lost: 'bg-red-100 text-red-800',
      invalid: 'bg-gray-100 text-gray-500',
    }
    return styles[status] ?? 'bg-gray-100 text-gray-600'
  }

  const getIntentLabel = (intent: string) => {
    return INTENT_OPTIONS.find(o => o.value === intent)?.label ?? intent
  }

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    setUpdating(leadId)
    try {
      await updateLeadStatus(leadId, {
        status: newStatus,
        outcome: lead.outcome,
        handoffState: lead.handoffState,
      })
      setLeads(prev => prev.map(l =>
        l.id === leadId ? { ...l, status: newStatus } : l
      ))
    } catch (err) {
      console.error('[AdminLeadsClient] Failed to update status:', err)
    } finally {
      setUpdating(null)
    }
  }

  const handleReveal = async (leadId: string) => {
    setRevealing(leadId)
    try {
      const result = await revealLeadContact(leadId)
      setContactModal({
        redacted: result.redacted,
        contact: result.contact,
      })
    } catch (err) {
      console.error('[AdminLeadsClient] Failed to reveal contact:', err)
      setContactModal({ redacted: false, contact: null })
    } finally {
      setRevealing(null)
    }
  }

  return (
    <PageLoadingState isLoading={loading} message="リードを読み込み中...">
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="w-7 h-7 mr-3 text-navy-600" />
            チャットリード管理
          </h1>
          <p className="text-gray-600 mt-1">
            チャットボット経由の相談リードを管理します。
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: '総リード', value: stats.total, icon: Users, color: 'text-navy-600' },
            { label: '新規', value: stats.newLeads, icon: AlertCircle, color: 'text-blue-600' },
            { label: '対応中', value: stats.inProgress, icon: TrendingUp, color: 'text-indigo-600' },
            { label: '成約', value: stats.won, icon: CheckCircle, color: 'text-green-600' },
            { label: '会員連携', value: stats.linked, icon: User, color: 'text-purple-600' },
          ].map((stat) => (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ID・インテント・ページで検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <select
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">全ステータス</option>
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select
              value={filter.intent}
              onChange={(e) => setFilter(prev => ({ ...prev, intent: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">全インテント</option>
              {INTENT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </Card>

        {/* Leads Table */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">リードID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">インテント</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">ページ</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">連携</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">連絡方法</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">ステータス</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">作成日</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">アクション</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-mono text-xs text-gray-600">
                        {lead.id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        {getIntentLabel(lead.intent)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs text-gray-600">{lead.routeFamily}</div>
                    </td>
                    <td className="py-3 px-4">
                      {lead.memberLinkageState === 'linked' ? (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">連携済み</Badge>
                      ) : lead.memberLinkageState === 'declined' ? (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-500">辞退</Badge>
                      ) : lead.memberLinkageState === 'not_applicable' ? (
                        <span className="text-xs text-gray-400">ゲスト</span>
                      ) : (
                        <span className="text-xs text-gray-400">{lead.memberLinkageState}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {lead.contactChannel === 'email' ? (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                          <Mail className="w-3 h-3 mr-1 inline" />メール
                        </Badge>
                      ) : lead.contactChannel === 'phone' ? (
                        <Badge variant="secondary" className="bg-green-50 text-green-700">
                          <Phone className="w-3 h-3 mr-1 inline" />電話
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                      {lead.contactDisposition === 'redacted' && (
                        <span className="text-xs text-red-500 block">削除済み</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {updating === lead.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <select
                          value={lead.status}
                          onChange={(e) => void handleStatusChange(lead.id, e.target.value)}
                          disabled={updating === lead.id}
                          className="text-xs border border-gray-200 rounded px-2 py-1"
                        >
                          {STATUS_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs text-gray-600">
                        {new Date(lead.createdAt).toLocaleDateString('ja-JP')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void handleReveal(lead.id)}
                        disabled={revealing === lead.id}
                        title="連絡先を開示"
                      >
                        {revealing === lead.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Eye className="w-4 h-4" />}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLeads.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">条件に一致するリードが見つかりません</p>
            </div>
          )}
        </Card>
      </Container>

      {/* Contact Reveal Modal */}
      {contactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setContactModal(null)}>
          <Card className="w-full max-w-md p-6 relative" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <button
              onClick={() => setContactModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold text-gray-900 mb-4">連絡先情報</h3>

            {contactModal.redacted ? (
              <div className="text-center py-6">
                <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">このリードの連絡先は削除されています。</p>
              </div>
            ) : contactModal.contact ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{contactModal.contact.email ?? '-'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{contactModal.contact.phone ?? '-'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{contactModal.contact.companyName ?? '-'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{contactModal.contact.contactName ?? '-'}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                <p className="text-gray-600">連絡先を取得できませんでした。</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
    </PageLoadingState>
  )
}
