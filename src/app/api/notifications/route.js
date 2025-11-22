import { NextResponse } from 'next/server';
import {
  getNotifications,
  markAllAsRead,
  getUnreadCount,
} from '@/lib/notificationService';

/**
 * GET /api/notifications
 * Get all notifications for a user
 * Query params: userId, recipientType, unreadOnly (optional)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const recipientType = searchParams.get('recipientType');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const countOnly = searchParams.get('countOnly') === 'true';

    if (!userId || !recipientType) {
      return NextResponse.json(
        { error: 'Missing userId or recipientType' },
        { status: 400 }
      );
    }

    // If countOnly, return just the count
    if (countOnly) {
      const result = await getUnreadCount(userId, recipientType);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }
      return NextResponse.json({ count: result.count });
    }

    // Otherwise return all notifications
    const result = await getNotifications(userId, recipientType, unreadOnly);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ notifications: result.data });
  } catch (error) {
    console.error('Error in GET /api/notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications
 * Mark all notifications as read for a user
 * Body: { userId, recipientType }
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { userId, recipientType } = body;

    if (!userId || !recipientType) {
      return NextResponse.json(
        { error: 'Missing userId or recipientType' },
        { status: 400 }
      );
    }

    const result = await markAllAsRead(userId, recipientType);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read',
      data: result.data,
    });
  } catch (error) {
    console.error('Error in PATCH /api/notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
