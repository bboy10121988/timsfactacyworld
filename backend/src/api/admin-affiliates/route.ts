import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * 管理員聯盟夥伴管理介面
 * GET /admin-affiliates - 顯示聯盟夥伴管理頁面
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  // 返回 HTML 管理介面
  const html = `
  <!DOCTYPE html>
  <html lang="zh-TW">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>聯盟夥伴管理</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    </style>
  </head>
  <body class="bg-gray-50">
    <div id="app">
      <!-- 頁面載入中 -->
      <div class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">載入中...</p>
        </div>
      </div>
    </div>

    <script>
      // 管理介面主應用
      class AdminApp {
        constructor() {
          this.currentView = 'overview'
          this.partners = []
          this.stats = {}
          this.filters = {
            status: 'all',
            search: '',
            dateRange: 'all'
          }
          this.init()
        }

        async init() {
          await this.loadData()
          this.render()
          this.bindEvents()
        }

        async loadData() {
          try {
            // 載入聯盟夥伴數據
            const partnersRes = await fetch('/store/affiliate/partners')
            if (partnersRes.ok) {
              const data = await partnersRes.json()
              this.partners = data.partners || []
            }

            // 計算統計數據
            this.calculateStats()
          } catch (error) {
            console.error('載入數據失敗:', error)
          }
        }

        calculateStats() {
          const total = this.partners.length
          const pending = this.partners.filter(p => p.status === 'pending').length
          const approved = this.partners.filter(p => p.status === 'approved').length
          const rejected = this.partners.filter(p => p.status === 'rejected').length
          
          this.stats = {
            total,
            pending,
            approved,
            rejected
          }
        }

        render() {
          const app = document.getElementById('app')
          app.innerHTML = \`
            <div class="min-h-screen bg-gray-50">
              <!-- 導航欄 -->
              <nav class="bg-white shadow-sm border-b">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                      <h1 class="text-xl font-semibold text-gray-900">聯盟夥伴管理</h1>
                    </div>
                    <div class="flex items-center space-x-4">
                      <button onclick="adminApp.exportData()" class="btn-secondary">
                        <i data-lucide="download" class="w-4 h-4 mr-2"></i>
                        匯出數據
                      </button>
                    </div>
                  </div>
                </div>
              </nav>

              <!-- 主內容 -->
              <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <!-- 統計卡片 -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  \${this.renderStatsCards()}
                </div>

                <!-- 過濾器 -->
                <div class="bg-white rounded-lg shadow mb-6 p-6">
                  \${this.renderFilters()}
                </div>

                <!-- 夥伴列表 -->
                <div class="bg-white rounded-lg shadow">
                  \${this.renderPartnersList()}
                </div>
              </div>

              <!-- 詳細資訊彈窗 -->
              <div id="modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50">
                <div class="flex items-center justify-center min-h-screen p-4">
                  <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div id="modal-content"></div>
                  </div>
                </div>
              </div>
            </div>
          \`

          // 初始化 Lucide 圖標
          lucide.createIcons()
        }

        renderStatsCards() {
          return \`
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <i data-lucide="users" class="h-6 w-6 text-gray-400"></i>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">總夥伴數</dt>
                      <dd class="text-lg font-medium text-gray-900">\${this.stats.total}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <i data-lucide="clock" class="h-6 w-6 text-yellow-400"></i>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">待審核</dt>
                      <dd class="text-lg font-medium text-gray-900">\${this.stats.pending}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <i data-lucide="check-circle" class="h-6 w-6 text-green-400"></i>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">已核准</dt>
                      <dd class="text-lg font-medium text-gray-900">\${this.stats.approved}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <i data-lucide="x-circle" class="h-6 w-6 text-red-400"></i>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">已拒絕</dt>
                      <dd class="text-lg font-medium text-gray-900">\${this.stats.rejected}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          \`
        }

        renderFilters() {
          return \`
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">狀態篩選</label>
                <select id="statusFilter" class="form-select">
                  <option value="all">全部狀態</option>
                  <option value="pending">待審核</option>
                  <option value="approved">已核准</option>
                  <option value="rejected">已拒絕</option>
                  <option value="suspended">已暫停</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">搜尋</label>
                <input type="text" id="searchInput" placeholder="搜尋夥伴名稱或電子郵件" class="form-input" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">操作</label>
                <button onclick="adminApp.applyFilters()" class="btn-primary w-full">
                  <i data-lucide="search" class="w-4 h-4 mr-2"></i>
                  套用篩選
                </button>
              </div>
            </div>
          \`
        }

        renderPartnersList() {
          const filteredPartners = this.getFilteredPartners()
          
          return \`
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">夥伴列表 (\${filteredPartners.length})</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">夥伴資訊</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">佣金率</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">註冊時間</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  \${filteredPartners.map(partner => this.renderPartnerRow(partner)).join('')}
                </tbody>
              </table>
            </div>
          \`
        }

        renderPartnerRow(partner) {
          const statusColors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'approved': 'bg-green-100 text-green-800',
            'rejected': 'bg-red-100 text-red-800',
            'suspended': 'bg-gray-100 text-gray-800'
          }

          const statusTexts = {
            'pending': '待審核',
            'approved': '已核准',
            'rejected': '已拒絕',
            'suspended': '已暫停'
          }

          return \`
            <tr>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <i data-lucide="user" class="h-5 w-5 text-gray-600"></i>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">\${partner.name}</div>
                    <div class="text-sm text-gray-500">\${partner.email}</div>
                    <div class="text-xs text-gray-400">代碼: \${partner.affiliate_code}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full \${statusColors[partner.status]}">
                  \${statusTexts[partner.status]}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                \${(partner.commission_rate * 100).toFixed(1)}%
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                \${new Date(partner.created_at).toLocaleDateString('zh-TW')}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button onclick="adminApp.viewPartner('\${partner.id}')" class="text-blue-600 hover:text-blue-900">
                  查看
                </button>
                \${partner.status === 'pending' ? \`
                  <button onclick="adminApp.approvePartner('\${partner.id}')" class="text-green-600 hover:text-green-900">
                    核准
                  </button>
                  <button onclick="adminApp.rejectPartner('\${partner.id}')" class="text-red-600 hover:text-red-900">
                    拒絕
                  </button>
                \` : ''}
                \${partner.status === 'approved' ? \`
                  <button onclick="adminApp.suspendPartner('\${partner.id}')" class="text-gray-600 hover:text-gray-900">
                    暫停
                  </button>
                \` : ''}
              </td>
            </tr>
          \`
        }

        getFilteredPartners() {
          return this.partners.filter(partner => {
            const matchesStatus = this.filters.status === 'all' || partner.status === this.filters.status
            const matchesSearch = !this.filters.search || 
              partner.name.toLowerCase().includes(this.filters.search.toLowerCase()) ||
              partner.email.toLowerCase().includes(this.filters.search.toLowerCase())
            
            return matchesStatus && matchesSearch
          })
        }

        bindEvents() {
          // ESC 鍵關閉彈窗
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
              this.closeModal()
            }
          })

          // 點擊彈窗外部關閉
          document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal') {
              this.closeModal()
            }
          })
        }

        applyFilters() {
          this.filters.status = document.getElementById('statusFilter').value
          this.filters.search = document.getElementById('searchInput').value
          this.render()
        }

        async viewPartner(partnerId) {
          const partner = this.partners.find(p => p.id === partnerId)
          if (!partner) return

          const modalContent = document.getElementById('modal-content')
          modalContent.innerHTML = \`
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-gray-900">夥伴詳細資訊</h3>
                <button onclick="adminApp.closeModal()" class="text-gray-400 hover:text-gray-600">
                  <i data-lucide="x" class="h-6 w-6"></i>
                </button>
              </div>
            </div>
            <div class="px-6 py-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 class="text-sm font-medium text-gray-900 mb-3">基本資訊</h4>
                  <dl class="space-y-2">
                    <div>
                      <dt class="text-sm text-gray-500">姓名</dt>
                      <dd class="text-sm font-medium text-gray-900">\${partner.name}</dd>
                    </div>
                    <div>
                      <dt class="text-sm text-gray-500">電子郵件</dt>
                      <dd class="text-sm font-medium text-gray-900">\${partner.email}</dd>
                    </div>
                    <div>
                      <dt class="text-sm text-gray-500">電話</dt>
                      <dd class="text-sm font-medium text-gray-900">\${partner.phone || '未提供'}</dd>
                    </div>
                    <div>
                      <dt class="text-sm text-gray-500">公司</dt>
                      <dd class="text-sm font-medium text-gray-900">\${partner.company || '未提供'}</dd>
                    </div>
                    <div>
                      <dt class="text-sm text-gray-500">網站</dt>
                      <dd class="text-sm font-medium text-gray-900">\${partner.website || '未提供'}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 class="text-sm font-medium text-gray-900 mb-3">聯盟資訊</h4>
                  <dl class="space-y-2">
                    <div>
                      <dt class="text-sm text-gray-500">代碼</dt>
                      <dd class="text-sm font-medium text-gray-900">\${partner.affiliate_code}</dd>
                    </div>
                    <div>
                      <dt class="text-sm text-gray-500">推薦連結</dt>
                      <dd class="text-sm font-medium text-gray-900 break-all">\${partner.referral_link}</dd>
                    </div>
                    <div>
                      <dt class="text-sm text-gray-500">佣金率</dt>
                      <dd class="text-sm font-medium text-gray-900">\${(partner.commission_rate * 100).toFixed(1)}%</dd>
                    </div>
                    <div>
                      <dt class="text-sm text-gray-500">狀態</dt>
                      <dd class="text-sm font-medium text-gray-900">\${partner.status}</dd>
                    </div>
                    <div>
                      <dt class="text-sm text-gray-500">註冊時間</dt>
                      <dd class="text-sm font-medium text-gray-900">\${new Date(partner.created_at).toLocaleString('zh-TW')}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div class="flex justify-end space-x-3">
                <button onclick="adminApp.closeModal()" class="btn-secondary">關閉</button>
                \${partner.status === 'pending' ? \`
                  <button onclick="adminApp.approvePartner('\${partner.id}', true)" class="btn-success">核准</button>
                  <button onclick="adminApp.rejectPartner('\${partner.id}', true)" class="btn-danger">拒絕</button>
                \` : ''}
              </div>
            </div>
          \`

          document.getElementById('modal').classList.remove('hidden')
          lucide.createIcons()
        }

        closeModal() {
          document.getElementById('modal').classList.add('hidden')
        }

        async approvePartner(partnerId, fromModal = false) {
          if (!confirm('確定要核准此夥伴嗎？')) return

          try {
            // TODO: 實際的 API 調用
            // await fetch(\`/admin/affiliate/partners/\${partnerId}/approve\`, { method: 'POST' })
            
            // 暫時更新本地狀態
            const partner = this.partners.find(p => p.id === partnerId)
            if (partner) {
              partner.status = 'approved'
              partner.approved_at = new Date().toISOString()
            }

            this.calculateStats()
            if (fromModal) {
              this.closeModal()
            }
            this.render()
            
            alert('夥伴已核准')
          } catch (error) {
            console.error('核准失敗:', error)
            alert('核准失敗')
          }
        }

        async rejectPartner(partnerId, fromModal = false) {
          const reason = prompt('請輸入拒絕原因（可選）:')
          
          try {
            // TODO: 實際的 API 調用
            // await fetch(\`/admin/affiliate/partners/\${partnerId}/reject\`, { 
            //   method: 'POST',
            //   body: JSON.stringify({ reason })
            // })
            
            // 暫時更新本地狀態
            const partner = this.partners.find(p => p.id === partnerId)
            if (partner) {
              partner.status = 'rejected'
              partner.notes = reason
            }

            this.calculateStats()
            if (fromModal) {
              this.closeModal()
            }
            this.render()
            
            alert('夥伴已拒絕')
          } catch (error) {
            console.error('拒絕失敗:', error)
            alert('拒絕失敗')
          }
        }

        async suspendPartner(partnerId) {
          const reason = prompt('請輸入暫停原因:')
          if (!reason) return
          
          try {
            // TODO: 實際的 API 調用
            
            // 暫時更新本地狀態
            const partner = this.partners.find(p => p.id === partnerId)
            if (partner) {
              partner.status = 'suspended'
              partner.notes = reason
            }

            this.calculateStats()
            this.render()
            
            alert('夥伴已暫停')
          } catch (error) {
            console.error('暫停失敗:', error)
            alert('暫停失敗')
          }
        }

        exportData() {
          const csvContent = "data:text/csv;charset=utf-8," + 
            "姓名,電子郵件,狀態,佣金率,註冊時間\\n" +
            this.partners.map(p => 
              \`"\${p.name}","\${p.email}","\${p.status}","\${(p.commission_rate * 100).toFixed(1)}%","\${new Date(p.created_at).toLocaleString('zh-TW')}"\`
            ).join("\\n")

          const encodedUri = encodeURI(csvContent)
          const link = document.createElement("a")
          link.setAttribute("href", encodedUri)
          link.setAttribute("download", \`聯盟夥伴數據_\${new Date().toISOString().split('T')[0]}.csv\`)
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      }

      // CSS 樣式
      const styles = \`
        <style>
          .btn-primary {
            @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500;
          }
          .btn-secondary {
            @apply inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500;
          }
          .btn-success {
            @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500;
          }
          .btn-danger {
            @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500;
          }
          .form-input {
            @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm;
          }
          .form-select {
            @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm;
          }
        </style>
      \`

      document.head.insertAdjacentHTML('beforeend', styles)

      // 啟動應用
      let adminApp
      document.addEventListener('DOMContentLoaded', () => {
        adminApp = new AdminApp()
      })
    </script>
  </body>
  </html>
  `

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.send(html)
}
