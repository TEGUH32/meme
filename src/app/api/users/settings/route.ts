import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, data } = await request.json()

    let updateData: any = {}

    switch (type) {
      case 'profile':
        updateData = {
          name: data.name,
          bio: data.bio
        }
        break
      
      case 'notifications':
        updateData = {
          settingsNotifications: JSON.stringify(data)
        }
        break
      
      case 'privacy':
        updateData = {
          settingsPrivacy: JSON.stringify(data)
        }
        break
      
      case 'appearance':
        updateData = {
          settingsAppearance: JSON.stringify(data)
        }
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid settings type' },
          { status: 400 }
        )
    }

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        settingsNotifications: true,
        settingsPrivacy: true,
        settingsAppearance: true,
      }
    })

    // Parse settings untuk response
    const responseData = {
      ...updatedUser,
      settingsNotifications: updatedUser.settingsNotifications 
        ? JSON.parse(updatedUser.settingsNotifications)
        : null,
      settingsPrivacy: updatedUser.settingsPrivacy
        ? JSON.parse(updatedUser.settingsPrivacy)
        : null,
      settingsAppearance: updatedUser.settingsAppearance
        ? JSON.parse(updatedUser.settingsAppearance)
        : null,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        settingsNotifications: true,
        settingsPrivacy: true,
        settingsAppearance: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse settings untuk response
    const responseData = {
      ...user,
      settingsNotifications: user.settingsNotifications 
        ? JSON.parse(user.settingsNotifications)
        : {
            emailNotifications: true,
            pushNotifications: true,
            likeNotifications: true,
            commentNotifications: true,
            medalNotifications: true
          },
      settingsPrivacy: user.settingsPrivacy
        ? JSON.parse(user.settingsPrivacy)
        : {
            profileVisible: true,
            showEmail: false,
            showStats: true
          },
      settingsAppearance: user.settingsAppearance
        ? JSON.parse(user.settingsAppearance)
        : {
            theme: 'system'
          },
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}
