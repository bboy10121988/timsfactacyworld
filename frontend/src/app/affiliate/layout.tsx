import { Metadata } from "next"
import Nav from "@modules/layout/templates/nav"

export const metadata: Metadata = {
  title: "聯盟夥伴中心",
  description: "管理您的聯盟行銷活動、追蹤績效和查看佣金收益",
}

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        {children}
      </div>
    </div>
  )
}
