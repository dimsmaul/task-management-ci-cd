import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { TaskStatus } from '@prisma/client';

// POST /api/bulk-task-failed - Bulk update tasks to fixing
export async function POST(request: NextRequest) {
  try {
    // Check for API key bypass
    const authHeader = request.headers.get('authorization');
    const isApiKeyValid = authHeader === `Bearer ${process.env.API_KEY}`;
    let decoded: any = null;

    if (!isApiKeyValid) {
      // Get token from header
      const token = getTokenFromRequest(request as unknown as Request);

      if (!token) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Verify token
      decoded = verifyToken(token);

      if (!decoded) {
        return NextResponse.json(
          { success: false, message: 'Invalid token' },
          { status: 401 }
        );
      }
    }

    const body = await request.json();
    const { ids } = body;

    // Validation
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Task IDs array is required' },
        { status: 400 }
      );
    }

    // Use transaction for bulk update
    const result = await db.$transaction(async (tx) => {
      // Get all tasks that belong to the user
      const whereClause: any = {
        code: { in: ids },
      };
      
      if (!isApiKeyValid) {
        whereClause.userId = decoded?.userId;
      }

      const tasks = await tx.task.findMany({
        where: whereClause,
      });

      if (tasks.length === 0) {
        return {
          updated: 0,
          tasks: [],
        };
      }

      // Update all tasks to fixing
      const taskIds = tasks.map(t => t.id);
      const updatedTasks = await tx.task.updateMany({
        where: {
          id: { in: taskIds },
        },
        data: {
          status: TaskStatus.fixing,
        },
      });

      // Fetch the updated tasks
      const finalTasks = await tx.task.findMany({
        where: {
          id: { in: taskIds },
        },
      });

      return {
        updated: updatedTasks.count,
        tasks: finalTasks,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: `${result.updated} tasks updated to fixing`,
        data: {
          updated: result.updated,
          tasks: result.tasks,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Bulk update tasks to fixing error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
