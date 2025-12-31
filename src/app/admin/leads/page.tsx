'use client'

import React, { useState, useEffect } from 'react'
import {
  Users, TrendingUp, Calendar, DollarSign,
  Filter, Search, Download, Eye,
  Star, Award, AlertCircle, CheckCircle
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'

interface Lead {
  id: string
  name: string
  company: string
  email: string
  phone: string
  leadScore: number
  leadQuality: 'High' | 'Medium' | 'Standard'
  priorityLevel: 'High' | 'Medium' | 'Normal'
  source: string
  inquiryType: string
  submissionDate: string
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
  calculatedValue?: number
  assignedTo?: string
  followUpDate?: string
  notes: string
}

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    status: 'all',
    quality: 'all',
    source: 'all',
    dateRange: '7days'
  })
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data 제거됨 - 실제 API 호출 필요
  // TODO: /api/admin/leads 엔드포인트에서 데이터 가져오기
  useEffect(() => {
    // API 호출 예시:
    // fetch('/api/admin/leads')
    //   .then(res => res.json())
    //   .then(data => {
    //     setLeads(data.data || [])
    //     setFilteredLeads(data.data || [])
    //   })
    //   .finally(() => setLoading(false))

    // 현재는 빈 배열로 시작
    setLeads([])
    setFilteredLeads([])
    setLoading(false)
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = leads

    // Status filter
    if (filter.status !== 'all') {
      filtered = filtered.filter(lead => lead.status === filter.status)
    }

    // Quality filter
    if (filter.quality !== 'all') {
      filtered = filtered.filter(lead => lead.leadQuality === filter.quality)
    }

    // Source filter
    if (filter.source !== 'all') {
      filtered = filtered.filter(lead => lead.source === filter.source)
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredLeads(filtered)
  }, [leads, filter, searchTerm])

  const calculateStats = () => {
    const totalLeads = filteredLeads.length
    const highQualityLeads = filteredLeads.filter(l => l.leadQuality === 'High').length
    const newLeads = filteredLeads.filter(l => l.status === 'new').length
    const totalValue = filteredLeads.reduce((sum, l) => sum + (l.calculatedValue || 0), 0)
    const avgLeadScore = filteredLeads.length > 0
      ? Math.round(filteredLeads.reduce((sum, l) => sum + l.leadScore, 0) / filteredLeads.length)
      : 0

    return {
      totalLeads,
      highQualityLeads,
      newLeads,
      totalValue,
      avgLeadScore,
      conversionRate: filteredLeads.filter(l => l.status === 'converted').length / totalLeads * 100
    }
  }

  const stats = calculateStats()

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'bg-navy-600 text-navy-600',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-purple-100 text-purple-800',
      converted: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800'
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getQualityBadge = (quality: string) => {
    const styles: Record<string, string> = {
      High: 'bg-red-100 text-red-800',
      Medium: 'bg-brixa-600 text-brixa-600',
      Standard: 'bg-gray-100 text-gray-800'
    }
    return styles[quality] || 'bg-gray-100 text-gray-800'
  }

  const getLeadScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600'
    if (score >= 40) return 'text-brixa-600'
    return 'text-green-600'
  }

  const exportLeads = () => {
    // In real app, this would generate and download a CSV/Excel file
    console.log('Exporting leads...', filteredLeads)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container size="7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lead Management Dashboard
          </h1>
          <p className="text-gray-600">
            Track and manage all incoming leads from multiple channels
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-navy-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">High Quality</p>
                <p className="text-2xl font-bold text-gray-900">{stats.highQualityLeads}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-navy-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">New Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.newLeads}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ¥{(stats.totalValue / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgLeadScore}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search leads by name, company, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
              </select>

              <select
                value={filter.quality}
                onChange={(e) => setFilter({ ...filter, quality: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
              >
                <option value="all">All Quality</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Standard">Standard</option>
              </select>

              <select
                value={filter.source}
                onChange={(e) => setFilter({ ...filter, source: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
              >
                <option value="all">All Sources</option>
                <option value="詳細お問い合わせ">Detailed Inquiry</option>
                <option value="ROI計算">ROI Calculator</option>
                <option value="プレミアムコンテンツ">Premium Content</option>
                <option value="お問い合わせ">General Contact</option>
              </select>

              <Button
                onClick={exportLeads}
                variant="outline"
                className="flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </Card>

        {/* Leads Table */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Lead</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Source</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Value</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Assigned</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Follow-up</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{lead.name}</div>
                        <div className="text-gray-600">{lead.company}</div>
                        <div className="text-xs text-gray-500">{lead.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col items-center">
                        <div className={`text-lg font-bold ${getLeadScoreColor(lead.leadScore)}`}>
                          {lead.leadScore}
                        </div>
                        <Badge className={getQualityBadge(lead.leadQuality)} variant="secondary">
                          {lead.leadQuality}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-900">{lead.source}</div>
                      <div className="text-xs text-gray-500">{lead.inquiryType}</div>
                    </td>
                    <td className="py-4 px-4">
                      {lead.calculatedValue ? (
                        <div className="font-medium text-gray-900">
                          ¥{(lead.calculatedValue / 1000000).toFixed(1)}M
                        </div>
                      ) : (
                        <div className="text-gray-400">-</div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusBadge(lead.status)} variant="secondary">
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-900">{lead.assignedTo || '-'}</div>
                    </td>
                    <td className="py-4 px-4">
                      {lead.followUpDate ? (
                        <div className="text-gray-900">
                          {new Date(lead.followUpDate).toLocaleDateString('ja-JP')}
                        </div>
                      ) : (
                        <div className="text-gray-400">-</div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {lead.status === 'new' && (
                          <Button size="sm" className="bg-navy-600 hover:bg-navy-600">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLeads.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No leads found matching your criteria</p>
            </div>
          )}
        </Card>
      </Container>
    </div>
  )
}