import { ModuleProviderExports } from "@medusajs/framework/types"
import EcpayPaymentProvider from "./service"

// 確保服務類有正確的 identifier
Object.defineProperty(EcpayPaymentProvider, 'identifier', {
  value: 'ecpay',
  writable: false,
  enumerable: true,
  configurable: false
})

const services = [EcpayPaymentProvider]

const providerExport: ModuleProviderExports = {
  services,
}

export default providerExport
