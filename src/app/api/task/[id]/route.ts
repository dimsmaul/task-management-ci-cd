import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { TaskStatus } from '@prisma/client';

// POST /api/task/[id] - Update status from in_progress to testing
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

    // Check if current status is in_progress
    if (task.status !== TaskStatus.in_progress) {
      return NextResponse.json(
        {
          success: false,
          message: `Task status must be 'in_progress' to update to testing. Current status: ${task.status}`,
        },
        { status: 400 }
      );
    }

    // Update status to testing
    const updatedTask = await db.task.update({
      where: { id: task.id },
      data: { status: TaskStatus.testing },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Task updated to testing',
        data: { task: updatedTask },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update task status error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
