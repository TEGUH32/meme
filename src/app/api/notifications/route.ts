import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const unread = searchParams.get('unread')

    const where: any = { userId }
    if (unread === 'true') {
      where.isRead = false
    }

    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json({
      success: true,
      data: notifications
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationId, isRead } = body

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'Missing notification ID' },
        { status: 400 }
      )
    }

    const notification = await db.notification.update({
      where: { id: notificationId },
      data: { isRead: isRead !== undefined ? isRead : true }
    })

    return NextResponse.json({
      success: true,
      data: notification
    })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}
