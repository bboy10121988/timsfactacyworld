'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import adminAPI from '@/lib/admin-api'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await adminAPI.login(email, password)
      
      if (result.success) {
        router.push('/admin/affiliate')
      } else {
        setError(result.message || '登入失敗')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('登入過程中發生錯誤')
    } finally {
      setIsLoading(false)
    }
  }

  // Test connection on component mount
  const testConnection = async () => {
    try {
      const result = await adminAPI.testConnection()
      console.log('後端連接測試:', result)
    } catch (error) {
      console.error('後端連接失敗:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Tim's Factory 管理員登入
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          聯盟營銷系統管理後台
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                電子郵件
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="admin@timsfactory.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密碼
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="輸入密碼"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '登入中...' : '登入'}
              </button>
            </div>

            <div className="mt-6">
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-blue-800 mb-2">測試帳號</h3>
                <div className="text-xs text-blue-700">
                  <div>Email: admin@timsfactory.com</div>
                  <div>Password: admin123</div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={testConnection}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
              >
                測試後端連接
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
