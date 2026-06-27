import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { status } = await request.json()
    await db.execute({ sql: 'UPDATE Stage SET status = ?, "updatedAt" = ? WHERE id = ?', args: [status, new Date().toISOString(), id] })
    return NextResponse.json({ success: true, status })
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}