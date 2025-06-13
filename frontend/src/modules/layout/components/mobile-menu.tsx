"use client"

import { useState, useRef, useEffect } from "react"
import { XMarkIcon, Bars3Icon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "@modules/layout/components/country-select"
import { SanityHeader } from "../../../types/global"

type MobileMenuProps = {
  regions: StoreRegion[]
  navigation?: Array<{name: string; href: string}>
  categories?: Array<{id: string; handle: string; name: string}>
}

export default function MobileMenu({ regions, navigation, categories }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [cart, setCart] = useState<any>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus()
    }
  }, [showSearch])

  useEffect(() => {
    const fetchCart = async () => {
      const cartData = await fetch("/api/cart").then((res) => res.json()).catch(() => null)
      setCart(cartData)
    }
    fetchCart()
  }, [])

  const totalItems = cart?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0

  return (
    <div className="block xsmall:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center w-8 h-8"
      >
        <Bars3Icon className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex-1"></div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center w-8 h-8"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Search */}
            <div className="flex items-center">
              {showSearch ? (
                <div className="relative w-full">
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="搜尋商品..."
                    className="w-full p-2 border rounded-lg"
                    onBlur={() => setShowSearch(false)}
                  />
                </div>
              ) : (
                <button 
                  onClick={() => setShowSearch(true)}
                  className="p-2"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Navigation */}
            {navigation && navigation.map(({ name, href }, index) => {
              // 判斷是否為外部連結
              const isExternal = /^(http|https|www)/.test(href)
              // 判斷是否為首頁連結 (支援 / 和 /home)
              const isHome = href === '/' || href === '/home'
              // 處理連結
              const processedHref = isExternal 
                ? href 
                : isHome 
                  ? '/'
                  : href.startsWith('/') 
                    ? href 
                    : `/${href}`

              const uniqueKey = `mobile-nav-${index}-${name.replace(/[^a-zA-Z0-9]/g, '')}-${href.replace(/[^a-zA-Z0-9]/g, '')}`

              return isExternal ? (
                <a
                  key={uniqueKey}
                  href={href}
                  className="block py-2 text-lg"
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                >
                  {name}
                </a>
              ) : (
                <LocalizedClientLink
                  key={uniqueKey}
                  href={processedHref}
                  className="block py-2 text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  {name}
                </LocalizedClientLink>
              )
            })}

            {regions && (
              <div className="pt-4 border-t">
                <CountrySelect regions={regions} />
              </div>
            )}

            {/* Categories */}
            {categories && categories.length > 0 && (
              <div className="pt-2 border-t">
                <h3 className="py-2 font-medium">商品分類</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <LocalizedClientLink
                      key={category.id}
                      href={`/categories/${category.handle}`}
                      className="block py-1 text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      {category.name}
                    </LocalizedClientLink>
                  ))}
                </div>
              </div>
            )}

            {/* Account & Cart */}
            <div className="pt-2 border-t">
              <LocalizedClientLink
                href="/account"
                className="block py-2 text-lg"
                onClick={() => setIsOpen(false)}
              >
                Account
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/cart"
                className="block py-2 text-lg"
                onClick={() => setIsOpen(false)}
              >
                Cart ({totalItems})
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
