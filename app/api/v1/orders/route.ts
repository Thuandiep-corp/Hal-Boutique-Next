import { NextResponse } from 'next/server'

export async function GET() {
  const data = [{ id: 1, status: 'PAID' }]
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  // xử lý dữ liệu ở đây
  return NextResponse.json({ message: 'Order created', data: body }, { status: 201 })
}