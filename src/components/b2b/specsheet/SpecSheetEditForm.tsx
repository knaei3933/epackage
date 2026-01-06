'use client';

/**
 * Specification Sheet Edit Form Component
 *
 * 仕様書編集フォームコンポーネント
 * - B2B作業標準書(仕様書)のデータを確認・編集
 * - タブ形式で各セクションを整理
 * - 日本語・英語バイリンガル対応
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import {
  Save,
  FileText,
  Download,
  Eye,
  Settings,
  Package,
  Sliders,
  Target,
  Factory,
  Palette,
  DollarSign,
  User,
  Building2,
  Plus,
  Trash2,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import type {
  SpecSheetData,
  SpecSheetCategory,
  SpecSheetStatus,
} from '@/types/specsheet';

// ============================================================
// Types
// ============================================================

interface SpecSheetEditFormProps {
  initialData?: Partial<SpecSheetData>;
  onSave?: (data: SpecSheetData) => Promise<boolean>;
  onPreview?: (data: SpecSheetData) => void;
  readOnly?: boolean;
}

type TabId =
  | 'basic'
  | 'product'
  | 'production'
  | 'quality'
  | 'design'
  | 'pricing';

interface TabConfig {
  id: TabId;
  label: string;
  labelJa: string;
  icon: React.ComponentType<{ className?: string }>;
}

// ============================================================
// Tab Configuration
// ============================================================

const TABS: TabConfig[] = [
  {
    id: 'basic',
    label: 'Basic Information',
    labelJa: '基本情報',
    icon: FileText,
  },
  {
    id: 'product',
    label: 'Product Specifications',
    labelJa: '製品仕様',
    icon: Package,
  },
  {
    id: 'production',
    label: 'Production Specifications',
    labelJa: '生産仕様',
    icon: Factory,
  },
  {
    id: 'quality',
    label: 'Quality Standards',
    labelJa: '品質基準',
    icon: Target,
  },
  {
    id: 'design',
    label: 'Design Specifications',
    labelJa: 'デザイン仕様',
    icon: Palette,
  },
  {
    id: 'pricing',
    label: 'Pricing Information',
    labelJa: '価格情報',
    icon: DollarSign,
  },
];

// ============================================================
// Component
// ============================================================

export default function SpecSheetEditForm({
  initialData,
  onSave,
  onPreview,
  readOnly = false,
}: SpecSheetEditFormProps) {
  // Active tab
  const [activeTab, setActiveTab] = useState<TabId>('basic');

  // Form state
  const [specNumber, setSpecNumber] = useState(initialData?.specNumber || '');
  const [revision, setRevision] = useState(initialData?.revision || '1.0');
  const [issueDate, setIssueDate] = useState(
    initialData?.issueDate || new Date().toISOString().split('T')[0]
  );
  const [validUntil, setValidUntil] = useState(
    initialData?.validUntil || ''
  );
  const [status, setStatus] = useState<SpecSheetCategory>(
    initialData?.category || 'bag'
  );
  const [sheetStatus, setSheetStatus] = useState<SpecSheetStatus>(
    initialData?.status || 'draft'
  );
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');

  // Customer information
  const [customerName, setCustomerName] = useState(
    initialData?.customer?.name || ''
  );
  const [customerDepartment, setCustomerDepartment] = useState(
    initialData?.customer?.department || ''
  );
  const [customerContact, setCustomerContact] = useState(
    initialData?.customer?.contactPerson || ''
  );
  const [customerPhone, setCustomerPhone] = useState(
    initialData?.customer?.contact?.phone || ''
  );
  const [customerEmail, setCustomerEmail] = useState(
    initialData?.customer?.contact?.email || ''
  );

  // Product specifications
  const [productName, setProductName] = useState(
    initialData?.product?.name || ''
  );
  const [productNameKana, setProductNameKana] = useState(
    initialData?.product?.nameKana || ''
  );
  const [productCode, setProductCode] = useState(
    initialData?.product?.productCode || ''
  );

  // Dimensions
  const [dimLength, setDimLength] = useState(
    initialData?.product?.dimensions.length?.toString() || ''
  );
  const [dimWidth, setDimWidth] = useState(
    initialData?.product?.dimensions.width?.toString() || ''
  );
  const [dimHeight, setDimHeight] = useState(
    initialData?.product?.dimensions.height?.toString() || ''
  );
  const [dimThickness, setDimThickness] = useState(
    initialData?.product?.dimensions.thickness?.toString() || ''
  );
  const [dimOpening, setDimOpening] = useState(
    initialData?.product?.dimensions.opening?.toString() || ''
  );
  const [dimTolerance, setDimTolerance] = useState(
    initialData?.product?.dimensions.tolerance || ''
  );

  // Materials
  const [materials, setMaterials] = useState(
    initialData?.product?.materials || [
      { layer: 1, material: 'PET', thickness: 12, function: '外層・印刷面' },
    ]
  );
  const [newMaterial, setNewMaterial] = useState({
    layer: materials.length + 1,
    material: '',
    thickness: '',
    function: '',
  });

  // Specifications
  const [application, setApplication] = useState(
    initialData?.product?.specifications.application || ''
  );
  const [heatResistance, setHeatResistance] = useState(
    initialData?.product?.specifications.heatResistance || ''
  );
  const [coldResistance, setColdResistance] = useState(
    initialData?.product?.specifications.coldResistance || ''
  );
  const [transparency, setTransparency] = useState<string>(
    initialData?.product?.specifications.transparency || 'opaque'
  );
  const [waterResistance, setWaterResistance] = useState(
    initialData?.product?.specifications.waterResistance ?? false
  );
  const [airTightness, setAirTightness] = useState(
    initialData?.product?.specifications.airTightness ?? false
  );
  const [moistureResistance, setMoistureResistance] = useState(
    initialData?.product?.specifications.moistureResistance ?? false
  );
  const [antistatic, setAntistatic] = useState(
    initialData?.product?.specifications.antistatic ?? false
  );
  const [uvProtection, setUvProtection] = useState(
    initialData?.product?.specifications.uvProtection ?? false
  );
  const [features, setFeatures] = useState(
    initialData?.product?.specifications.features?.join('\n') || ''
  );

  // Performance
  const [tensileStrength, setTensileStrength] = useState(
    initialData?.product?.performance?.tensileStrength || ''
  );
  const [tearStrength, setTearStrength] = useState(
    initialData?.product?.performance?.tearStrength || ''
  );
  const [sealStrength, setSealStrength] = useState(
    initialData?.product?.performance?.sealStrength || ''
  );
  const [wvtr, setWvtr] = useState(initialData?.product?.performance?.wvtr || '');
  const [otr, setOtr] = useState(initialData?.product?.performance?.otr || '');

  // Compliance
  const [foodSanitationAct, setFoodSanitationAct] = useState(
    initialData?.product?.compliance?.foodSanitationAct ?? false
  );
  const [jisStandards, setJisStandards] = useState(
    initialData?.product?.compliance?.jisStandards?.join(', ') || ''
  );
  const [isoStandards, setIsoStandards] = useState(
    initialData?.product?.compliance?.isoStandards?.join(', ') || ''
  );
  const [otherStandards, setOtherStandards] = useState(
    initialData?.product?.compliance?.otherStandards?.join(', ') || ''
  );

  // Production
  const [productionMethod, setProductionMethod] = useState(
    initialData?.production?.method || ''
  );
  const [process, setProcess] = useState(
    initialData?.production?.process?.join('\n') || ''
  );
  const [inspectionStandards, setInspectionStandards] = useState(
    initialData?.production?.qualityControl.inspectionStandards?.join('\n') || ''
  );
  const [aqlStandards, setAqlStandards] = useState(
    initialData?.production?.qualityControl.aqlStandards || ''
  );
  const [packagingUnit, setPackagingUnit] = useState(
    initialData?.production?.packaging.unit || '個'
  );
  const [packagingQuantity, setPackagingQuantity] = useState(
    initialData?.production?.packaging.quantity?.toString() || '1000'
  );
  const [packingSpec, setPackingSpec] = useState(
    initialData?.production?.packaging.packingSpec || ''
  );
  const [leadTime, setLeadTime] = useState(
    initialData?.production?.delivery.leadTime || ''
  );
  const [minLotSize, setMinLotSize] = useState(
    initialData?.production?.delivery.minLotSize?.toString() || '5000'
  );
  const [lotUnit, setLotUnit] = useState(
    initialData?.production?.delivery.lotUnit || '個'
  );

  // Design
  const [printingMethod, setPrintingMethod] = useState<string>(
    initialData?.design?.printing?.method || 'none'
  );
  const [printingColors, setPrintingColors] = useState(
    initialData?.design?.printing?.colors?.toString() || '0'
  );
  const [printingSides, setPrintingSides] = useState<string>(
    initialData?.design?.printing?.sides || 'front'
  );
  const [baseColors, setBaseColors] = useState(
    initialData?.design?.colorGuide?.baseColors?.join(', ') || ''
  );
  const [spotColors, setSpotColors] = useState(
    initialData?.design?.colorGuide?.spotColors?.join(', ') || ''
  );

  // Pricing
  const [unitPrice, setUnitPrice] = useState(
    initialData?.pricing?.basePrice.unitPrice?.toString() || ''
  );
  const [currency, setCurrency] = useState<'JPY' | 'USD'>(
    initialData?.pricing?.basePrice.currency || 'JPY'
  );
  const [moq, setMoq] = useState(
    initialData?.pricing?.basePrice.moq?.toString() || '5000'
  );
  const [volumeDiscount, setVolumeDiscount] = useState(
    initialData?.pricing?.volumeDiscount
      ?.map(d => `${d.quantity}個: ${(d.discountRate * 100).toFixed(1)}%`)
      .join('\n') || ''
  );

  // Remarks
  const [remarks, setRemarks] = useState(initialData?.remarks || '');

  // Status
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // ============================================================
  // Handlers
  // ============================================================

  const addMaterial = useCallback(() => {
    if (newMaterial.material) {
      setMaterials(prev => [
        ...prev,
        {
          layer: prev.length + 1,
          material: newMaterial.material,
          thickness: newMaterial.thickness ? parseFloat(newMaterial.thickness) : undefined,
          function: newMaterial.function || undefined,
        },
      ]);
      setNewMaterial({
        layer: materials.length + 2,
        material: '',
        thickness: '',
        function: '',
      });
    }
  }, [newMaterial, materials.length]);

  const removeMaterial = useCallback((index: number) => {
    setMaterials(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = useCallback(async () => {
    if (readOnly) return;

    setIsSaving(true);
    setSaveStatus({ type: null, message: '' });

    try {
      // Build SpecSheetData
      const data: SpecSheetData = {
        specNumber,
        revision,
        issueDate,
        validUntil: validUntil || undefined,
        status: sheetStatus,
        category: status,
        title,
        description: description || undefined,
        customer: {
          name: customerName,
          department: customerDepartment || undefined,
          contactPerson: customerContact,
          contact: {
            phone: customerPhone || undefined,
            email: customerEmail || undefined,
          },
        },
        product: {
          id: initialData?.product?.id || `PROD-${Date.now()}`,
          name: productName,
          nameKana: productNameKana || undefined,
          productCode,
          category: status,
          dimensions: {
            length: dimLength ? parseFloat(dimLength) : undefined,
            width: dimWidth ? parseFloat(dimWidth) : undefined,
            height: dimHeight ? parseFloat(dimHeight) : undefined,
            thickness: dimThickness ? parseFloat(dimThickness) : undefined,
            opening: dimOpening ? parseFloat(dimOpening) : undefined,
            tolerance: dimTolerance || undefined,
          },
          materials,
          specifications: {
            application: application || undefined,
            heatResistance: heatResistance || undefined,
            coldResistance: coldResistance || undefined,
            transparency: transparency as "transparent" | "opaque" | "translucent" | undefined,
            waterResistance,
            airTightness,
            moistureResistance,
            antistatic,
            uvProtection,
            features: features ? features.split('\n').filter(f => f.trim()) : undefined,
          },
          performance:
            tensileStrength || tearStrength || sealStrength || wvtr || otr
              ? {
                  tensileStrength: tensileStrength || undefined,
                  tearStrength: tearStrength || undefined,
                  sealStrength: sealStrength || undefined,
                  wvtr: wvtr || undefined,
                  otr: otr || undefined,
                }
              : undefined,
          compliance:
          foodSanitationAct ||
          jisStandards ||
          isoStandards ||
          otherStandards
              ? {
                  foodSanitationAct,
                  jisStandards: jisStandards ? jisStandards.split(',').map(s => s.trim()) : undefined,
                  isoStandards: isoStandards ? isoStandards.split(',').map(s => s.trim()) : undefined,
                  otherStandards: otherStandards ? otherStandards.split(',').map(s => s.trim()) : undefined,
                }
              : undefined,
        },
        production: {
          method: productionMethod,
          process: process ? process.split('\n').filter(p => p.trim()) : [],
          qualityControl: {
            inspectionStandards: inspectionStandards ? inspectionStandards.split('\n').filter(s => s.trim()) : [],
            aqlStandards: aqlStandards || undefined,
          },
          packaging: {
            unit: packagingUnit,
            quantity: parseInt(packagingQuantity) || 1000,
            packingSpec,
          },
          delivery: {
            leadTime,
            minLotSize: parseInt(minLotSize) || 5000,
            lotUnit,
          },
        },
        design:
          printingMethod !== 'none' ||
          baseColors ||
          spotColors
            ? {
                printing:
                  printingMethod !== 'none'
                    ? {
                        method: printingMethod as "offset" | "none" | "digital" | "gravure" | "flexo",
                        colors: parseInt(printingColors) || 0,
                        sides: printingSides as "both" | "front" | "back",
                      }
                    : undefined,
                colorGuide:
                  baseColors || spotColors
                    ? {
                        baseColors: baseColors ? baseColors.split(',').map(c => c.trim()) : undefined,
                        spotColors: spotColors ? spotColors.split(',').map(c => c.trim()) : undefined,
                      }
                    : undefined,
              }
            : undefined,
        pricing: unitPrice
          ? {
              basePrice: {
                unitPrice: parseFloat(unitPrice) || 0,
                moq: parseInt(moq) || 5000,
                currency,
              },
              volumeDiscount: volumeDiscount
                ? volumeDiscount.split('\n').filter(d => d.trim()).map(d => {
                    const [qty, rate] = d.split(':');
                    const quantity = parseInt(qty.replace(/[個枚]/g, '')) || 0;
                    const discountRate = parseFloat(rate.replace(/[%]/g, '')) / 100 || 0;
                    return { quantity, discountRate };
                  })
                : undefined,
              validityPeriod: '発行日から90日間',
            }
          : undefined,
        remarks: remarks || undefined,
      };

      if (onSave) {
        const success = await onSave(data);
        if (success) {
          setSaveStatus({
            type: 'success',
            message: '仕様書を保存しました',
          });
        } else {
          setSaveStatus({
            type: 'error',
            message: '保存に失敗しました',
          });
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus({
        type: 'error',
        message: '保存中にエラーが発生しました',
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    specNumber,
    revision,
    issueDate,
    validUntil,
    sheetStatus,
    status,
    title,
    description,
    customerName,
    customerDepartment,
    customerContact,
    customerPhone,
    customerEmail,
    productName,
    productNameKana,
    productCode,
    dimLength,
    dimWidth,
    dimHeight,
    dimThickness,
    dimOpening,
    dimTolerance,
    materials,
    application,
    heatResistance,
    coldResistance,
    transparency,
    waterResistance,
    airTightness,
    moistureResistance,
    antistatic,
    uvProtection,
    features,
    tensileStrength,
    tearStrength,
    sealStrength,
    wvtr,
    otr,
    foodSanitationAct,
    jisStandards,
    isoStandards,
    otherStandards,
    productionMethod,
    process,
    inspectionStandards,
    aqlStandards,
    packagingUnit,
    packagingQuantity,
    packingSpec,
    leadTime,
    minLotSize,
    lotUnit,
    printingMethod,
    printingColors,
    printingSides,
    baseColors,
    spotColors,
    unitPrice,
    currency,
    moq,
    volumeDiscount,
    remarks,
    initialData,
    onSave,
    readOnly,
  ]);

  const handlePreview = useCallback(() => {
    if (onPreview) {
      // Build data similar to handleSave
      const data: SpecSheetData = {
        specNumber,
        revision,
        issueDate,
        validUntil: validUntil || undefined,
        status: sheetStatus,
        category: status,
        title,
        description: description || undefined,
        customer: {
          name: customerName,
          department: customerDepartment || undefined,
          contactPerson: customerContact,
          contact: {
            phone: customerPhone || undefined,
            email: customerEmail || undefined,
          },
        },
        product: {
          id: initialData?.product?.id || 'PROD-preview',
          name: productName,
          nameKana: productNameKana || undefined,
          productCode,
          category: status,
          dimensions: {
            length: dimLength ? parseFloat(dimLength) : undefined,
            width: dimWidth ? parseFloat(dimWidth) : undefined,
            height: dimHeight ? parseFloat(dimHeight) : undefined,
            thickness: dimThickness ? parseFloat(dimThickness) : undefined,
            opening: dimOpening ? parseFloat(dimOpening) : undefined,
            tolerance: dimTolerance || undefined,
          },
          materials,
          specifications: {
            application: application || undefined,
            heatResistance: heatResistance || undefined,
            coldResistance: coldResistance || undefined,
            transparency: transparency as "transparent" | "opaque" | "translucent" | undefined,
            waterResistance,
            airTightness,
            moistureResistance,
            antistatic,
            uvProtection,
            features: features ? features.split('\n').filter(f => f.trim()) : undefined,
          },
          performance: undefined,
          compliance: undefined,
        },
        production: {
          method: productionMethod,
          process: process ? process.split('\n').filter(p => p.trim()) : [],
          qualityControl: {
            inspectionStandards: inspectionStandards ? inspectionStandards.split('\n').filter(s => s.trim()) : [],
            aqlStandards: aqlStandards || undefined,
          },
          packaging: {
            unit: packagingUnit,
            quantity: parseInt(packagingQuantity) || 1000,
            packingSpec,
          },
          delivery: {
            leadTime,
            minLotSize: parseInt(minLotSize) || 5000,
            lotUnit,
          },
        },
      };
      onPreview(data);
    }
  }, [
    specNumber,
    revision,
    issueDate,
    validUntil,
    sheetStatus,
    status,
    title,
    description,
    customerName,
    customerDepartment,
    customerContact,
    customerPhone,
    customerEmail,
    productName,
    productNameKana,
    productCode,
    dimLength,
    dimWidth,
    dimHeight,
    dimThickness,
    dimOpening,
    dimTolerance,
    materials,
    application,
    heatResistance,
    coldResistance,
    transparency,
    waterResistance,
    airTightness,
    moistureResistance,
    antistatic,
    uvProtection,
    features,
    productionMethod,
    process,
    inspectionStandards,
    aqlStandards,
    packagingUnit,
    packagingQuantity,
    packingSpec,
    leadTime,
    minLotSize,
    lotUnit,
    initialData,
    onPreview,
  ]);

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            仕様書編集フォーム
          </h1>
          <p className="text-gray-600 mt-1">
            {specNumber || '新規仕様書'} - {title || 'タイトルなし'}
          </p>
        </div>
        <div className="flex gap-2">
          {onPreview && (
            <Button
              variant="outline"
              onClick={handlePreview}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              プレビュー
            </Button>
          )}
          {!readOnly && (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? '保存中...' : '保存'}
            </Button>
          )}
        </div>
      </div>

      {/* Status Message */}
      {saveStatus.type && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 ${
            saveStatus.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {saveStatus.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {saveStatus.message}
          <button
            onClick={() => setSaveStatus({ type: null, message: '' })}
            className="ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-2 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.labelJa}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'basic' && (
          <BasicInfoTab
            specNumber={specNumber}
            setSpecNumber={setSpecNumber}
            revision={revision}
            setRevision={setRevision}
            issueDate={issueDate}
            setIssueDate={setIssueDate}
            validUntil={validUntil}
            setValidUntil={setValidUntil}
            status={status}
            setStatus={setStatus}
            sheetStatus={sheetStatus}
            setSheetStatus={setSheetStatus}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerDepartment={customerDepartment}
            setCustomerDepartment={setCustomerDepartment}
            customerContact={customerContact}
            setCustomerContact={setCustomerContact}
            customerPhone={customerPhone}
            setCustomerPhone={setCustomerPhone}
            customerEmail={customerEmail}
            setCustomerEmail={setCustomerEmail}
            readOnly={readOnly}
          />
        )}

        {activeTab === 'product' && (
          <ProductSpecTab
            productName={productName}
            setProductName={setProductName}
            productNameKana={productNameKana}
            setProductNameKana={setProductNameKana}
            productCode={productCode}
            setProductCode={setProductCode}
            dimLength={dimLength}
            setDimLength={setDimLength}
            dimWidth={dimWidth}
            setDimWidth={setDimWidth}
            dimHeight={dimHeight}
            setDimHeight={setDimHeight}
            dimThickness={dimThickness}
            setDimThickness={setDimThickness}
            dimOpening={dimOpening}
            setDimOpening={setDimOpening}
            dimTolerance={dimTolerance}
            setDimTolerance={setDimTolerance}
            materials={materials}
            setMaterials={setMaterials}
            newMaterial={newMaterial}
            setNewMaterial={setNewMaterial}
            addMaterial={addMaterial}
            removeMaterial={removeMaterial}
            application={application}
            setApplication={setApplication}
            heatResistance={heatResistance}
            setHeatResistance={setHeatResistance}
            coldResistance={coldResistance}
            setColdResistance={setColdResistance}
            transparency={transparency}
            setTransparency={setTransparency}
            waterResistance={waterResistance}
            setWaterResistance={setWaterResistance}
            airTightness={airTightness}
            setAirTightness={setAirTightness}
            moistureResistance={moistureResistance}
            setMoistureResistance={setMoistureResistance}
            antistatic={antistatic}
            setAntistatic={setAntistatic}
            uvProtection={uvProtection}
            setUvProtection={setUvProtection}
            features={features}
            setFeatures={setFeatures}
            tensileStrength={tensileStrength}
            setTensileStrength={setTensileStrength}
            tearStrength={tearStrength}
            setTearStrength={setTearStrength}
            sealStrength={sealStrength}
            setSealStrength={setSealStrength}
            wvtr={wvtr}
            setWvtr={setWvtr}
            otr={otr}
            setOtr={setOtr}
            foodSanitationAct={foodSanitationAct}
            setFoodSanitationAct={setFoodSanitationAct}
            jisStandards={jisStandards}
            setJisStandards={setJisStandards}
            isoStandards={isoStandards}
            setIsoStandards={setIsoStandards}
            otherStandards={otherStandards}
            setOtherStandards={setOtherStandards}
            readOnly={readOnly}
          />
        )}

        {activeTab === 'production' && (
          <ProductionSpecTab
            productionMethod={productionMethod}
            setProductionMethod={setProductionMethod}
            process={process}
            setProcess={setProcess}
            inspectionStandards={inspectionStandards}
            setInspectionStandards={setInspectionStandards}
            aqlStandards={aqlStandards}
            setAqlStandards={setAqlStandards}
            packagingUnit={packagingUnit}
            setPackagingUnit={setPackagingUnit}
            packagingQuantity={packagingQuantity}
            setPackagingQuantity={setPackagingQuantity}
            packingSpec={packingSpec}
            setPackingSpec={setPackingSpec}
            leadTime={leadTime}
            setLeadTime={setLeadTime}
            minLotSize={minLotSize}
            setMinLotSize={setMinLotSize}
            lotUnit={lotUnit}
            setLotUnit={setLotUnit}
            readOnly={readOnly}
          />
        )}

        {activeTab === 'quality' && (
          <QualityStandardsTab
            inspectionStandards={inspectionStandards}
            setInspectionStandards={setInspectionStandards}
            aqlStandards={aqlStandards}
            setAqlStandards={setAqlStandards}
            readOnly={readOnly}
          />
        )}

        {activeTab === 'design' && (
          <DesignSpecTab
            printingMethod={printingMethod}
            setPrintingMethod={setPrintingMethod}
            printingColors={printingColors}
            setPrintingColors={setPrintingColors}
            printingSides={printingSides}
            setPrintingSides={setPrintingSides}
            baseColors={baseColors}
            setBaseColors={setBaseColors}
            spotColors={spotColors}
            setSpotColors={setSpotColors}
            readOnly={readOnly}
          />
        )}

        {activeTab === 'pricing' && (
          <PricingTab
            unitPrice={unitPrice}
            setUnitPrice={setUnitPrice}
            currency={currency}
            setCurrency={setCurrency}
            moq={moq}
            setMoq={setMoq}
            volumeDiscount={volumeDiscount}
            setVolumeDiscount={setVolumeDiscount}
            readOnly={readOnly}
          />
        )}
      </div>

      {/* Remarks */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">備考 / Remarks</h3>
        <textarea
          value={remarks}
          onChange={e => setRemarks(e.target.value)}
          disabled={readOnly}
          rows={4}
          className="w-full p-3 border rounded-lg resize-none"
          placeholder="備考や特記事項を入力してください..."
        />
      </Card>
    </div>
  );
}

// ============================================================
// Tab Components
// ============================================================

interface BasicInfoTabProps {
  specNumber: string;
  setSpecNumber: (v: string) => void;
  revision: string;
  setRevision: (v: string) => void;
  issueDate: string;
  setIssueDate: (v: string) => void;
  validUntil: string;
  setValidUntil: (v: string) => void;
  status: SpecSheetCategory;
  setStatus: (v: SpecSheetCategory) => void;
  sheetStatus: SpecSheetStatus;
  setSheetStatus: (v: SpecSheetStatus) => void;
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  customerName: string;
  setCustomerName: (v: string) => void;
  customerDepartment: string;
  setCustomerDepartment: (v: string) => void;
  customerContact: string;
  setCustomerContact: (v: string) => void;
  customerPhone: string;
  setCustomerPhone: (v: string) => void;
  customerEmail: string;
  setCustomerEmail: (v: string) => void;
  readOnly: boolean;
}

function BasicInfoTab({
  specNumber,
  setSpecNumber,
  revision,
  setRevision,
  issueDate,
  setIssueDate,
  validUntil,
  setValidUntil,
  status,
  setStatus,
  sheetStatus,
  setSheetStatus,
  title,
  setTitle,
  description,
  setDescription,
  customerName,
  setCustomerName,
  customerDepartment,
  setCustomerDepartment,
  customerContact,
  setCustomerContact,
  customerPhone,
  setCustomerPhone,
  customerEmail,
  setCustomerEmail,
  readOnly,
}: BasicInfoTabProps) {
  return (
    <div className="space-y-6">
      {/* Spec Sheet Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          仕様書情報
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              仕様書番号 *
            </label>
            <Input
              value={specNumber}
              onChange={e => setSpecNumber(e.target.value)}
              disabled={readOnly}
              placeholder="B2B-SPEC-2024-001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              版数 *
            </label>
            <Input
              value={revision}
              onChange={e => setRevision(e.target.value)}
              disabled={readOnly}
              placeholder="1.0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              発行日 *
            </label>
            <Input
              type="date"
              value={issueDate}
              onChange={e => setIssueDate(e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              有効期限
            </label>
            <Input
              type="date"
              value={validUntil}
              onChange={e => setValidUntil(e.target.value)}
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリー
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as SpecSheetCategory)}
              disabled={readOnly}
              className="w-full p-2 border rounded-lg"
            >
              <option value="bag">袋製品</option>
              <option value="film">フィルム</option>
              <option value="packaging">包装資材</option>
              <option value="container">容器</option>
              <option value="label">ラベル</option>
              <option value="sealing">封筒</option>
              <option value="custom">カスタム</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ステータス
            </label>
            <select
              value={sheetStatus}
              onChange={e => setSheetStatus(e.target.value as SpecSheetStatus)}
              disabled={readOnly}
              className="w-full p-2 border rounded-lg"
            >
              <option value="draft">下書き</option>
              <option value="pending">承認待ち</option>
              <option value="approved">承認済み</option>
              <option value="active">有効</option>
              <option value="superseded">改定版あり</option>
              <option value="archived">アーカイブ</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            タイトル *
          </label>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={readOnly}
            placeholder="オーダーメイドスタンドパウチ袋仕様書"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            説明
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={readOnly}
            rows={3}
            className="w-full p-3 border rounded-lg resize-none"
            placeholder="仕様書の説明を入力..."
          />
        </div>
      </Card>

      {/* Customer Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          顧客情報
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              会社名 *
            </label>
            <Input
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              disabled={readOnly}
              placeholder="株式会社テスト"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                部署名
              </label>
              <Input
                value={customerDepartment}
                onChange={e => setCustomerDepartment(e.target.value)}
                disabled={readOnly}
                placeholder="資材調達部"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                担当者名 *
              </label>
              <Input
                value={customerContact}
                onChange={e => setCustomerContact(e.target.value)}
                disabled={readOnly}
                placeholder="山田 太郎"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号
              </label>
              <Input
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                disabled={readOnly}
                placeholder="03-1234-5678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <Input
                type="email"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                disabled={readOnly}
                placeholder="contact@example.com"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface ProductSpecTabProps {
  productName: string;
  setProductName: (v: string) => void;
  productNameKana: string;
  setProductNameKana: (v: string) => void;
  productCode: string;
  setProductCode: (v: string) => void;
  dimLength: string;
  setDimLength: (v: string) => void;
  dimWidth: string;
  setDimWidth: (v: string) => void;
  dimHeight: string;
  setDimHeight: (v: string) => void;
  dimThickness: string;
  setDimThickness: (v: string) => void;
  dimOpening: string;
  setDimOpening: (v: string) => void;
  dimTolerance: string;
  setDimTolerance: (v: string) => void;
  materials: Array<{ layer: number; material: string; thickness?: number; function?: string }>;
  setMaterials: (v: any) => void;
  newMaterial: { layer: number; material: string; thickness: string; function: string };
  setNewMaterial: (v: any) => void;
  addMaterial: () => void;
  removeMaterial: (i: number) => void;
  application: string;
  setApplication: (v: string) => void;
  heatResistance: string;
  setHeatResistance: (v: string) => void;
  coldResistance: string;
  setColdResistance: (v: string) => void;
  transparency: string;
  setTransparency: (v: string) => void;
  waterResistance: boolean;
  setWaterResistance: (v: boolean) => void;
  airTightness: boolean;
  setAirTightness: (v: boolean) => void;
  moistureResistance: boolean;
  setMoistureResistance: (v: boolean) => void;
  antistatic: boolean;
  setAntistatic: (v: boolean) => void;
  uvProtection: boolean;
  setUvProtection: (v: boolean) => void;
  features: string;
  setFeatures: (v: string) => void;
  tensileStrength: string;
  setTensileStrength: (v: string) => void;
  tearStrength: string;
  setTearStrength: (v: string) => void;
  sealStrength: string;
  setSealStrength: (v: string) => void;
  wvtr: string;
  setWvtr: (v: string) => void;
  otr: string;
  setOtr: (v: string) => void;
  foodSanitationAct: boolean;
  setFoodSanitationAct: (v: boolean) => void;
  jisStandards: string;
  setJisStandards: (v: string) => void;
  isoStandards: string;
  setIsoStandards: (v: string) => void;
  otherStandards: string;
  setOtherStandards: (v: string) => void;
  readOnly: boolean;
}

function ProductSpecTab({
  productName,
  setProductName,
  productNameKana,
  setProductNameKana,
  productCode,
  setProductCode,
  dimLength,
  setDimLength,
  dimWidth,
  setDimWidth,
  dimHeight,
  setDimHeight,
  dimThickness,
  setDimThickness,
  dimOpening,
  setDimOpening,
  dimTolerance,
  setDimTolerance,
  materials,
  newMaterial,
  setNewMaterial,
  addMaterial,
  removeMaterial,
  application,
  setApplication,
  heatResistance,
  setHeatResistance,
  coldResistance,
  setColdResistance,
  transparency,
  setTransparency,
  waterResistance,
  setWaterResistance,
  airTightness,
  setAirTightness,
  moistureResistance,
  setMoistureResistance,
  antistatic,
  setAntistatic,
  uvProtection,
  setUvProtection,
  features,
  setFeatures,
  tensileStrength,
  setTensileStrength,
  tearStrength,
  setTearStrength,
  sealStrength,
  setSealStrength,
  wvtr,
  setWvtr,
  otr,
  setOtr,
  foodSanitationAct,
  setFoodSanitationAct,
  jisStandards,
  setJisStandards,
  isoStandards,
  setIsoStandards,
  otherStandards,
  setOtherStandards,
  readOnly,
}: ProductSpecTabProps) {
  return (
    <div className="space-y-6">
      {/* Basic Product Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">製品情報</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              製品名 *
            </label>
            <Input
              value={productName}
              onChange={e => setProductName(e.target.value)}
              disabled={readOnly}
              placeholder="オーダーメイドスタンドパウチ袋"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              製品名（カナ）
            </label>
            <Input
              value={productNameKana}
              onChange={e => setProductNameKana(e.target.value)}
              disabled={readOnly}
              placeholder="オーダーメイドスタンドパウチブクロ"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              製品コード *
            </label>
            <Input
              value={productCode}
              onChange={e => setProductCode(e.target.value)}
              disabled={readOnly}
              placeholder="SP-A4-100"
            />
          </div>
        </div>
      </Card>

      {/* Dimensions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">寸法</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              長さ (mm)
            </label>
            <Input
              type="number"
              value={dimLength}
              onChange={e => setDimLength(e.target.value)}
              disabled={readOnly}
              placeholder="200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              幅 (mm)
            </label>
            <Input
              type="number"
              value={dimWidth}
              onChange={e => setDimWidth(e.target.value)}
              disabled={readOnly}
              placeholder="140"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              高さ (mm)
            </label>
            <Input
              type="number"
              value={dimHeight}
              onChange={e => setDimHeight(e.target.value)}
              disabled={readOnly}
              placeholder="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              厚み (μm)
            </label>
            <Input
              type="number"
              value={dimThickness}
              onChange={e => setDimThickness(e.target.value)}
              disabled={readOnly}
              placeholder="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              口径 (mm)
            </label>
            <Input
              type="number"
              value={dimOpening}
              onChange={e => setDimOpening(e.target.value)}
              disabled={readOnly}
              placeholder="40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              許容差
            </label>
            <Input
              value={dimTolerance}
              onChange={e => setDimTolerance(e.target.value)}
              disabled={readOnly}
              placeholder="±2mm"
            />
          </div>
        </div>
      </Card>

      {/* Materials */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">材質構成</h3>
        <div className="space-y-3 mb-4">
          {materials.map((material, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <span className="font-semibold text-gray-600 w-16">
                第{material.layer}層
              </span>
              <span className="flex-1">{material.material}</span>
              {material.thickness && (
                <span className="text-gray-600">
                  {material.thickness}μm
                </span>
              )}
              {material.function && (
                <span className="text-gray-500 text-sm">
                  ({material.function})
                </span>
              )}
              {!readOnly && (
                <button
                  onClick={() => removeMaterial(index)}
                  className="p-1 hover:bg-red-100 rounded"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              )}
            </div>
          ))}
        </div>
        {!readOnly && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <span className="font-semibold text-gray-600 w-16">
              第{newMaterial.layer}層
            </span>
            <Input
              value={newMaterial.material}
              onChange={e =>
                setNewMaterial({ ...newMaterial, material: e.target.value })
              }
              placeholder="材質名"
              className="flex-1"
            />
            <Input
              value={newMaterial.thickness}
              onChange={e =>
                setNewMaterial({ ...newMaterial, thickness: e.target.value })
              }
              placeholder="厚み(μm)"
              className="w-24"
            />
            <Input
              value={newMaterial.function}
              onChange={e =>
                setNewMaterial({ ...newMaterial, function: e.target.value })
              }
              placeholder="機能"
              className="w-32"
            />
            <Button
              onClick={addMaterial}
              disabled={!newMaterial.material}
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}
      </Card>

      {/* Specifications */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">仕様・特徴</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              用途
            </label>
            <Input
              value={application}
              onChange={e => setApplication(e.target.value)}
              disabled={readOnly}
              placeholder="乾燥食品・スナック菓子包装"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                耐熱温度
              </label>
              <Input
                value={heatResistance}
                onChange={e => setHeatResistance(e.target.value)}
                disabled={readOnly}
                placeholder="最高120℃"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                耐冷温度
              </label>
              <Input
                value={coldResistance}
                onChange={e => setColdResistance(e.target.value)}
                disabled={readOnly}
                placeholder="最低-20℃"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              透明度
            </label>
            <select
              value={transparency}
              onChange={e => setTransparency(e.target.value)}
              disabled={readOnly}
              className="w-full p-2 border rounded-lg"
            >
              <option value="transparent">透明</option>
              <option value="translucent">半透明</option>
              <option value="opaque">不透明</option>
            </select>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={waterResistance}
                onChange={e => setWaterResistance(e.target.checked)}
                disabled={readOnly}
              />
              <span className="text-sm">耐水性</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={airTightness}
                onChange={e => setAirTightness(e.target.checked)}
                disabled={readOnly}
              />
              <span className="text-sm">気密性</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={moistureResistance}
                onChange={e => setMoistureResistance(e.target.checked)}
                disabled={readOnly}
              />
              <span className="text-sm">防湿性</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={antistatic}
                onChange={e => setAntistatic(e.target.checked)}
                disabled={readOnly}
              />
              <span className="text-sm">帯電防止</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={uvProtection}
                onChange={e => setUvProtection(e.target.checked)}
                disabled={readOnly}
              />
              <span className="text-sm">紫外線カット</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              特徴（1行につき1つ）
            </label>
            <textarea
              value={features}
              onChange={e => setFeatures(e.target.value)}
              disabled={readOnly}
              rows={3}
              className="w-full p-3 border rounded-lg resize-none"
              placeholder="底部ガセットによる自立性&#10;ジッパー付きによる再密封可能"
            />
          </div>
        </div>
      </Card>

      {/* Performance Standards */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">性能基準</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              引張強度
            </label>
            <Input
              value={tensileStrength}
              onChange={e => setTensileStrength(e.target.value)}
              disabled={readOnly}
              placeholder="40MPa以上"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              破裂強度
            </label>
            <Input
              value={tearStrength}
              onChange={e => setTearStrength(e.target.value)}
              disabled={readOnly}
              placeholder="150N以上"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              密封強度
            </label>
            <Input
              value={sealStrength}
              onChange={e => setSealStrength(e.target.value)}
              disabled={readOnly}
              placeholder="15N/15mm以上"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              透湿度
            </label>
            <Input
              value={wvtr}
              onChange={e => setWvtr(e.target.value)}
              disabled={readOnly}
              placeholder="1g/㎡・day以下"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              酸素透過度
            </label>
            <Input
              value={otr}
              onChange={e => setOtr(e.target.value)}
              disabled={readOnly}
              placeholder="1cc/㎡・day以下"
            />
          </div>
        </div>
      </Card>

      {/* Compliance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">規格準拠</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={foodSanitationAct}
              onChange={e => setFoodSanitationAct(e.target.checked)}
              disabled={readOnly}
            />
            <span className="text-sm">食品衛生法準拠</span>
          </label>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              JIS規格
            </label>
            <Input
              value={jisStandards}
              onChange={e => setJisStandards(e.target.value)}
              disabled={readOnly}
              placeholder="Z1707, Z1708（カンマ区切り）"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ISO規格
            </label>
            <Input
              value={isoStandards}
              onChange={e => setIsoStandards(e.target.value)}
              disabled={readOnly}
              placeholder="9001, 22000（カンマ区切り）"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              その他の規格
            </label>
            <Input
              value={otherStandards}
              onChange={e => setOtherStandards(e.target.value)}
              disabled={readOnly}
              placeholder="その他の規格（カンマ区切り）"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

interface ProductionSpecTabProps {
  productionMethod: string;
  setProductionMethod: (v: string) => void;
  process: string;
  setProcess: (v: string) => void;
  inspectionStandards: string;
  setInspectionStandards: (v: string) => void;
  aqlStandards: string;
  setAqlStandards: (v: string) => void;
  packagingUnit: string;
  setPackagingUnit: (v: string) => void;
  packagingQuantity: string;
  setPackagingQuantity: (v: string) => void;
  packingSpec: string;
  setPackingSpec: (v: string) => void;
  leadTime: string;
  setLeadTime: (v: string) => void;
  minLotSize: string;
  setMinLotSize: (v: string) => void;
  lotUnit: string;
  setLotUnit: (v: string) => void;
  readOnly: boolean;
}

function ProductionSpecTab({
  productionMethod,
  setProductionMethod,
  process,
  setProcess,
  inspectionStandards,
  setInspectionStandards,
  aqlStandards,
  setAqlStandards,
  packagingUnit,
  setPackagingUnit,
  packagingQuantity,
  setPackagingQuantity,
  packingSpec,
  setPackingSpec,
  leadTime,
  setLeadTime,
  minLotSize,
  setMinLotSize,
  lotUnit,
  setLotUnit,
  readOnly,
}: ProductionSpecTabProps) {
  return (
    <div className="space-y-6">
      {/* Production Method */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">生産方法</h3>
        <Input
          value={productionMethod}
          onChange={e => setProductionMethod(e.target.value)}
          disabled={readOnly}
          placeholder="インフレーション成形・ラミネート加工"
        />
      </Card>

      {/* Production Process */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">生産工程</h3>
        <p className="text-sm text-gray-600 mb-2">
          1行につき1つの工程を入力してください
        </p>
        <textarea
          value={process}
          onChange={e => setProcess(e.target.value)}
          disabled={readOnly}
          rows={8}
          className="w-full p-3 border rounded-lg resize-none"
          placeholder="フィルム押出し&#10;印刷&#10;ラミネート&#10;製袋&#10;検査"
        />
      </Card>

      {/* Packaging */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">包装条件</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              包装単位
            </label>
            <Input
              value={packagingUnit}
              onChange={e => setPackagingUnit(e.target.value)}
              disabled={readOnly}
              placeholder="個"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              包装数量
            </label>
            <Input
              type="number"
              value={packagingQuantity}
              onChange={e => setPackagingQuantity(e.target.value)}
              disabled={readOnly}
              placeholder="1000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              梱包仕様
            </label>
            <Input
              value={packingSpec}
              onChange={e => setPackingSpec(e.target.value)}
              disabled={readOnly}
              placeholder="段ボール箱詰め（防湿処理済）"
            />
          </div>
        </div>
      </Card>

      {/* Delivery */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">納期・リードタイム</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              リードタイム *
            </label>
            <Input
              value={leadTime}
              onChange={e => setLeadTime(e.target.value)}
              disabled={readOnly}
              placeholder="受注確認後30日〜45日"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              最小ロット *
            </label>
            <Input
              type="number"
              value={minLotSize}
              onChange={e => setMinLotSize(e.target.value)}
              disabled={readOnly}
              placeholder="5000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ロット単位 *
            </label>
            <Input
              value={lotUnit}
              onChange={e => setLotUnit(e.target.value)}
              disabled={readOnly}
              placeholder="個"
            />
          </div>
        </div>
      </Card>

      {/* Quality Control */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">品質管理</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              検査基準（1行につき1つ）
            </label>
            <textarea
              value={inspectionStandards}
              onChange={e => setInspectionStandards(e.target.value)}
              disabled={readOnly}
              rows={5}
              className="w-full p-3 border rounded-lg resize-none"
              placeholder="外観検査&#10;寸法検査&#10;密封強度検査&#10;バリア性能検査"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AQL基準
            </label>
            <Input
              value={aqlStandards}
              onChange={e => setAqlStandards(e.target.value)}
              disabled={readOnly}
              placeholder="AQL 1.5"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

function QualityStandardsTab({
  inspectionStandards,
  setInspectionStandards,
  aqlStandards,
  setAqlStandards,
  readOnly,
}: {
  inspectionStandards: string;
  setInspectionStandards: (v: string) => void;
  aqlStandards: string;
  setAqlStandards: (v: string) => void;
  readOnly: boolean;
}) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">品質管理基準</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            検査基準（1行につき1つ）
          </label>
          <textarea
            value={inspectionStandards}
            onChange={e => setInspectionStandards(e.target.value)}
            disabled={readOnly}
            rows={8}
            className="w-full p-3 border rounded-lg resize-none"
            placeholder="外観検査&#10;寸法検査&#10;密封強度検査&#10;バリア性能検査"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            AQL基準
          </label>
          <Input
            value={aqlStandards}
            onChange={e => setAqlStandards(e.target.value)}
            disabled={readOnly}
            placeholder="AQL 1.5"
          />
        </div>
      </div>
    </Card>
  );
}

interface DesignSpecTabProps {
  printingMethod: string;
  setPrintingMethod: (v: string) => void;
  printingColors: string;
  setPrintingColors: (v: string) => void;
  printingSides: string;
  setPrintingSides: (v: string) => void;
  baseColors: string;
  setBaseColors: (v: string) => void;
  spotColors: string;
  setSpotColors: (v: string) => void;
  readOnly: boolean;
}

function DesignSpecTab({
  printingMethod,
  setPrintingMethod,
  printingColors,
  setPrintingColors,
  printingSides,
  setPrintingSides,
  baseColors,
  setBaseColors,
  spotColors,
  setSpotColors,
  readOnly,
}: DesignSpecTabProps) {
  return (
    <div className="space-y-6">
      {/* Printing */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">印刷仕様</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              印刷方法
            </label>
            <select
              value={printingMethod}
              onChange={e => setPrintingMethod(e.target.value)}
              disabled={readOnly}
              className="w-full p-2 border rounded-lg"
            >
              <option value="none">印刷なし</option>
              <option value="gravure">グラビア印刷</option>
              <option value="flexo">フレキソ印刷</option>
              <option value="offset">オフセット印刷</option>
              <option value="digital">デジタル印刷</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              色数
            </label>
            <Input
              type="number"
              value={printingColors}
              onChange={e => setPrintingColors(e.target.value)}
              disabled={readOnly}
              placeholder="8"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              印刷面
            </label>
            <select
              value={printingSides}
              onChange={e => setPrintingSides(e.target.value)}
              disabled={readOnly}
              className="w-full p-2 border rounded-lg"
            >
              <option value="front">表面のみ</option>
              <option value="back">裏面のみ</option>
              <option value="both">両面</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Colors */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">カラーガイド</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              基本色（カンマ区切り）
            </label>
            <Input
              value={baseColors}
              onChange={e => setBaseColors(e.target.value)}
              disabled={readOnly}
              placeholder="プロセスカラー（CMYK）"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              特色（カンマ区切り）
            </label>
            <Input
              value={spotColors}
              onChange={e => setSpotColors(e.target.value)}
              disabled={readOnly}
              placeholder="PANTONE 186 C（赤）, DIC 156（青）"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

interface PricingTabProps {
  unitPrice: string;
  setUnitPrice: (v: string) => void;
  currency: 'JPY' | 'USD';
  setCurrency: (v: 'JPY' | 'USD') => void;
  moq: string;
  setMoq: (v: string) => void;
  volumeDiscount: string;
  setVolumeDiscount: (v: string) => void;
  readOnly: boolean;
}

function PricingTab({
  unitPrice,
  setUnitPrice,
  currency,
  setCurrency,
  moq,
  setMoq,
  volumeDiscount,
  setVolumeDiscount,
  readOnly,
}: PricingTabProps) {
  return (
    <div className="space-y-6">
      {/* Base Price */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">基本価格</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              単価 *
            </label>
            <Input
              type="number"
              value={unitPrice}
              onChange={e => setUnitPrice(e.target.value)}
              disabled={readOnly}
              placeholder="150"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              通貨
            </label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value as 'JPY' | 'USD')}
              disabled={readOnly}
              className="w-full p-2 border rounded-lg"
            >
              <option value="JPY">日本円 (JPY)</option>
              <option value="USD">米ドル (USD)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              最低発注量 *
            </label>
            <Input
              type="number"
              value={moq}
              onChange={e => setMoq(e.target.value)}
              disabled={readOnly}
              placeholder="5000"
            />
          </div>
        </div>
      </Card>

      {/* Volume Discount */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">数量割引</h3>
        <p className="text-sm text-gray-600 mb-2">
          1行につき「数量個: 割引率」の形式で入力してください
        </p>
        <textarea
          value={volumeDiscount}
          onChange={e => setVolumeDiscount(e.target.value)}
          disabled={readOnly}
          rows={5}
          className="w-full p-3 border rounded-lg resize-none"
          placeholder="10000個: 5.0%&#10;50000個: 10.0%"
        />
      </Card>
    </div>
  );
}
