"use client"

import { useState } from "react"
import { Button, Input, Label, Select } from "@medusajs/ui"

type DeliveryAddressFormProps = {
  onAddressSubmit: (addressData: any) => void
}

const DeliveryAddressForm: React.FC<DeliveryAddressFormProps> = ({ 
  onAddressSubmit 
}) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address_1: "",
    address_2: "",
    city: "",
    postal_code: "",
    country_code: "tw"
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const cities = [
    "台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市",
    "基隆市", "新竹市", "嘉義市", "苗栗縣", "彰化縣", "南投縣",
    "雲林縣", "嘉義縣", "屏東縣", "宜蘭縣", "花蓮縣", "台東縣",
    "澎湖縣", "金門縣", "連江縣"
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.first_name.trim()) newErrors.first_name = "請輸入姓名"
    if (!formData.phone.trim()) newErrors.phone = "請輸入聯絡電話"
    if (!formData.address_1.trim()) newErrors.address_1 = "請輸入詳細地址"
    if (!formData.city) newErrors.city = "請選擇縣市"
    if (!formData.postal_code.trim()) newErrors.postal_code = "請輸入郵遞區號"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onAddressSubmit(formData)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除該欄位的錯誤
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 收件人資訊 */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 text-lg">收件人資訊</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
              收件人姓名 *
            </Label>
            <Input
              id="first_name"
              type="text"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              placeholder="請輸入收件人姓名"
              className={errors.first_name ? "border-red-500" : ""}
            />
            {errors.first_name && (
              <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              聯絡電話 *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="09xxxxxxxx"
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* 收件地址 */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 text-lg">收件地址</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              縣市 *
            </Label>
            <Select
              value={formData.city}
              onValueChange={(value) => handleInputChange('city', value)}
            >
              <Select.Trigger className={errors.city ? "border-red-500" : ""}>
                <Select.Value placeholder="請選擇縣市" />
              </Select.Trigger>
              <Select.Content>
                {cities.map((city) => (
                  <Select.Item key={city} value={city}>
                    {city}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <Label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-2">
              郵遞區號 *
            </Label>
            <Input
              id="postal_code"
              type="text"
              value={formData.postal_code}
              onChange={(e) => handleInputChange('postal_code', e.target.value)}
              placeholder="例：100"
              className={errors.postal_code ? "border-red-500" : ""}
            />
            {errors.postal_code && (
              <p className="text-red-500 text-xs mt-1">{errors.postal_code}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="address_1" className="block text-sm font-medium text-gray-700 mb-2">
            詳細地址 *
          </Label>
          <Input
            id="address_1"
            type="text"
            value={formData.address_1}
            onChange={(e) => handleInputChange('address_1', e.target.value)}
            placeholder="請輸入詳細地址（區、里、路段、號碼）"
            className={errors.address_1 ? "border-red-500" : ""}
          />
          {errors.address_1 && (
            <p className="text-red-500 text-xs mt-1">{errors.address_1}</p>
          )}
        </div>

        <div>
          <Label htmlFor="address_2" className="block text-sm font-medium text-gray-700 mb-2">
            地址補充（選填）
          </Label>
          <Input
            id="address_2"
            type="text"
            value={formData.address_2}
            onChange={(e) => handleInputChange('address_2', e.target.value)}
            placeholder="樓層、房號等補充資訊"
          />
        </div>
      </div>

      {/* 提交按鈕 */}
      <div className="pt-4 border-t border-gray-200">
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          確認收件資訊
        </Button>
      </div>
    </form>
  )
}

export default DeliveryAddressForm
