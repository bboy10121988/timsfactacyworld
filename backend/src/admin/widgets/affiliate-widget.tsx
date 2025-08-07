import { defineWidgetConfig } from "@medusajs/admin"
import { Container, Button } from "@medusajs/ui"

const AffiliateWidget = () => {
  const openAffiliateManagement = () => {
    // 在新視窗開啟管理介面
    window.open('/admin/affiliate-management', '_blank')
  }

  return (
    <Container className="p-4">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">聯盟行銷管理</h2>
        <Button onClick={openAffiliateManagement}>
          開啟聯盟行銷控制台
        </Button>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.before",
})

export default AffiliateWidget
