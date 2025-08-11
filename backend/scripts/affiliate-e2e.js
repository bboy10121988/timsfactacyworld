#!/usr/bin/env node
/*
 End-to-end test for affiliate flow:
 1) Register Partner A
 2) Register Partner B using A's ref code
 3) Track click for A
 4) Record conversion for A
 5) Login A and fetch stats (with Bearer token)
*/

const base = process.env.BASE_URL || 'http://localhost:9000'

async function jfetch(path, opts = {}) {
  const res = await fetch(base + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
  'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_KEY || 'pk_test_affiliate',
      ...(opts.headers || {}),
    },
  })
  const text = await res.text()
  try {
    const json = JSON.parse(text)
    return { status: res.status, ok: res.ok, json }
  } catch {
    return { status: res.status, ok: res.ok, text }
  }
}

async function main() {
  const rnd = Math.floor(Math.random() * 1e6)
  const emailA = `aff_a_${rnd}@example.com`
  const emailB = `aff_b_${rnd}@example.com`

  console.log('1) Register Partner A:', emailA)
  const regA = await jfetch('/store/affiliate/register', {
    method: 'POST',
    body: JSON.stringify({ name: '夥伴A', email: emailA, password: 'Test12345!' })
  })
  console.log('→', regA)
  if (!regA.ok || !regA.json?.partner) throw new Error('Register A failed')
  const codeA = regA.json.partner.affiliate_code
  const idA = regA.json.partner.id

  console.log('\n2) Register Partner B with ref:', emailB, 'ref=', codeA)
  const regB = await jfetch(`/store/affiliate/register?ref=${encodeURIComponent(codeA)}`, {
    method: 'POST',
    body: JSON.stringify({ name: '夥伴B', email: emailB, password: 'Test12345!' })
  })
  console.log('→', regB)
  if (!regB.ok || !regB.json?.partner) throw new Error('Register B failed')
  const refBy = regB.json.partner.referred_by_code
  if (refBy !== codeA) throw new Error(`B.referred_by_code mismatch: expected ${codeA}, got ${refBy}`)

  console.log('\n3) Track click for A')
  const click = await jfetch('/store/affiliate/track', {
    method: 'POST',
    body: JSON.stringify({ affiliate_code: codeA, url: 'https://example.com/product/sku1' })
  })
  console.log('→', click)
  if (!click.ok || !click.json?.click?.id) throw new Error('Track click failed')
  const clickId = click.json.click.id

  console.log('\n4) Record conversion for A')
  const orderId = `order_${rnd}`
  const conv = await jfetch('/store/affiliate/conversion', {
    method: 'POST',
    body: JSON.stringify({ affiliate_code: codeA, order_id: orderId, order_total: 1990, click_id: clickId })
  })
  console.log('→', conv)
  if (!conv.ok || !conv.json?.conversion?.id) throw new Error('Record conversion failed')

  console.log('\n5) Login A and fetch stats')
  const login = await jfetch('/store/affiliate/login', {
    method: 'POST',
    body: JSON.stringify({ email: emailA, password: 'Test12345!' })
  })
  console.log('→ login', login)
  if (!login.ok || !login.json?.token) throw new Error('Login A failed')
  const token = login.json.token

  const stats = await jfetch(`/store/affiliate/partners/${encodeURIComponent(idA)}/stats`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  })
  console.log('→ stats', stats)
  if (!stats.ok || !stats.json?.stats) throw new Error('Fetch stats failed')

  console.log('\n✅ E2E success')
  console.log({
    partnerA: regA.json.partner,
    partnerB: regB.json.partner,
    stats: stats.json.stats,
  })
}

// Ensure global fetch exists (Node 18+)
if (typeof fetch === 'undefined') {
  global.fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args))
}

main().catch((e) => {
  console.error('❌ E2E failed:', e.message)
  process.exit(1)
})
