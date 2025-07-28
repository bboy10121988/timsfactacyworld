import { ModuleProviderExports } from "@medusajs/framework/types"
import EcpayPaymentProvider from "./service"

const services = [EcpayPaymentProvider]

const providerExport: ModuleProviderExports = {
  services,
}

export default providerExport
