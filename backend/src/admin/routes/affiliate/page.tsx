import { Users } from "lucide-react"

const AffiliatePage = () => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6" />
        import type { RouteProps } from "@medusajs/admin"

const AffiliatePage = (props: RouteProps) => {
  const openManagement = () => {
    window.open('/admin/affiliate-management', '_blank', 'width=1200,height=800')
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>聯盟行銷管理</h1>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button 
          onClick={openManagement}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          開啟聯盟行銷控制台
        </button>
        <span style={{ color: '#666' }}>管理聯盟夥伴、推薦連結和佣金</span>
      </div>
    </div>
  )
}

export const config = {
  path: "/affiliate",
  label: "聯盟行銷",
}

export default AffiliatePage
      </div>
      
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-medium mb-4">聯盟夥伴管理</h2>
        <p className="text-gray-600">
          這裡是聯盟行銷管理介面。您可以在這裡管理聯盟夥伴、查看統計數據和處理佣金支付。
        </p>
        
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900">總夥伴數</h3>
            <p className="text-2xl font-bold text-blue-600">2</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900">總點擊數</h3>
            <p className="text-2xl font-bold text-green-600">5</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium text-yellow-900">總佣金</h3>
            <p className="text-2xl font-bold text-yellow-600">NT$5,250</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AffiliatePage
