import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import * as path from 'path'
import * as fs from 'fs'

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const htmlPath = path.join(__dirname, '../../../../admin/affiliate-management.html')
    const htmlContent = fs.readFileSync(htmlPath, 'utf8')
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(htmlContent)
  } catch (error) {
    console.error('Error serving affiliate management page:', error)
    res.status(404).send('Affiliate management page not found')
  }
}
