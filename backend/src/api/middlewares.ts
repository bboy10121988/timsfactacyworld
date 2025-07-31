import { 
  defineMiddlewares,
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/medusa"
import cors from "cors"

console.log('🔧 Middlewares.ts loaded')

export default defineMiddlewares({
  routes: [
    {
      matcher: "/webhooks/*",
      middlewares: [
        cors({ 
          origin: "*", 
          credentials: true,
          methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
          allowedHeaders: ["Content-Type", "Authorization"]
        }),
      ],
      bodyParser: { preserveRawBody: true },
      method: ["POST", "OPTIONS"],
    },
    {
      matcher: "/store/ecpay/callback*",
      middlewares: [
        (
          req: MedusaRequest,
          res: MedusaResponse,
          next: MedusaNextFunction
        ) => {
          console.log(`🔍 ECPay callback middleware hit for: ${req.path} ${req.method}`)
          console.log('🔓 Bypassing API key requirement for ECPay callback')
          console.log('📋 Request headers:', Object.keys(req.headers))
          
          // 設定有效的 publishable API key
          req.headers['x-publishable-api-key'] = 'pk_878a01cbc11b1ed2acfb97a538e26610e073ced57ed8ad18f72677e836190adb'
          
          console.log('✅ API key set, proceeding to next middleware')
          next()
        }
      ]
    },
    {
      matcher: "/store/carts/*/complete",
      middlewares: [
        (
          req: MedusaRequest,
          res: MedusaResponse,
          next: MedusaNextFunction
        ) => {
          // 檢查是否來自 ECPay callback 內部呼叫
          const isInternalEcpayCall = req.headers['x-internal-ecpay-call'] === 'true'
          
          if (isInternalEcpayCall) {
            console.log(`🔍 ECPay internal cart complete middleware hit for: ${req.path}`)
            console.log('🔓 Setting API key for ECPay cart completion')
            
            // 設定有效的 publishable API key
            req.headers['x-publishable-api-key'] = 'pk_878a01cbc11b1ed2acfb97a538e26610e073ced57ed8ad18f72677e836190adb'
          }
          
          next()
        }
      ]
    },
    {
      matcher: "/store/ecpay/*",
      middlewares: [
        (
          req: MedusaRequest,
          res: MedusaResponse,
          next: MedusaNextFunction
        ) => {
          console.log(`🔍 ECPay middleware hit for: ${req.path}`)
          
          if (req.path.includes('/ecpay/callback')) {
            console.log('🔓 Bypassing API key for ECPay callback')
            // 設定有效的 publishable API key
            req.headers['x-publishable-api-key'] = 'pk_878a01cbc11b1ed2acfb97a538e26610e073ced57ed8ad18f72677e836190adb'
          }
          
          next()
        }
      ]
    }
  ]
})
