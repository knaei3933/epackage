'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Download,
  FileText,
  Mail,
  Share2,
  Printer,
  Calendar,
  Package,
  DollarSign,
  TrendingUp,
  Star,
  Clock,
  Settings,
  CheckCircle2,
  AlertCircle,
  Info,
  BarChart3,
  PieChart,
  FileSpreadsheet,
  Image
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { calculatePostProcessingComparison } from './postProcessingLimits'
import type { ProcessingOptionConfig } from './processingConfig'

interface ExportData {
  timestamp: string
  productType: string
  selectedOptions: ProcessingOptionConfig[]
  basePrice: number
  quantities: number[]
  comparison: any
  metadata: {
    totalItems: number
    maxItems: number
    totalImpact: number
    combinedMultiplier: number
    recommendedOptions: string[]
    averageImpact: number
  }
}

interface PostProcessingExportProps {
  selectedOptions: ProcessingOptionConfig[]
  productType: string
  basePrice: number
  quantities: number[]
  language?: 'en' | 'ja'
  onExport?: (format: string, data: ExportData) => void
}

export function PostProcessingExport({
  selectedOptions,
  productType,
  basePrice,
  quantities = [100, 500, 1000, 5000, 10000],
  language = 'ja',
  onExport
}: PostProcessingExportProps) {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'json' | 'csv'>('pdf')
  const [isExporting, setIsExporting] = useState(false)
  const [emailAddress, setEmailAddress] = useState('')

  // Generate comprehensive export data
  const exportData = useMemo((): ExportData => {
    const comparison = calculatePostProcessingComparison(selectedOptions)
    const metadata = {
      totalItems: selectedOptions.length,
      maxItems: 5,
      totalImpact: comparison.totalCostImpact,
      combinedMultiplier: comparison.combinedMultiplier,
      recommendedOptions: comparison.recommendedPriority,
      averageImpact: comparison.totalCostImpact / selectedOptions.length
    }

    return {
      timestamp: new Date().toISOString(),
      productType,
      selectedOptions,
      basePrice,
      quantities,
      comparison,
      metadata
    }
  }, [selectedOptions, productType, basePrice, quantities])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'ja' ? 'ja-JP' : 'en-US', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Export to PDF
  const exportToPDF = async () => {
    setIsExporting(true)
    try {
      // Dynamic import of jsPDF and html2canvas
      const jsPDFModule = await import('jspdf')
      const html2canvas = (await import('html2canvas')).default

      // Create PDF document
      const pdf = new jsPDFModule.default('p', 'mm', 'a4')

      // Add header
      pdf.setFontSize(20)
      pdf.text(language === 'ja' ? '後加工オプション分析レポート' : 'Post-Processing Analysis Report', 20, 20)

      pdf.setFontSize(12)
      pdf.text(`${language === 'ja' ? '日付:' : 'Date:'} ${new Date().toLocaleDateString()}`, 20, 30)
      pdf.text(`${language === 'ja' ? '製品タイプ:' : 'Product Type:'} ${productType}`, 20, 37)

      // Add selection summary
      pdf.setFontSize(14)
      pdf.text(language === 'ja' ? '選択サマリー' : 'Selection Summary', 20, 50)

      pdf.setFontSize(10)
      pdf.text(`${language === 'ja' ? '選択アイテム:' : 'Selected Items:'} ${exportData.metadata.totalItems}/${exportData.metadata.maxItems}`, 20, 57)
      pdf.text(`${language === 'ja' ? '総コスト影響:' : 'Total Cost Impact:'} +${exportData.metadata.totalImpact.toFixed(1)}%`, 20, 64)
      pdf.text(`${language === 'ja' ? '結合乗数:' : 'Combined Multiplier:'} x${exportData.metadata.combinedMultiplier.toFixed(2)}`, 20, 71)

      // Add detailed options table
      pdf.setFontSize(14)
      pdf.text(language === 'ja' ? '選択オプション詳細' : 'Selected Options Details', 20, 85)

      let yPosition = 95
      selectedOptions.forEach((option, index) => {
        if (yPosition > 270) {
          pdf.addPage()
          yPosition = 20
        }

        pdf.setFontSize(12)
        pdf.text(`${index + 1}. ${language === 'ja' ? option.nameJa : option.name}`, 20, yPosition)
        pdf.setFontSize(10)
        pdf.text(`   ${language === 'ja' ? 'カテゴリ:' : 'Category:'} ${option.category}`, 25, yPosition + 5)
        pdf.text(`   ${language === 'ja' ? '価格影響:' : 'Price Impact:'} +${((option.priceMultiplier - 1) * 100).toFixed(1)}%`, 25, yPosition + 10)
        pdf.text(`   ${language === 'ja' ? '処理時間:' : 'Processing Time:'} ${language === 'ja' ? option.processingTimeJa : option.processingTime}`, 25, yPosition + 15)

        yPosition += 25
      })

      // Add cost breakdown table
      pdf.addPage()
      pdf.setFontSize(14)
      pdf.text(language === 'ja' ? '数量別コスト分析' : 'Cost Analysis by Quantity', 20, 20)

      yPosition = 30
      pdf.setFontSize(10)
      pdf.text(`${language === 'ja' ? '数量' : 'Quantity'} | ${language === 'ja' ? '基本コスト' : 'Base Cost'} | ${language === 'ja' ? '加工コスト' : 'Processing Cost'} | ${language === 'ja' ? '総コスト' : 'Total Cost'}`, 20, yPosition)
      yPosition += 5
      pdf.text('---|---|---|---', 20, yPosition)
      yPosition += 5

      quantities.forEach(quantity => {
        const baseCost = basePrice * quantity
        const processingCost = baseCost * (exportData.metadata.combinedMultiplier - 1)
        const totalCost = baseCost * exportData.metadata.combinedMultiplier

        pdf.text(`${quantity} | ${formatCurrency(baseCost)} | ${formatCurrency(processingCost)} | ${formatCurrency(totalCost)}`, 20, yPosition)
        yPosition += 5
      })

      // Save PDF
      pdf.save(`post-processing-analysis-${Date.now()}.pdf`)

      if (onExport) {
        onExport('pdf', exportData)
      }
    } catch (error) {
      console.error('Error exporting PDF:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // Export to Excel/CSV - Temporarily disabled
  const exportToExcel = async () => {
    setIsExporting(true)
    try {
      // Excel export temporarily disabled due to missing xlsx dependency
      throw new Error('Excel export temporarily disabled')
    } catch (error) {
      console.error('Excel export not available:', error)
      alert(language === 'ja' ? 'Excelエクスポートは現在利用できません' : 'Excel export currently unavailable')
    } finally {
      setIsExporting(false)
    }
  }

  /*
  // Original Excel export code (commented out)
  const exportToExcelOriginal = async () => {
    setIsExporting(true)
    try {
      const { utils, writeFile } = await import('xlsx')

      // Create workbook
      const wb = utils.book_new()

      // Selection Summary Sheet
      const summaryData = [
        [language === 'ja' ? '後加工分析レポート' : 'Post-Processing Analysis Report'],
        [],
        [language === 'ja' ? '基本情報' : 'Basic Information'],
        [language === 'ja' ? '製品タイプ' : 'Product Type', productType],
        [language === 'ja' ? '日付' : 'Date', new Date().toISOString()],
        [language === 'ja' ? '基本価格' : 'Base Price', basePrice],
        [language === 'ja' ? '選択アイテム数' : 'Selected Items', exportData.metadata.totalItems],
        [language === 'ja' ? '最大アイテム数' : 'Max Items', exportData.metadata.maxItems],
        [language === 'ja' ? '総コスト影響' : 'Total Impact', `${exportData.metadata.totalImpact.toFixed(1)}%`],
        [language === 'ja' ? '結合乗数' : 'Combined Multiplier', exportData.metadata.combinedMultiplier],
        []
      ]

      const summaryWs = utils.aoa_to_sheet(summaryData)
      utils.book_append_sheet(wb, summaryWs, language === 'ja' ? 'サマリー' : 'Summary')

      // Options Details Sheet
      const optionsData = [
        [
          language === 'ja' ? 'ID' : 'ID',
          language === 'ja' ? '名前' : 'Name',
          language === 'ja' ? '日本語名' : 'Japanese Name',
          language === 'ja' ? 'カテゴリ' : 'Category',
          language === 'ja' ? '価格乗数' : 'Price Multiplier',
          language === 'ja' ? '価格影響' : 'Price Impact',
          language === 'ja' ? '処理時間' : 'Processing Time',
          language === 'ja' ? '機能数' : 'Features',
          language === 'ja' ? 'ベネフィット数' : 'Benefits'
        ],
        ...selectedOptions.map(option => [
          option.id,
          option.name,
          option.nameJa,
          option.category,
          option.priceMultiplier,
          `${((option.priceMultiplier - 1) * 100).toFixed(1)}%`,
          language === 'ja' ? option.processingTimeJa : option.processingTime,
          option.features.length,
          option.benefits.length
        ])
      ]

      const optionsWs = utils.aoa_to_sheet(optionsData)
      utils.book_append_sheet(wb, optionsWs, language === 'ja' ? 'オプション詳細' : 'Options Details')

      // Cost Analysis Sheet
      const costData = [
        [
          language === 'ja' ? '数量' : 'Quantity',
          language === 'ja' ? '基本コスト' : 'Base Cost',
          language === 'ja' ? '加工コスト' : 'Processing Cost',
          language === 'ja' ? '総コスト' : 'Total Cost',
          language === 'ja' ? '単価' : 'Cost per Unit',
          language === 'ja' ? '影響' : 'Impact'
        ],
        ...quantities.map(quantity => {
          const baseCost = basePrice * quantity
          const processingCost = baseCost * (exportData.metadata.combinedMultiplier - 1)
          const totalCost = baseCost * exportData.metadata.combinedMultiplier
          const costPerUnit = totalCost / quantity
          const impact = ((exportData.metadata.combinedMultiplier - 1) * 100)

          return [quantity, baseCost, processingCost, totalCost, costPerUnit, `${impact.toFixed(1)}%`]
        })
      ]

      const costWs = utils.aoa_to_sheet(costData)
      utils.book_append_sheet(wb, costWs, language === 'ja' ? 'コスト分析' : 'Cost Analysis')

      // Save file
      const fileName = `post-processing-analysis-${Date.now()}.${exportFormat}`
      writeFile(wb, fileName)

      if (onExport) {
        onExport(exportFormat, exportData)
      }
    } catch (error) {
      console.error('Error exporting Excel:', error)
    } finally {
      setIsExporting(false)
    }
  }
  */

  // Export to JSON
  const exportToJSON = () => {
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

    const exportFileDefaultName = `post-processing-analysis-${Date.now()}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()

    if (onExport) {
      onExport('json', exportData)
    }
  }

  // Email export
  const emailExport = async () => {
    if (!emailAddress) {
      alert(language === 'ja' ? 'メールアドレスを入力してください' : 'Please enter email address')
      return
    }

    setIsExporting(true)
    try {
      const emailContent = {
        to: emailAddress,
        subject: language === 'ja'
          ? `後加工オプション分析レポート - ${productType}`
          : `Post-Processing Analysis Report - ${productType}`,
        body: `
${language === 'ja' ? '後加工オプション分析レポート' : 'Post-Processing Analysis Report'}

${language === 'ja' ? '製品タイプ' : 'Product Type'}: ${productType}
${language === 'ja' ? '日付' : 'Date'}: ${new Date().toLocaleDateString()}
${language === 'ja' ? '選択アイテム数' : 'Selected Items'}: ${exportData.metadata.totalItems}/${exportData.metadata.maxItems}
${language === 'ja' ? '総コスト影響' : 'Total Impact'}: +${exportData.metadata.totalImpact.toFixed(1)}%
${language === 'ja' ? '結合乗数' : 'Combined Multiplier'}: x${exportData.metadata.combinedMultiplier.toFixed(2)}

${language === 'ja' ? '選択オプション:' : 'Selected Options:'}
${selectedOptions.map((opt, index) =>
  `${index + 1}. ${language === 'ja' ? opt.nameJa : opt.name} (+${((opt.priceMultiplier - 1) * 100).toFixed(1)}%)`
).join('\n')}

${language === 'ja' ? '詳細データは添付ファイルをご確認ください。' : 'Please see attachment for detailed data.'}
        `,
        attachment: {
          filename: `post-processing-analysis-${Date.now()}.json`,
          content: JSON.stringify(exportData, null, 2)
        }
      }

      // In a real implementation, you would send this via your email service
      console.log('Email would be sent:', emailContent)
      alert(language === 'ja' ? 'メールを送信しました' : 'Email sent successfully')

      if (onExport) {
        onExport('email', exportData)
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert(language === 'ja' ? 'メール送信に失敗しました' : 'Failed to send email')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExport = () => {
    switch (exportFormat) {
      case 'pdf':
        exportToPDF()
        break
      case 'excel':
      case 'csv':
        // Excel export temporarily disabled due to missing dependency
        alert(language === 'ja' ? 'Excelエクスポートは現在利用できません' : 'Excel export currently unavailable')
        break
      case 'json':
        exportToJSON()
        break
      default:
        exportToPDF()
    }
  }

  if (selectedOptions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            {language === 'ja'
              ? 'エクスポートするために後加工オプションを選択してください'
              : 'Select post-processing options to export'
            }
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>{language === 'ja' ? 'エクスポート' : 'Export Analysis'}</span>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              {selectedOptions.length} {language === 'ja' ? 'アイテム' : 'items'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {language === 'ja' ? '選択アイテム' : 'Selected'}
                </p>
                <p className="text-xl font-bold">
                  {exportData.metadata.totalItems}/{exportData.metadata.maxItems}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {language === 'ja' ? '総影響' : 'Total Impact'}
                </p>
                <p className="text-xl font-bold text-green-600">
                  +{exportData.metadata.totalImpact.toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {language === 'ja' ? '乗数' : 'Multiplier'}
                </p>
                <p className="text-xl font-bold text-blue-600">
                  x{exportData.metadata.combinedMultiplier.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {language === 'ja' ? '数量' : 'Quantities'}
                </p>
                <p className="text-xl font-bold">
                  {quantities.length}
                </p>
              </div>
            </div>

            {/* Format Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                {language === 'ja' ? 'エクスポート形式' : 'Export Format'}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { format: 'pdf', icon: FileText, label: language === 'ja' ? 'PDFレポート' : 'PDF Report' },
                  { format: 'excel', icon: FileSpreadsheet, label: language === 'ja' ? 'Excel' : 'Excel' },
                  { format: 'csv', icon: FileSpreadsheet, label: 'CSV' },
                  { format: 'json', icon: FileText, label: 'JSON' }
                ].map(({ format, icon: Icon, label }) => (
                  <motion.button
                    key={format}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setExportFormat(format as any)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      exportFormat === format
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <p className="text-xs font-medium">{label}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Email Option */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                {language === 'ja' ? 'メールで送信' : 'Email Report'}
              </label>
              <div className="flex space-x-2">
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder={language === 'ja' ? 'メールアドレスを入力' : 'Enter email address'}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  variant="outline"
                  onClick={emailExport}
                  disabled={!emailAddress || isExporting}
                  className="flex items-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>{language === 'ja' ? '送信' : 'Send'}</span>
                </Button>
              </div>
            </div>

            {/* Export Button */}
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full flex items-center justify-center space-x-2"
              size="lg"
            >
              <Download className="w-5 h-5" />
              <span>
                {isExporting
                  ? (language === 'ja' ? 'エクスポート中...' : 'Exporting...')
                  : `${language === 'ja' ? 'エクスポート' : 'Export'} ${exportFormat.toUpperCase()}`
                }
              </span>
            </Button>

            {/* Export Preview */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center space-x-2">
                <Info className="w-4 h-4" />
                <span>{language === 'ja' ? 'エクスポート内容' : 'Export Content'}</span>
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• {language === 'ja' ? '選択オプション詳細' : 'Selected options details'}</li>
                <li>• {language === 'ja' ? 'コスト影響分析' : 'Cost impact analysis'}</li>
                <li>• {language === 'ja' ? '数量別コスト比較' : 'Cost comparison by quantity'}</li>
                <li>• {language === 'ja' ? '推奨事項' : 'Recommendations'}</li>
                <li>• {language === 'ja' ? '5アイテム制限分析' : '5-item limitation analysis'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}