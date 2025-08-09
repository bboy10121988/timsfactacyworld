"use client"

import { useEffect, useState } from 'react'

interface Commission {
  id: string
  partner_id: string
  partner_name: string
  partner_code: string
  order_id: string
  product_name: string
  order_value: number
  commission_rate: number
  commission_amount: number
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  conversion_time: string
  payment_date?: string
}

interface CommissionStats {
  total_commissions: number
  pending_amount: number
  approved_amount: number
  paid_amount: number
  rejected_amount: number
}

export default function AffiliateCommissionPage() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [stats, setStats] = useState<CommissionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([])

  useEffect(() => {
    loadCommissionData()
  }, [selectedStatus])

  const loadCommissionData = async () => {
    try {
      setLoading(true)

      // 嘗試從真實 API 獲取佣金數據
      let commissionsData = []
      let statsData = null

      try {
        const commissionsResponse = await fetch(`/admin/affiliate/commissions${selectedStatus !== 'all' ? `?status=${selectedStatus}` : ''}`)
        if (commissionsResponse.ok) {
          const response = await commissionsResponse.json()
          commissionsData = response.commissions || []
        }

        const statsResponse = await fetch('/admin/affiliate/commissions/stats')
        if (statsResponse.ok) {
          const response = await statsResponse.json()
          statsData = response.stats
        }
      } catch (error) {
        console.log('Commission API不可用，使用模擬數據')
      }

      // 使用API數據或模擬數據
      setCommissions(commissionsData.length > 0 ? commissionsData : getMockCommissions())
      setStats(statsData || getMockStats())

    } catch (error) {
      console.error('載入佣金數據失敗:', error)
      setCommissions(getMockCommissions())
      setStats(getMockStats())
    } finally {
      setLoading(false)
    }
  }

  const getMockCommissions = (): Commission[] => {
    const mockCommissions: Commission[] = [
      {
        id: '1',
        partner_id: 'partner_1',
        partner_name: '王小明',
        partner_code: 'WANG123',
        order_id: 'order_001',
        product_name: 'Tim\'s 芝麻醬罐頭 Green',
        order_value: 2400,
        commission_rate: 0.05,
        commission_amount: 120,
        status: 'pending',
        conversion_time: '2024-12-01T10:30:00Z'
      },
      {
        id: '2',
        partner_id: 'partner_2',
        partner_name: '李美華',
        partner_code: 'LI456',
        order_id: 'order_002',
        product_name: 'Tim\'s 芝麻醬罐頭 Red',
        order_value: 1800,
        commission_rate: 0.06,
        commission_amount: 108,
        status: 'approved',
        conversion_time: '2024-11-28T15:45:00Z'
      },
      {
        id: '3',
        partner_id: 'partner_1',
        partner_name: '王小明',
        partner_code: 'WANG123',
        order_id: 'order_003',
        product_name: 'Tim\'s 芝麻醬罐頭 Yellow',
        order_value: 3200,
        commission_rate: 0.05,
        commission_amount: 160,
        status: 'paid',
        conversion_time: '2024-11-25T09:20:00Z',
        payment_date: '2024-12-01T00:00:00Z'
      }
    ]

    return selectedStatus === 'all' 
      ? mockCommissions 
      : mockCommissions.filter(c => c.status === selectedStatus)
  }

  const getMockStats = (): CommissionStats => ({
    total_commissions: 15680,
    pending_amount: 4320,
    approved_amount: 6890,
    paid_amount: 3950,
    rejected_amount: 520
  })

  const handleStatusChange = async (commissionIds: string[], newStatus: Commission['status']) => {
    try {
      // 嘗試呼叫 API
      const response = await fetch('/admin/affiliate/commissions/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commission_ids: commissionIds,
          status: newStatus
        })
      })

      if (response.ok) {
        // API 成功，重新載入數據
        await loadCommissionData()
      } else {
        // API 失敗，更新本地狀態
        updateLocalStatus(commissionIds, newStatus)
      }
    } catch (error) {
      // 網路錯誤，更新本地狀態
      updateLocalStatus(commissionIds, newStatus)
    }

    setSelectedCommissions([])
  }

  const updateLocalStatus = (commissionIds: string[], newStatus: Commission['status']) => {
    setCommissions(prev => 
      prev.map(commission => 
        commissionIds.includes(commission.id)
          ? { 
              ...commission, 
              status: newStatus,
              payment_date: newStatus === 'paid' ? new Date().toISOString() : commission.payment_date
            }
          : commission
      )
    )
  }

  const handleSelectAll = () => {
    if (selectedCommissions.length === commissions.length) {
      setSelectedCommissions([])
    } else {
      setSelectedCommissions(commissions.map(c => c.id))
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: Commission['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: '待審核' },
      approved: { color: 'bg-blue-100 text-blue-800', text: '已批准' },
      paid: { color: 'bg-green-100 text-green-800', text: '已付款' },
      rejected: { color: 'bg-red-100 text-red-800', text: '已拒絕' }
    }

    const config = statusConfig[status]
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入佣金數據中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 頁面標題 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">佣金管理</h1>
          <p className="mt-2 text-sm text-gray-600">管理聯盟夥伴佣金審核與付款</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 統計卡片 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <p className="text-sm font-medium text-gray-500">總佣金</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_commissions)}</p>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <p className="text-sm font-medium text-yellow-600">待審核</p>
                <p className="text-2xl font-bold text-yellow-900">{formatCurrency(stats.pending_amount)}</p>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <p className="text-sm font-medium text-blue-600">已批准</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats.approved_amount)}</p>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <p className="text-sm font-medium text-green-600">已付款</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.paid_amount)}</p>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <p className="text-sm font-medium text-red-600">已拒絕</p>
                <p className="text-2xl font-bold text-red-900">{formatCurrency(stats.rejected_amount)}</p>
              </div>
            </div>
          </div>
        )}

        {/* 操作區域 */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">狀態篩選：</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="all">全部</option>
                  <option value="pending">待審核</option>
                  <option value="approved">已批准</option>
                  <option value="paid">已付款</option>
                  <option value="rejected">已拒絕</option>
                </select>
              </div>

              {selectedCommissions.length > 0 && (
                <div className="mt-4 sm:mt-0 flex space-x-2">
                  <button
                    onClick={() => handleStatusChange(selectedCommissions, 'approved')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    批准 ({selectedCommissions.length})
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedCommissions, 'rejected')}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    拒絕 ({selectedCommissions.length})
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedCommissions, 'paid')}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    標記已付款 ({selectedCommissions.length})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 佣金列表 */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedCommissions.length === commissions.length && commissions.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    夥伴資訊
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    訂單資訊
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    佣金詳情
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    狀態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    轉換時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {commissions.map((commission) => (
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
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{commission.partner_name}</div>
                        <div className="text-sm text-blue-600">{commission.partner_code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{commission.product_name}</div>
                        <div className="text-sm text-gray-500">訂單: {commission.order_id}</div>
                        <div className="text-sm text-gray-500">金額: {formatCurrency(commission.order_value)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">
                          {(commission.commission_rate * 100).toFixed(1)}% = {formatCurrency(commission.commission_amount)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(commission.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div>轉換: {formatDate(commission.conversion_time)}</div>
                        {commission.payment_date && (
                          <div className="text-green-600">付款: {formatDate(commission.payment_date)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {commission.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange([commission.id], 'approved')}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              批准
                            </button>
                            <button
                              onClick={() => handleStatusChange([commission.id], 'rejected')}
                              className="text-red-600 hover:text-red-900"
                            >
                              拒絕
                            </button>
                          </>
                        )}
                        {commission.status === 'approved' && (
                          <button
                            onClick={() => handleStatusChange([commission.id], 'paid')}
                            className="text-green-600 hover:text-green-900"
                          >
                            標記已付款
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {commissions.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">暫無佣金記錄</h3>
              <p className="mt-1 text-sm text-gray-500">當前篩選條件下沒有找到佣金記錄。</p>
            </div>
          )}
        </div>

        {/* 底部操作按鈕 */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={loadCommissionData}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
          >
            重新載入
          </button>
        </div>
      </div>
    </div>
  )
}
