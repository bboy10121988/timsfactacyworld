import { NextRequest, NextResponse } from "next/server"
import { getOrSetCart } from "@lib/data/cart"

export async function GET(request: NextRequest) {
  try {
    const cart = await getOrSetCart()
    return NextResponse.json({ cart })
  } catch (error) {
    return NextResponse.json({ cart: null }, { status: 200 })
  }
}