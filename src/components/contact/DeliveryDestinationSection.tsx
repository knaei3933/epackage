/**
 * Delivery Destination Section Component
 */

import { Building, Plus, X, Copy } from 'lucide-react'
import { Control, FieldErrors, UseFormSetValue, UseFormWatch, useFieldArray, FieldArrayWithId } from 'react-hook-form'
import type { PouchSampleRequestFormData, DeliveryDestinationFormData } from './SampleRequestForm.schema'

export interface DeliveryDestinationSectionProps {
  control: Control<PouchSampleRequestFormData>
  watch: UseFormWatch<PouchSampleRequestFormData>
  setValue: UseFormSetValue<PouchSampleRequestFormData>
  errors: FieldErrors<PouchSampleRequestFormData>
}

export function DeliveryDestinationSection({
  control,
  watch,
  setValue,
  errors
}: DeliveryDestinationSectionProps) {
  const {
    fields: destinationFields,
    append: appendDestination,
    remove: removeDestination,
  } = useFieldArray({
    control,
    name: 'deliveryDestinations'
  })

  const deliveryType = watch('deliveryType')
  const customerInfo = {
    company: watch('company'),
    phone: watch('phone'),
    postalCode: watch('postalCode'),
    address: watch('address'),
    kanjiLastName: watch('kanjiLastName'),
    kanjiFirstName: watch('kanjiFirstName')
  }

  // お客様情報を配送先にコピーする関数
  const copyCustomerInfo = (index: number) => {
    const destKey = `deliveryDestinations.${index}` as const
    setValue(`${destKey}.companyName`, customerInfo.company || '')
    setValue(`${destKey}.contactPerson`, `${customerInfo.kanjiLastName} ${customerInfo.kanjiFirstName}`)
    setValue(`${destKey}.phone`, customerInfo.phone)
    setValue(`${destKey}.postalCode`, customerInfo.postalCode || '')
    setValue(`${destKey}.address`, customerInfo.address || '')
    setValue(`${destKey}.sameAsCustomer`, true)
  }

  // 新しい配送先を追加
  const addDestination = () => {
    const newId = `dest-${Date.now()}`
    appendDestination({
      id: newId,
      contactPerson: '',
      phone: '',
      address: '',
      sameAsCustomer: false
    })
  }

  return (
    <>
      {/* 配送タイプ選択 */}
      <div className="bg-brand-muted rounded-container p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center">
          <Building className="w-5 h-5 mr-2 text-brand" />
          配送タイプ
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 一般配送 */}
          <div className="relative">
            <input
              {...control.register('deliveryType')}
              id="delivery-type-normal"
              type="radio"
              value="normal"
              className="peer sr-only"
              onChange={() => {
                setValue('deliveryType', 'normal', { shouldValidate: true })
                // 一般配送時、最初の配送先にお客様情報を自動コピー
                if (destinationFields.length > 0) {
                  copyCustomerInfo(0)
                }
              }}
            />
            <label
              htmlFor="delivery-type-normal"
              className={`block p-4 border-2 rounded-container transition-all cursor-pointer ${
                deliveryType === 'normal'
                  ? 'border-brand bg-brand'
                  : 'border-border-medium bg-bg-primary hover:border-brand-soft'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`p-2 rounded-full mb-2 ${
                  deliveryType === 'normal' ? 'bg-bg-primary' : 'bg-bg-muted'
                }`}>
                  <Building className={`w-5 h-5 ${
                    deliveryType === 'normal' ? 'text-brand' : 'text-text-secondary'
                  }`} />
                </div>
                <h3 className={`font-semibold mb-1 ${
                  deliveryType === 'normal' ? 'text-white' : 'text-text-primary'
                }`}>
                  一般配送
                </h3>
                <p className={`text-xs ${
                  deliveryType === 'normal' ? 'text-on-brand' : 'text-text-secondary'
                }`}>
                  お客様情報に配送
                </p>
              </div>
            </label>
          </div>

          {/* 別の場所に配送 */}
          <div className="relative">
            <input
              {...control.register('deliveryType')}
              id="delivery-type-other"
              type="radio"
              value="other"
              className="peer sr-only"
              onChange={() => {
                setValue('deliveryType', 'other', { shouldValidate: true })
              }}
            />
            <label
              htmlFor="delivery-type-other"
              className={`block p-4 border-2 rounded-container transition-all cursor-pointer ${
                deliveryType === 'other'
                  ? 'border-brand bg-brand'
                  : 'border-border-medium bg-bg-primary hover:border-brand'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`p-2 rounded-full mb-2 ${
                  deliveryType === 'other' ? 'bg-bg-primary' : 'bg-bg-muted'
                }`}>
                  <Copy className={`w-5 h-5 ${
                    deliveryType === 'other' ? 'text-brand' : 'text-text-secondary'
                  }`} />
                </div>
                <h3 className={`font-semibold mb-1 ${
                  deliveryType === 'other' ? 'text-white' : 'text-text-primary'
                }`}>
                  別の場所に配送
                </h3>
                <p className={`text-xs ${
                  deliveryType === 'other' ? 'text-on-brand' : 'text-text-secondary'
                }`}>
                  別の場所を指定
                </p>
              </div>
            </label>
          </div>
        </div>
        {errors.deliveryType && (
          <p className="text-error text-sm mt-2">{errors.deliveryType.message}</p>
        )}
      </div>

      {/* 配送先リスト */}
      <div className="bg-brand-muted rounded-container p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-primary flex items-center">
            <Building className="w-5 h-5 mr-2 text-brand" />
            配送先 <span className="text-error ml-2">*</span>
          </h2>
          <button
            type="button"
            onClick={addDestination}
            className="flex items-center px-3 py-2 bg-brand text-white text-sm font-medium rounded-container hover:bg-brand-hover transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            配送先を追加
          </button>
        </div>
        <p className="text-sm text-text-secondary mb-4">
          サンプルを配送する場所を入力してください
        </p>

        {destinationFields.map((field, index) => (
          <DeliveryDestinationCard
            key={field.id}
            index={index}
            field={field}
            register={control.register}
            errors={errors}
            onRemove={destinationFields.length > 1 ? () => removeDestination(index) : undefined}
            onCopyCustomerInfo={() => copyCustomerInfo(index)}
          />
        ))}
      </div>
    </>
  )
}

interface DeliveryDestinationCardProps {
  index: number
  field: FieldArrayWithId<PouchSampleRequestFormData, 'deliveryDestinations'>
  register: Control<PouchSampleRequestFormData>['register']
  errors: FieldErrors<PouchSampleRequestFormData>
  onRemove?: () => void
  onCopyCustomerInfo: () => void
}

function DeliveryDestinationCard({
  index,
  register,
  errors,
  onRemove,
  onCopyCustomerInfo
}: DeliveryDestinationCardProps) {
  return (
    <div className="bg-bg-primary rounded-container p-4 mb-4 border-2 border-border-medium">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">
          配送先 {index + 1}
        </h3>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-error hover:text-error text-sm"
          >
            <X className="w-4 h-4 mr-1 inline" />
            削除
          </button>
        )}
      </div>

      {/* お客様情報と同じチェックボックス */}
      <div className="mb-4 p-3 bg-bg-secondary rounded-container">
        <label className="flex items-start space-x-3 !cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              {...register(`deliveryDestinations.${index}.sameAsCustomer` as const)}
              className="peer sr-only"
              onChange={(e) => {
                if (e.target.checked) {
                  onCopyCustomerInfo()
                }
              }}
            />
            <div className="w-5 h-5 mt-0.5 border-2 border-border-strong rounded bg-bg-primary transition-all duration-200 peer-checked:bg-brand peer-checked:border-brand flex items-center justify-center group-hover:border-brand-soft">
              <svg className="w-3 h-3 text-white hidden peer-checked:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="flex-1 cursor-pointer">
            <span className="text-sm font-medium text-text-primary">
              お客様情報と同じ
            </span>
            <button
              type="button"
              onClick={onCopyCustomerInfo}
              className="ml-2 text-xs text-brand hover:text-brand flex items-center"
            >
              <Copy className="w-3 h-3 mr-1 inline" />
              コピー
            </button>
            <p className="text-xs text-text-muted mt-1">
              チェックするとお客様情報がコピーされます
            </p>
          </div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 会社名 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">
            会社名
          </label>
          <input
            type="text"
            {...register(`deliveryDestinations.${index}.companyName` as const)}
            className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
            placeholder="株式会社〇〇"
          />
        </div>

        {/* 担当者 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">
            担当者 <span className="text-error">*</span>
          </label>
          <input
            type="text"
            {...register(`deliveryDestinations.${index}.contactPerson` as const)}
            className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
            placeholder="山田 太郎"
          />
          {errors.deliveryDestinations?.[index]?.contactPerson && (
            <p className="text-error text-xs">{errors.deliveryDestinations[index]?.contactPerson?.message}</p>
          )}
        </div>

        {/* 電話番号 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">
            電話番号 <span className="text-error">*</span>
          </label>
          <input
            type="tel"
            {...register(`deliveryDestinations.${index}.phone` as const)}
            className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
            placeholder="03-1234-5678"
          />
          {errors.deliveryDestinations?.[index]?.phone && (
            <p className="text-error text-xs">{errors.deliveryDestinations[index]?.phone?.message}</p>
          )}
        </div>

        {/* 郵便番号 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">
            郵便番号
          </label>
          <input
            type="text"
            {...register(`deliveryDestinations.${index}.postalCode` as const)}
            className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
            placeholder="100-0001"
          />
        </div>

        {/* 住所 */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-text-secondary">
            住所 <span className="text-error">*</span>
          </label>
          <input
            type="text"
            {...register(`deliveryDestinations.${index}.address` as const)}
            className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
            placeholder="東京都〇〇区〇〇1-2-3"
          />
          {errors.deliveryDestinations?.[index]?.address && (
            <p className="text-error text-xs">{errors.deliveryDestinations[index]?.address?.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}
