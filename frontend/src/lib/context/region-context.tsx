'use client'

import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useEffect, useState } from "react"

export type Region = {
  countryCode: string
  name: string
}

type RegionContext = {
  region: Region | null
  setRegion: Dispatch<SetStateAction<Region | null>>
}

// 提供一個預設值
const defaultContextValue: RegionContext = {
  region: null,
  setRegion: () => null,
}

export const RegionContext = createContext<RegionContext>(defaultContextValue)

export const RegionProvider = ({ children }: { children: ReactNode }) => {
  const [region, setRegion] = useState<Region | null>(null)

  useEffect(() => {
    // 從 localStorage 讀取區域設定，如果沒有則設為預設值
    if (typeof window !== 'undefined') {
      const savedCountryCode = localStorage.getItem("region") || "TW"
      setRegion({
        countryCode: savedCountryCode,
        name: savedCountryCode === "TW" ? "台灣" : "其他"
      })
    }
  }, [])

  const handleSetRegion = (newRegion: Region | null) => {
    setRegion(newRegion)
    if (typeof window !== 'undefined' && newRegion) {
      localStorage.setItem("region", newRegion.countryCode)
    }
  }

  return (
    <RegionContext.Provider value={{ region, setRegion: handleSetRegion }}>
      {children}
    </RegionContext.Provider>
  )

  return (
    <RegionContext.Provider value={value}>
      {children}
    </RegionContext.Provider>
  )
}

export const useRegion = () => {
  const context = useContext(RegionContext)
  if (context === undefined) {
    throw new Error("useRegion must be used within a RegionProvider")
  }
  return context
}
