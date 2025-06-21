"use client"

import { useState } from 'react'
import { Select } from '@medusajs/ui'
import Image from 'next/image'
import clsx from 'clsx'

interface Stylist {
  levelName: string
  price: number
  priceType?: 'up' | 'fixed'
  stylistName?: string
  isDefault?: boolean
  cardImage?: {
    url: string
    alt?: string
  }
}

interface Card {
  title: string
  englishTitle: string
  stylists?: Stylist[]
  link?: string
}

interface ServiceCardProps {
  card: Card
  selectedDesigner: string
}

function ServiceCard({ card, selectedDesigner }: ServiceCardProps) {
  if (!card) return null

  const getCardPrice = (card: Card): string => {
    try {
      if (!Array.isArray(card?.stylists) || !card.stylists.length) {
        return "價格請洽詢"
      }
      
      if (selectedDesigner === "all") {
        // 使用標示為預設的設計師價格
        const defaultStylist = card.stylists.find(s => s.isDefault === true)
        if (defaultStylist) {
          const priceText = `NT$ ${defaultStylist.price}`
          return defaultStylist.priceType === 'up' ? `${priceText} 起` : priceText
        }
        // 如果沒有預設設計師，顯示最低價格起
        const minPrice = Math.min(...card.stylists.map(s => s.price))
        return `NT$ ${minPrice} 起`
      }
      
      const stylist = card.stylists.find((s) => s?.stylistName === selectedDesigner)
      if (stylist?.price) {
        const priceText = `NT$ ${stylist.price}`
        return stylist.priceType === 'up' ? `${priceText} 起` : priceText
      }
      return "價格請洽詢"
    } catch (error) {
      console.error('Error calculating card price:', error)
      return "價格請洽詢"
    }
  }

  const getSelectedStylistLevel = (): string | null => {
    try {
      if (!Array.isArray(card?.stylists) || !card.stylists.length) return null
      
      if (selectedDesigner === "all") {
        // 當選擇 "all" 時，使用標示為預設的設計師等級
        const defaultStylist = card.stylists.find(s => s.isDefault === true)
        return defaultStylist?.levelName ?? null
      }
      
      const stylist = card.stylists.find((s) => s?.stylistName === selectedDesigner)
      return stylist?.levelName ?? null
    } catch (error) {
      console.error('Error getting stylist level:', error)
      return null
    }
  }

  const getCardImage = (): { url: string; alt: string } => {
    try {
      // 如果選擇了特定設計師，使用該設計師的專用圖片
      if (selectedDesigner !== "all" && Array.isArray(card?.stylists) && card.stylists.length) {
        const stylist = card.stylists.find((s) => s?.stylistName === selectedDesigner)
        if (stylist?.cardImage?.url) {
          return {
            url: stylist.cardImage.url,
            alt: stylist.cardImage.alt ?? `${stylist.stylistName} - ${card.title}`
          }
        }
      }
      
      // 當選擇 "all" 或沒有選擇設計師時，使用標示為預設的設計師圖片
      if (selectedDesigner === "all" && Array.isArray(card?.stylists) && card.stylists.length > 0) {
        const defaultStylist = card.stylists.find(s => s.isDefault === true)
        if (defaultStylist?.cardImage?.url) {
          return {
            url: defaultStylist.cardImage.url,
            alt: defaultStylist.cardImage.alt ?? `${defaultStylist.stylistName} - ${card.title}`
          }
        }
      }
      
      // 如果沒有預設設計師圖片，使用第一位設計師的圖片作為備用
      if (Array.isArray(card?.stylists) && card.stylists.length > 0) {
        const firstStylist = card.stylists[0]
        if (firstStylist?.cardImage?.url) {
          return {
            url: firstStylist.cardImage.url,
            alt: firstStylist.cardImage.alt ?? card.title
          }
        }
      }
      
      // 如果都沒有圖片，使用預設的服務圖片 URL
      const defaultImageUrl = getDefaultServiceImage(card.title)
      return {
        url: defaultImageUrl,
        alt: card.title
      }
    } catch (error) {
      console.error('Error getting card image:', error)
      const defaultImageUrl = getDefaultServiceImage(card.title)
      return {
        url: defaultImageUrl,
        alt: card.title
      }
    }
  }

  const getDefaultServiceImage = (serviceTitle: string): string => {
    // 根據服務類型返回適合的預設圖片
    if (serviceTitle.includes('剪髮') || serviceTitle.includes('Cut')) {
      return 'https://images.unsplash.com/photo-1562004760-acbaefb9ac18?w=600&h=450&fit=crop&auto=format&q=80'
    } else if (serviceTitle.includes('染髮') || serviceTitle.includes('Color')) {
      return 'https://images.unsplash.com/photo-1522336572468-97b06e8ef143?w=600&h=450&fit=crop&auto=format&q=80'
    } else if (serviceTitle.includes('燙髮') || serviceTitle.includes('Perm')) {
      return 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&h=450&fit=crop&auto=format&q=80'
    } else {
      return 'https://images.unsplash.com/photo-1562004760-acbaefb9ac18?w=600&h=450&fit=crop&auto=format&q=80'
    }
  }

  const getSelectedStylistName = (): string | null => {
    try {
      if (!Array.isArray(card?.stylists) || !card.stylists.length) return null
      
      if (selectedDesigner === "all") {
        // 當選擇 "all" 時，使用標示為預設的設計師名稱
        const defaultStylist = card.stylists.find(s => s.isDefault === true)
        return defaultStylist?.stylistName ?? null
      }
      
      const stylist = card.stylists.find((s) => s?.stylistName === selectedDesigner)
      return stylist?.stylistName ?? null
    } catch (error) {
      console.error('Error getting stylist name:', error)
      return null
    }
  }

  return (
    <div className="group relative bg-white overflow-hidden transition-all duration-700 border border-stone-200/60 hover:border-stone-300/80 hover:-translate-y-2 hover:shadow-xl">
      {/* 服務圖片區域 */}
      {(() => {
        const cardImage = getCardImage()
        return cardImage.url ? (
          <div className="aspect-[4/3] relative overflow-hidden">
            <Image
              src={cardImage.url}
              alt={cardImage.alt}
              fill
              className="object-cover transition-all duration-1000 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            {/* 簡約漸層覆蓋層 */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

            {/* 等級標籤 - 簡約設計 */}
            {getSelectedStylistLevel() && (
              <div className="absolute top-6 left-6 transform group-hover:scale-105 transition-transform duration-300">
                <div className="bg-stone-800/90 text-white px-4 py-2 shadow-sm text-xs font-medium tracking-widest uppercase">
                  {getSelectedStylistLevel()}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
            <div className="text-stone-400 text-sm font-medium tracking-wide">
              圖片暫不可用
            </div>
            {/* 簡約裝飾圖案 */}
            <div className="absolute inset-0 opacity-5">
              <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="0.5"/>
                <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="0.5"/>
              </svg>
            </div>
          </div>
        )
      })()}

      {/* 卡片內容區域 - Kitsuné 風格 */}
      <div className="p-8 space-y-6">
        {/* 服務標題區域 - 添加價格到右側 */}
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <h3 className="text-xl font-light text-stone-900 group-hover:text-stone-700 transition-colors duration-300 leading-tight tracking-wide">
              {card.title}
            </h3>
            {card.englishTitle && (
              <p className="text-xs text-stone-500 font-light tracking-[0.2em] uppercase">
                {card.englishTitle}
              </p>
            )}
          </div>
          {/* 價格區域 - 右側對齊 */}
          <div className="ml-4 text-right">
            <span className="text-lg font-medium text-stone-800 tracking-wide">
              {getCardPrice(card)}
            </span>
          </div>
        </div>

        {/* 設計師資訊 - 簡約設計 */}
        {(selectedDesigner && selectedDesigner !== "all" && getSelectedStylistName()) || 
         (selectedDesigner === "all" && getSelectedStylistName()) ? (
          <div className="space-y-4 p-5 bg-stone-50/50 border border-stone-100/50">
            {getSelectedStylistName() && (
              <div className="flex items-center space-x-3">
                <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium text-stone-700 tracking-wide">
                  {getSelectedStylistName()}
                </span>
              </div>
            )}
            {getSelectedStylistLevel() && (
              <div className="flex items-center">
                <span className="text-xs bg-stone-200/80 text-stone-700 px-4 py-2 font-medium tracking-wide">
                  {getSelectedStylistLevel()}
                </span>
              </div>
            )}
          </div>
        ) : null}
        
        {/* 預約按鈕 - 直角設計 */}
        <button 
          className="w-full bg-stone-900 hover:bg-stone-800 text-white font-light py-4 px-8 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] group relative overflow-hidden tracking-wide"
          onClick={() => {
            console.log('Book now clicked for:', card.title)
          }}
        >
          {/* 按鈕內部光澤效果 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          
          <span className="flex items-center justify-center space-x-3 relative z-10 text-white">
            <span className="text-sm tracking-[0.1em] uppercase text-white">立即預約</span>
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </div>

      {/* 底部微光效果 - 更簡約 */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-stone-200/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
    </div>
  )
}

interface ServiceCardsSectionProps {
  heading?: string
  subheading?: string
  cardsPerRow?: number
  cards?: Card[]
}

export default function ServiceCardsSection({
  heading,
  subheading,
  cardsPerRow = 4,
  cards = [],
}: ServiceCardsSectionProps) {
  const [selectedDesigner, setSelectedDesigner] = useState<string>("all")

  // 資料驗證
  const validCards = cards?.filter(card => 
    card && 
    typeof card === 'object' && 
    'title' in card &&
    'englishTitle' in card
  ) ?? []

  // 從有效卡片中提取設計師資訊
  const allStylists = Array.from(new Set(
    validCards.flatMap(card => 
      Array.isArray(card?.stylists) 
        ? card.stylists
            .filter((s): s is Stylist => s !== null && s !== undefined && typeof s.stylistName === 'string')
            .map(s => s.stylistName!)
            .filter(name => name !== "All Stylists" && name !== "All stylists" && name !== "all stylists") // 過濾掉錯誤的設計師名稱
        : []
    )
  )).sort()

  // 調試資訊：檢查是否有重複的 "All Stylists"
  console.log('All stylists array:', allStylists)
  console.log('Raw stylists data:', validCards.flatMap(card => 
    Array.isArray(card?.stylists) 
      ? card.stylists.map(s => s?.stylistName)
      : []
  ))

  if (!validCards.length) {
    return null
  }

  return (
    <section className="py-20 bg-stone-50/30">
      <div className="max-w-[1440px] mx-auto w-full">
        {(heading || subheading) && (
          <div className="mb-20 text-center">
            {heading && (
              <h1 className="text-3xl md:text-4xl font-light text-stone-900 mb-4 tracking-wide">{heading}</h1>
            )}
            {subheading && (
              <h3 className="text-lg font-light text-stone-600 max-w-2xl mx-auto leading-relaxed tracking-wide">{subheading}</h3>
            )}
          </div>
        )}
        
        {allStylists.length > 0 && (
          <div className="mb-16">
            <div className="w-full max-w-[280px] mx-auto">
              <div className="text-center text-sm font-light text-stone-700 mb-4 tracking-[0.15em] uppercase">
                選擇設計師
              </div>
              <Select 
                value={selectedDesigner}
                onValueChange={setSelectedDesigner}
              >
                <Select.Trigger className="bg-white border-stone-200 hover:border-stone-300 py-3 px-6 text-stone-700 font-light tracking-wide">
                  <Select.Value placeholder="所有設計師" />
                </Select.Trigger>
                <Select.Content className="bg-white border-stone-200 shadow-lg">
                  <Select.Item value="all" className="font-light tracking-wide text-stone-700 hover:bg-stone-50">所有設計師</Select.Item>
                  {allStylists.map((designer) => (
                    <Select.Item 
                      key={designer} 
                      value={designer}
                      className="font-light tracking-wide text-stone-700 hover:bg-stone-50"
                    >
                      {designer}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          </div>
        )}

        <div className={clsx(
          "grid grid-cols-1 gap-0 w-full",
          cardsPerRow === 3 && "sm:grid-cols-2 lg:grid-cols-3",
          cardsPerRow === 4 && "sm:grid-cols-2 lg:grid-cols-4"
        )}>
          {validCards.map((card, idx) => (
            <div key={`${selectedDesigner}-${idx}`} className="w-full">
              <ServiceCard 
                card={card}
                selectedDesigner={selectedDesigner}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
