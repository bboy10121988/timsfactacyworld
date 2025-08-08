import { ModuleProviderExports } from "@medusajs/framework/types"
import MyPaymentService from "./tester"

const services = [MyPaymentService]

const providerExport: ModuleProviderExports = {
    services,
}

export default providerExport