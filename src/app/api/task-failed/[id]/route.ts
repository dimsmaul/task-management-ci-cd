import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { TaskStatus } from '@prisma/client';

// POST /api/task-failed/[id] - Update status to fixing
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get token from cookie
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { id } = params; // Actually receives the code from frontend

    // Check if task exists and belongs to user
    const task = await db.task.findUnique({
      where: { code: id },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (task.userId !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update status to fixing
    const updatedTask = await db.task.update({
      where: { id: task.id },
      data: { status: TaskStatus.fixing },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Task status updated to fixing',
        data: { task: updatedTask },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update task to fixing error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
