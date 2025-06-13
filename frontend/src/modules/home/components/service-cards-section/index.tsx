"use client"

import { useState } from 'react'
import { Select } from '@medusajs/ui'
import Image from 'next/image'
import clsx from 'clsx'

interface Stylist {
  levelName: string
  price: number
  stylistName?: string
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
        // 顯示最低價格起
        const minPrice = Math.min(...card.stylists.map(s => s.price))
        return `NT$ ${minPrice} 起`
      }
      
      const stylist = card.stylists.find((s) => s?.stylistName === selectedDesigner)
      return stylist?.price ? `NT$ ${stylist.price}` : "價格請洽詢"
    } catch (error) {
      console.error('Error calculating card price:', error)
      return "價格請洽詢"
    }
  }

  const getSelectedStylistLevel = (): string | null => {
    try {
      if (selectedDesigner === "all" || !Array.isArray(card?.stylists) || !card.stylists.length) return null
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
      
      // 如果沒有選擇設計師或設計師沒有專用圖片，使用第一位設計師的圖片作為預設
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
      if (selectedDesigner === "all" || !Array.isArray(card?.stylists) || !card.stylists.length) return null
      const stylist = card.stylists.find((s) => s?.stylistName === selectedDesigner)
      return stylist?.stylistName ?? null
    } catch (error) {
      console.error('Error getting stylist name:', error)
      return null
    }
  }

  return (
    <div className="group bg-white text-center">
      {(() => {
        const cardImage = getCardImage()
        return cardImage.url ? (
          <div className="aspect-[4/3] relative overflow-hidden group">
            <Image
              src={cardImage.url}
              alt={cardImage.alt}
              fill
              className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-[0.95]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-all duration-500" />
          </div>
        ) : (
          <div className="aspect-[4/3] relative overflow-hidden bg-gray-100 flex items-center justify-center">
            <div className="text-gray-400 h4">
              No Image
            </div>
          </div>
        )
      })()}

      <div className="pt-6 pb-8 space-y-4">
        <div className="px-4 md:px-8">
          <div>
            <h4 className="h4">
              {card.title}
            </h4>
            {card.englishTitle && (
              <div className="h5">
                {card.englishTitle}
              </div>
            )}
          </div>
          <div className="h4 mt-2">
            {getCardPrice(card)}
          </div>
          {selectedDesigner && selectedDesigner !== "all" && (
            <div className="mt-3 space-y-1">
              {getSelectedStylistName() && (
                <div className="h4 text-gray-700 font-medium">
                  {getSelectedStylistName()}
                </div>
              )}
              {getSelectedStylistLevel() && (
                <div className="h4 text-gray-500">
                  {getSelectedStylistLevel()}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="px-4 md:px-8">
          <button 
            className="w-full py-3 border border-black h4 hover:bg-black hover:text-white transition-colors text-center bg-white"
            onClick={() => {
              // 這裡可以添加預約邏輯
              console.log('Book now clicked for:', card.title)
            }}
          >
            BOOK NOW
          </button>
        </div>
      </div>
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
        : []
    )
  )).sort()

  if (!validCards.length) {
    return null
  }

  return (
    <section className="py-16">
      <div className="container mx-auto">
        {(heading || subheading) && (
          <div className="mb-16 text-center px-4 md:px-8">
            {heading && (
              <h1 className="h1">{heading}</h1>
            )}
            {subheading && (
              <h3 className="h3">{subheading}</h3>
            )}
          </div>
        )}
        
        {allStylists.length > 0 && (
          <div className="mb-16">
            <div className="w-full max-w-[240px] mx-auto">
              <div className="text-center h4 text-gray-900 mb-3">
                SELECT STYLIST
              </div>
              <Select 
                value={selectedDesigner}
                onValueChange={setSelectedDesigner}
              >
                <Select.Trigger>
                  <Select.Value placeholder="ALL STYLISTS" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="all">ALL STYLISTS</Select.Item>
                  {allStylists.map((designer) => (
                    <Select.Item 
                      key={designer} 
                      value={designer}
                      className="h4"
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
          "grid grid-cols-1 gap-0",
          cardsPerRow === 3 && "sm:grid-cols-2 lg:grid-cols-3",
          cardsPerRow === 4 && "sm:grid-cols-2 lg:grid-cols-4"
        )}>
          {validCards.map((card, idx) => (
            <div key={`${selectedDesigner}-${idx}`}>
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
