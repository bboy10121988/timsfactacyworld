export default function DeploymentCheck() {
  const envVars = {
    'NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
    'NEXT_PUBLIC_BASE_URL': process.env.NEXT_PUBLIC_BASE_URL,
    'NEXT_PUBLIC_DEFAULT_REGION': process.env.NEXT_PUBLIC_DEFAULT_REGION,
    'NEXT_PUBLIC_MEDUSA_BACKEND_URL': process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
    'NODE_ENV': process.env.NODE_ENV,
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Vercel 部署狀態檢查</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">環境變數狀態:</h2>
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="font-mono text-sm">{key}:</span>
            <span className="text-gray-600">
              {value ? '✓ 已設定' : '✗ 未設定'}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold">當前時間:</h3>
        <p>{new Date().toISOString()}</p>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold">部署信息:</h3>
        <p>Platform: {typeof window !== 'undefined' ? 'Client' : 'Server'}</p>
        <p>Build Time: {new Date().toISOString()}</p>
      </div>
    </div>
  )
}
