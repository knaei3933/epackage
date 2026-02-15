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
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Building className="w-5 h-5 mr-2 text-blue-600" />
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
              className={`block p-4 border-2 rounded-lg transition-all cursor-pointer ${
                deliveryType === 'normal'
                  ? 'border-brixa-600 bg-brixa-600'
                  : 'border-gray-200 bg-white hover:border-brixa-400'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`p-2 rounded-full mb-2 ${
                  deliveryType === 'normal' ? 'bg-white' : 'bg-gray-100'
                }`}>
                  <Building className={`w-5 h-5 ${
                    deliveryType === 'normal' ? 'text-brixa-700' : 'text-gray-600'
                  }`} />
                </div>
                <h3 className={`font-semibold mb-1 ${
                  deliveryType === 'normal' ? 'text-white' : 'text-gray-900'
                }`}>
                  一般配送
                </h3>
                <p className={`text-xs ${
                  deliveryType === 'normal' ? 'text-brixa-100' : 'text-gray-600'
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
              className={`block p-4 border-2 rounded-lg transition-all cursor-pointer ${
                deliveryType === 'other'
                  ? 'border-orange-600 bg-orange-600'
                  : 'border-gray-200 bg-white hover:border-orange-400'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`p-2 rounded-full mb-2 ${
                  deliveryType === 'other' ? 'bg-white' : 'bg-gray-100'
                }`}>
                  <Copy className={`w-5 h-5 ${
                    deliveryType === 'other' ? 'text-orange-700' : 'text-gray-600'
                  }`} />
                </div>
                <h3 className={`font-semibold mb-1 ${
                  deliveryType === 'other' ? 'text-white' : 'text-gray-900'
                }`}>
                  別の場所に配送
                </h3>
                <p className={`text-xs ${
                  deliveryType === 'other' ? 'text-orange-100' : 'text-gray-600'
                }`}>
                  別の場所を指定
                </p>
              </div>
            </label>
          </div>
        </div>
        {errors.deliveryType && (
          <p className="text-red-600 text-sm mt-2">{errors.deliveryType.message}</p>
        )}
      </div>

      {/* 配送先リスト */}
      <div className="bg-orange-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Building className="w-5 h-5 mr-2 text-orange-600" />
            配送先 <span className="text-red-500 ml-2">*</span>
          </h2>
          <button
            type="button"
            onClick={addDestination}
            className="flex items-center px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            配送先を追加
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
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
    <div className="bg-white rounded-lg p-4 mb-4 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">
          配送先 {index + 1}
        </h3>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            <X className="w-4 h-4 mr-1 inline" />
            削除
          </button>
        )}
      </div>

      {/* お客様情報と同じチェックボックス */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            {...register(`deliveryDestinations.${index}.sameAsCustomer` as const)}
            className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            onChange={(e) => {
              if (e.target.checked) {
                onCopyCustomerInfo()
              } else {
                // Clear fields when unchecked
                const destKey = `deliveryDestinations.${index}` as const
                setValue(`${destKey}.companyName`, '')
                setValue(`${destKey}.contactPerson`, '')
                setValue(`${destKey}.phone`, '')
                setValue(`${destKey}.postalCode`, '')
                setValue(`${destKey}.address`, '')
                setValue(`${destKey}.sameAsCustomer`, false)
              }
            }}
          />
          <div className="ml-3">
            <span className="text-sm font-medium text-gray-700">
              お客様情報と同じ
            </span>
            <button
              type="button"
              onClick={onCopyCustomerInfo}
              className="ml-2 text-xs text-orange-600 hover:text-orange-700 flex items-center"
            >
              <Copy className="w-3 h-3 mr-1 inline" />
              コピー
            </button>
            <p className="text-xs text-gray-500 mt-1">
              チェックするとお客様情報がコピーされます
            </p>
          </div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 会社名 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            会社名
          </label>
          <input
            type="text"
            {...register(`deliveryDestinations.${index}.companyName` as const)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            placeholder="株式会社〇〇"
          />
        </div>

        {/* 担当者 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            担当者 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register(`deliveryDestinations.${index}.contactPerson` as const)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            placeholder="山田 太郎"
          />
          {errors.deliveryDestinations?.[index]?.contactPerson && (
            <p className="text-red-600 text-xs">{errors.deliveryDestinations[index]?.contactPerson?.message}</p>
          )}
        </div>

        {/* 電話番号 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            電話番号 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            {...register(`deliveryDestinations.${index}.phone` as const)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            placeholder="03-1234-5678"
          />
          {errors.deliveryDestinations?.[index]?.phone && (
            <p className="text-red-600 text-xs">{errors.deliveryDestinations[index]?.phone?.message}</p>
          )}
        </div>

        {/* 郵便番号 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            郵便番号
          </label>
          <input
            type="text"
            {...register(`deliveryDestinations.${index}.postalCode` as const)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            placeholder="100-0001"
          />
        </div>

        {/* 住所 */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">
            住所 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register(`deliveryDestinations.${index}.address` as const)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            placeholder="東京都〇〇区〇〇1-2-3"
          />
          {errors.deliveryDestinations?.[index]?.address && (
            <p className="text-red-600 text-xs">{errors.deliveryDestinations[index]?.address?.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}
