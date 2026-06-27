import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
export async function GET() {
  try {
    const { rows: properties } = await db.execute('SELECT * FROM Property ORDER BY "createdAt" DESC')
    const result = []
    for (const prop of properties) {
      const { rows: apartments } = await db.execute({ sql: 'SELECT * FROM Apartment WHERE "propertyId" = ? ORDER BY number ASC', args: [prop.id] })
      const aptsWithStages = []
      for (const apt of apartments) {
        const { rows: stages } = await db.execute({ sql: 'SELECT * FROM Stage WHERE "apartmentId" = ? ORDER BY "stageOrder" ASC', args: [apt.id] })
        aptsWithStages.push({ ...apt, stages })
      }
      result.push({ ...prop, apartments: aptsWithStages })
    }
    return NextResponse.json(result)
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, location, apartmentCount } = body
    const now = new Date().toISOString()
    const propId = crypto.randomUUID()
    await db.execute({ sql: 'INSERT INTO Property (id, name, location, "createdAt", "updatedAt") VALUES (?,?,?,?,?)', args: [propId, name, location, now, now] })
    const stages = ["تأسيس ماء","مجاري","كهرباء","تمديد حمام","تمديد مطبخ","تبليط جدران حمام","تبليط جدران مطبخ","تركيب جدران حمام","تركيب جدران مطبخ","تسميج الجدران","أرضية","تركيب أرضية","جبس بورد","دهان","أبواب","شبابيك","إنارة","مفاتيح كهرباء","صحيات الحمام","صحيات المطبخ","اختبار نهائي"]
    for (let i = 0; i < apartmentCount; i++) {
      const aptId = crypto.randomUUID()
      await db.execute({ sql: 'INSERT INTO Apartment (id, number, "propertyId", "createdAt", "updatedAt") VALUES (?,?,?,?,?)', args: [aptId, i+1, propId, now, now] })
      for (let j = 0; j < stages.length; j++) {
        await db.execute({ sql: 'INSERT INTO Stage (id, name, status, "stageOrder", "apartmentId", "createdAt", "updatedAt") VALUES (?,?,?,?,?,?,?)', args: [crypto.randomUUID(), stages[j], 'PENDING', j+1, aptId, now, now] })
      }
    }
    const { rows } = await db.execute({ sql: 'SELECT * FROM Property WHERE id = ?', args: [propId] })
    return NextResponse.json(rows[0], { status: 201 })
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}