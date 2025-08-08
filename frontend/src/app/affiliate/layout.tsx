import { Metadata } from "next"

export const metadata: Metadata = {
  title: "聯盟夥伴中心",
  description: "加入我們的聯盟計畫，開始賺取佣金",
}

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  )
}
