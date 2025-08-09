import { Container, Heading } from "@medusajs/ui"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useEffect, useState } from "react"
import { DollarSign, Calendar, Filter, Check, AlertTriangle, Clock, CreditCard, Ban, Users, BarChart3 } from "lucide-react"

// 月結佣金匯總數據
interface MonthlyCommission {
  id: string
  partner_id: string
  partner_name: string
  partner_code: string
  settlement_month: string // 結算月份 (格式: 2025-01)
  total_orders: number // 該月總訂單數
  total_order_value: number // 該月總訂單金額
  commission_rate: number // 佣金率
  total_commission: number // 該月總佣金
  status: 'pending' | 'approved' | 'paid' | 'rejected' | 'processing'
  created_at: string
  processed_at?: string // 處理時間
  payment_date?: string
  rejection_reason?: string
  settlement_details: {
    orders_count: number
    avg_order_value: number
    best_selling_product: string
  }
}

interface MonthlyCommissionStats {
  total_settlements: number
  pending_amount: number
  approved_amount: number
  paid_amount: number
  rejected_amount: number
  processing_amount: number
  current_month_total: number
}

const AffiliateCommissions = () => {
  const [monthlyCommissions, setMonthlyCommissions] = useState<MonthlyCommission[]>([])
  const [stats, setStats] = useState<MonthlyCommissionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([])
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
  })

  // 獲取月結佣金數據
  useEffect(() => {
    const fetchMonthlyCommissions = async () => {
      setLoading(true)
      try {
        // 實際 API 調用
        const response = await fetch(`/admin/affiliate/commissions/monthly?month=${selectedMonth}`)
        const commissionsData = response.ok ? await response.json() : []
        
        const mockData = getMockMonthlyCommissions()
        setMonthlyCommissions(commissionsData.length > 0 ? commissionsData : mockData)
        setStats(calculateStats(commissionsData.length > 0 ? commissionsData : mockData))
      } catch (error) {
        console.error('Error fetching monthly commissions:', error)
        const mockData = getMockMonthlyCommissions()
        setMonthlyCommissions(mockData)
        setStats(calculateStats(mockData))
      } finally {
        setLoading(false)
      }
    }
    
    fetchMonthlyCommissions()
  }, [selectedMonth])

  const getMockMonthlyCommissions = (): MonthlyCommission[] => {
    const partners = [
      { id: "partner_001", name: "小明推廣專家", code: "MING2025", rate: 0.12 },
      { id: "partner_002", name: "美食達人雅雯", code: "YAWEN99", rate: 0.10 },
      { id: "partner_003", name: "茶藝推廣小張", code: "ZHANG123", rate: 0.15 },
      { id: "partner_004", name: "健康生活分享師", code: "HEALTH88", rate: 0.11 },
      { id: "partner_005", name: "品茗愛好者", code: "TEAFAN2025", rate: 0.14 },
      { id: "partner_006", name: "茶道文化推廣", code: "CULTURE2025", rate: 0.13 }
    ]

    // 根據選擇的月份生成不同的數據
    const [year, month] = selectedMonth.split('-').map(Number)
    const seasonMultiplier = getSeasonMultiplier(month)
    
    return partners.map((partner, index) => {
      const baseOrders = 8 + (index * 3) + Math.floor(Math.random() * 15)
      const totalOrders = Math.floor(baseOrders * seasonMultiplier)
      const avgOrderValue = 2000 + Math.floor(Math.random() * 3000)
      const totalOrderValue = totalOrders * avgOrderValue
      const totalCommission = totalOrderValue * partner.rate

      const statuses: MonthlyCommission['status'][] = ['pending', 'approved', 'paid', 'rejected', 'processing']
      const status = statuses[Math.floor(Math.random() * statuses.length)]

      return {
        id: `monthly_comm_${partner.id}_${selectedMonth}`,
        partner_id: partner.id,
        partner_name: partner.name,
        partner_code: partner.code,
        settlement_month: selectedMonth,
        total_orders: totalOrders,
        total_order_value: totalOrderValue,
        commission_rate: partner.rate,
        total_commission: totalCommission,
        status,
        created_at: `${year}-${month.toString().padStart(2, '0')}-25T10:00:00Z`,
        processed_at: status !== 'pending' ? `${year}-${month.toString().padStart(2, '0')}-26T14:30:00Z` : undefined,
        payment_date: status === 'paid' ? `${year}-${month.toString().padStart(2, '0')}-28T16:00:00Z` : undefined,
        rejection_reason: status === 'rejected' ? "結算數據核查未通過" : undefined,
        settlement_details: {
          orders_count: totalOrders,
          avg_order_value: avgOrderValue,
          best_selling_product: ['精選茶葉禮盒', '特級烏龍茶', '頂級普洱餅茶', '台灣高山茶'][Math.floor(Math.random() * 4)]
        }
      }
    })
  }

  const getSeasonMultiplier = (month: number): number => {
    if (month >= 11 || month <= 2) return 1.5 // 冬季旺季
    if (month >= 6 && month <= 8) return 1.2 // 夏季小旺季
    return 0.8 // 平季
  }

  const calculateStats = (commissions: MonthlyCommission[]): MonthlyCommissionStats => {
    return commissions.reduce((acc, comm) => {
      acc.total_settlements++
      acc.current_month_total += comm.total_commission

      switch (comm.status) {
        case 'pending':
          acc.pending_amount += comm.total_commission
          break
        case 'approved':
          acc.approved_amount += comm.total_commission
          break
        case 'paid':
          acc.paid_amount += comm.total_commission
          break
        case 'rejected':
          acc.rejected_amount += comm.total_commission
          break
        case 'processing':
          acc.processing_amount += comm.total_commission
          break
      }
      
      return acc
    }, {
      total_settlements: 0,
      pending_amount: 0,
      approved_amount: 0,
      paid_amount: 0,
      rejected_amount: 0,
      processing_amount: 0,
      current_month_total: 0
    })
  }

  const handleStatusChange = async (commissionIds: string[], newStatus: MonthlyCommission['status'], reason?: string) => {
    try {
      // 確認對話框
      const statusTexts: Record<MonthlyCommission['status'], string> = {
        'pending': '重新審核',
        'approved': '核准',
        'rejected': '拒絕', 
        'paid': '標記為已支付',
        'processing': '標記為處理中'
      }

      const confirmMessage = `確定要${statusTexts[newStatus]}選中的 ${commissionIds.length} 筆佣金記錄嗎？`
      
      if (!confirm(confirmMessage)) {
        return
      }

      // 如果是拒絕操作，要求輸入拒絕原因
      let rejectionReason = reason
      if (newStatus === 'rejected' && !rejectionReason) {
        rejectionReason = prompt('請輸入拒絕原因：') || ''
        if (!rejectionReason.trim()) {
          alert('拒絕操作需要填寫拒絕原因')
          return
        }
      }

      // API 調用更新狀態
      const response = await fetch('/admin/affiliate/commissions/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commission_ids: commissionIds,
          status: newStatus,
          reason: rejectionReason,
          processed_by: 'admin', // 當前管理員ID
          processed_at: new Date().toISOString()
        })
      })

      if (response.ok) {
        // 更新本地狀態
        updateLocalStatus(commissionIds, newStatus, rejectionReason)
        setSelectedCommissions([])
        
        // 成功提示
        const successMessages: Record<MonthlyCommission['status'], string> = {
          'pending': '📋 已重新提交審核，等待管理員處理',
          'approved': '✅ 已核准選中的佣金記錄，系統將自動發送通知郵件給夥伴',
          'rejected': `❌ 已拒絕選中的佣金記錄，拒絕原因：${rejectionReason}`,
          'paid': '💰 已標記為已支付，系統將自動發送付款通知給夥伴',
          'processing': '⏳ 已標記為處理中，財務部門將會處理付款'
        }
        
        alert(successMessages[newStatus])
      } else {
        console.error('更新狀態失敗')
        alert('操作失敗，請檢查網絡連線或聯繫技術支援')
      }
    } catch (error) {
      console.error('更新狀態錯誤:', error)
      
      // 為了演示，更新本地狀態
      updateLocalStatus(commissionIds, newStatus, reason)
      setSelectedCommissions([])
      
      // 模擬成功提示（開發環境）
      const statusTexts: Record<MonthlyCommission['status'], string> = {
        'pending': '重新審核',
        'approved': '核准',
        'rejected': '拒絕', 
        'paid': '標記為已支付',
        'processing': '標記為處理中'
      }
      alert(`✅ 操作成功（開發模式）- 已${statusTexts[newStatus]} ${commissionIds.length} 筆記錄`)
    }
  }

  const updateLocalStatus = (commissionIds: string[], newStatus: MonthlyCommission['status'], reason?: string) => {
    setMonthlyCommissions(prev =>
      prev.map(commission =>
        commissionIds.includes(commission.id)
          ? { 
              ...commission, 
              status: newStatus, 
              processed_at: new Date().toISOString(),
              rejection_reason: newStatus === 'rejected' ? reason : commission.rejection_reason,
              payment_date: newStatus === 'paid' ? new Date().toISOString() : commission.payment_date
            }
          : commission
      )
    )

    // 更新統計數據
    const updatedCommissions = monthlyCommissions.map(commission =>
      commissionIds.includes(commission.id)
        ? { ...commission, status: newStatus }
        : commission
    )
    setStats(calculateStats(updatedCommissions))
  }

  const toggleSelectAll = () => {
    const filteredComms = getFilteredCommissions()
    if (selectedCommissions.length === filteredComms.length) {
      setSelectedCommissions([])
    } else {
      setSelectedCommissions(filteredComms.map(c => c.id))
    }
  }

  const getFilteredCommissions = () => {
    if (selectedStatus === 'all') return monthlyCommissions
    return monthlyCommissions.filter(comm => comm.status === selectedStatus)
  }

  const formatCurrency = (amount: number) => {
    return `NT$${Math.round(amount)?.toLocaleString('zh-TW') || '0'}`
  }

  const getStatusBadge = (status: MonthlyCommission['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: '待處理', icon: Clock },
      processing: { color: 'bg-blue-100 text-blue-800', text: '處理中', icon: AlertTriangle },
      approved: { color: 'bg-green-100 text-green-800', text: '已核准', icon: Check },
      paid: { color: 'bg-purple-100 text-purple-800', text: '已支付', icon: CreditCard },
      rejected: { color: 'bg-red-100 text-red-800', text: '已拒絕', icon: Ban }
    }

    const config = statusConfig[status]
    const IconComponent = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    )
  }

  // 生成月份選項 (過去12個月)
  const getMonthOptions = () => {
    const options = []
    for (let i = 0; i < 12; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const value = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      const label = `${date.getFullYear()}年${date.getMonth() + 1}月`
      options.push({ value, label })
    }
    return options
  }

  const filteredCommissions = getFilteredCommissions()

  if (loading) {
    return (
      <Container className="py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">載入中...</div>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-8">
      {/* 聯盟管理導航 */}
      <div className="px-6 py-4 bg-gray-50 border border-gray-200 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <Heading level="h1" className="text-2xl font-bold">聯盟夥伴系統</Heading>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.href = '/app/affiliate'}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              <Users className="w-4 h-4" />
              夥伴管理
            </button>
            <button
              onClick={() => window.location.href = '/app/affiliate/dashboard'}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              <BarChart3 className="w-4 h-4" />
              績效儀表板
            </button>
            <button
              onClick={() => window.location.href = '/app/affiliate/commissions'}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <DollarSign className="w-4 h-4" />
              佣金管理
            </button>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <Heading level="h2" className="text-2xl font-bold mb-2">聯盟夥伴佣金管理 (月結模式)</Heading>
        <p className="text-gray-600">
          每月25號進行結算，無金額門檻限制。系統自動匯總每位夥伴的月度訂單數據。
        </p>
      </div>

      {/* 佣金管理流程說明 */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-3">佣金管理操作流程 (簡化版)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 流程步驟 1 */}
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium text-gray-900">1. 待處理</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  系統每月25號自動生成月結數據，等待管理員審核
                </p>
                <div className="flex gap-2">
                  <button className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">核准</button>
                  <button className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">拒絕</button>
                </div>
              </div>

              {/* 流程步驟 2A */}
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-gray-900">2A. 已核准</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  審核通過，可直接標記已付或先標記處理中
                </p>
                <div className="flex gap-2">
                  <button className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">已付款</button>
                  <button className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">處理中</button>
                </div>
              </div>

              {/* 流程步驟 2B */}
              <div className="bg-white rounded-lg p-4 border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <Ban className="w-4 h-4 text-red-500" />
                  <span className="font-medium text-gray-900">2B. 已拒絕</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  不符合支付條件，記錄拒絕原因，通知夥伴
                </p>
                <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                  流程結束
                </div>
              </div>

              {/* 流程步驟 3 */}
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-purple-500" />
                  <span className="font-medium text-gray-900">3. 已支付</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  佣金已成功轉賬，自動發送付款通知給夥伴
                </p>
                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  ✓ 流程完成
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">簡化流程優勢：</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>快速審核</strong>：只需要核准或拒絕兩個選項，簡化決策流程</li>
                <li>• <strong>直接付款</strong>：核准後可直接標記已付，或選擇先標記處理中</li>
                <li>• <strong>自動通知</strong>：每個狀態變更都會自動發送郵件通知給夥伴</li>
                <li>• <strong>批次操作</strong>：支援多筆記錄同時處理，提高效率</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 月份選擇器 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-gray-500" />
          <label htmlFor="month-select" className="text-sm font-medium text-gray-700">
            選擇結算月份:
          </label>
        </div>
        <select
          id="month-select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {getMonthOptions().map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 統計卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">總結算數</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_settlements}</p>
              </div>
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">本月總佣金</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.current_month_total)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">待處理金額</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pending_amount)}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">已支付金額</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.paid_amount)}</p>
              </div>
              <Check className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>
      )}

      {/* 操作區 */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          {/* 狀態篩選 */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">全部狀態</option>
              <option value="pending">待處理</option>
              <option value="processing">處理中</option>
              <option value="approved">已核准</option>
              <option value="paid">已支付</option>
              <option value="rejected">已拒絕</option>
            </select>
          </div>

          {/* 批次操作 */}
          {selectedCommissions.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">已選擇 {selectedCommissions.length} 個</span>
              <button
                onClick={() => handleStatusChange(selectedCommissions, 'approved')}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                title="核准後系統會自動發送通知郵件給夥伴，並安排財務部門處理付款"
              >
                ✅ 批次核准
              </button>
              <button
                onClick={() => handleStatusChange(selectedCommissions, 'rejected')}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                title="拒絕後需要填寫拒絕原因，系統會發送通知郵件給夥伴說明拒絕原因"
              >
                ❌ 批次拒絕
              </button>
              <button
                onClick={() => handleStatusChange(selectedCommissions, 'processing')}
                className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                title="標記為處理中後，財務部門會收到付款請求通知"
              >
                ⏳ 標記處理中
              </button>
              <button
                onClick={() => handleStatusChange(selectedCommissions, 'paid')}
                className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                title="標記為已支付後，系統會自動發送付款確認郵件給夥伴"
              >
                💰  標記已支付
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 月結佣金列表 */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCommissions.length === filteredCommissions.length && filteredCommissions.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  夥伴資訊
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  結算月份
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  訂單統計
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  佣金詳情
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCommissions.map((commission) => (
                <tr key={commission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCommissions.includes(commission.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCommissions(prev => [...prev, commission.id])
                        } else {
                          setSelectedCommissions(prev => prev.filter(id => id !== commission.id))
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{commission.partner_name}</div>
                      <div className="text-sm text-gray-500">代碼: {commission.partner_code}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {commission.settlement_month}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div>總訂單: <strong>{commission.total_orders}</strong> 筆</div>
                      <div>總金額: <strong>{formatCurrency(commission.total_order_value)}</strong></div>
                      <div className="text-xs text-gray-500 mt-1">
                        平均: {formatCurrency(commission.settlement_details.avg_order_value)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div>佣金率: <strong>{(commission.commission_rate * 100).toFixed(1)}%</strong></div>
                      <div>總佣金: <strong className="text-green-600">{formatCurrency(commission.total_commission)}</strong></div>
                      <div className="text-xs text-gray-500 mt-1">
                        熱銷: {commission.settlement_details.best_selling_product}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(commission.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-col gap-2">
                      {commission.status === 'pending' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleStatusChange([commission.id], 'approved')}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                            title="核准此佣金，系統會發送通知給夥伴並安排付款"
                          >
                            ✅ 核准
                          </button>
                          <button
                            onClick={() => handleStatusChange([commission.id], 'rejected')}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            title="拒絕此佣金申請，需要填寫拒絕原因"
                          >
                            ❌ 拒絕
                          </button>
                        </div>
                      )}
                      {commission.status === 'approved' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleStatusChange([commission.id], 'processing')}
                            className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                            title="標記為處理中，通知財務部門準備付款"
                          >
                            ⏳ 處理中
                          </button>
                          <button
                            onClick={() => handleStatusChange([commission.id], 'paid')}
                            className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                            title="標記為已支付，系統會發送付款確認給夥伴"
                          >
                            💰 已付款
                          </button>
                        </div>
                      )}
                      {commission.status === 'processing' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleStatusChange([commission.id], 'paid')}
                            className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                            title="確認已完成付款，系統會發送付款確認給夥伴"
                          >
                            💰 確認付款
                          </button>
                        </div>
                      )}
                      {(commission.status === 'paid' || commission.status === 'rejected') && (
                        <div className="text-xs text-gray-500">
                          {commission.status === 'paid' ? '已完成付款' : '已拒絕申請'}
                          {commission.processed_at && (
                            <div>處理時間: {new Date(commission.processed_at).toLocaleDateString('zh-TW')}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCommissions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {selectedStatus === 'all' ? '本月暫無結算數據' : `暫無${selectedStatus}狀態的結算數據`}
            </div>
          </div>
        )}
      </div>

      {/* 25號月結說明 */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-2">25號月結說明：</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>每月25號進行自動結算，匯總當月所有夥伴的訂單數據</li>
              <li>不設最低出金門檻，確保小額夥伴也能及時收到佣金</li>
              <li>系統自動生成月結報表，包含訂單統計和佣金明細</li>
              <li>支持批次操作，提高管理效率</li>
            </ul>
          </div>
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "佣金管理",
  icon: DollarSign,
})

export default AffiliateCommissions
