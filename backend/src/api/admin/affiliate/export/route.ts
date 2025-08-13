import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * 導出數據 API
 */
export async function GET(
  req: MedusaRequest, 
  res: MedusaResponse
) {
  try {
    const affiliateService = req.scope.resolve("affiliate")
    const { type, format = 'json', dateFrom, dateTo, status } = req.query as any
    
    // 驗證必要參數
    if (!type || !['partners', 'commissions', 'payments'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing type parameter',
        message: 'type must be one of: partners, commissions, payments'
      })
    }

    let data: any = null

    // 根據類型獲取不同的數據
    switch (type) {
      case 'partners':
        data = await affiliateService.getAdminPartners({
          page: 1,
          limit: 10000, // 導出時不限制數量
          status: status as any
        })
        break

      case 'commissions':
        data = await affiliateService.getAdminCommissions({
          page: 1,
          limit: 10000,
          status: status as any
        })
        break

      case 'payments':
        // 假設有支付數據的查詢方法
        data = await affiliateService.getAdminCommissions({
          page: 1,
          limit: 10000,
          status: 'paid'
        })
        break
    }

    if (format === 'csv') {
      // 轉換為 CSV 格式
      const csvData = convertToCSV(data.items || data, type)
      
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="${type}_export_${new Date().toISOString().split('T')[0]}.csv"`)
      
      return res.status(200).send(csvData)
    }

    // JSON 格式響應
    return res.status(200).json({
      success: true,
      exportType: type,
      format,
      exportDate: new Date().toISOString(),
      filters: {
        dateFrom,
        dateTo,
        status
      },
      data: data
    })

  } catch (error) {
    console.error('數據導出失敗:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * 將數據轉換為 CSV 格式
 */
function convertToCSV(data: any[], type: string): string {
  if (!data || data.length === 0) {
    return ''
  }

  let headers: string[] = []
  let rows: string[][] = []

  switch (type) {
    case 'partners':
      headers = ['ID', 'Name', 'Email', 'Status', 'Commission Rate', 'Total Earnings', 'Created Date']
      rows = data.map(partner => [
        partner.id?.toString() || '',
        partner.name || '',
        partner.email || '',
        partner.status || '',
        (partner.commission_rate * 100).toFixed(2) + '%',
        partner.total_earnings?.toString() || '0',
        new Date(partner.created_at).toISOString().split('T')[0]
      ])
      break

    case 'commissions':
    case 'payments':
      headers = ['ID', 'Partner Name', 'Order ID', 'Amount', 'Status', 'Created Date']
      rows = data.map(commission => [
        commission.id?.toString() || '',
        commission.partner_name || '',
        commission.order_id || '',
        commission.amount?.toString() || '0',
        commission.status || '',
        new Date(commission.created_at).toISOString().split('T')[0]
      ])
      break
  }

  // 構建 CSV 內容
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(field => `"${field}"`).join(','))
  ].join('\n')

  return csvContent
}
