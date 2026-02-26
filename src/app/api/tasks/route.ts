import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/tasks - Get all tasks for current user
export async function GET(request: NextRequest) {
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

    // Get search params for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {
      userId: decoded.userId,
    };

    if (status) {
      where.status = status;
    }

    // Get tasks
    const tasks = await db.task.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: { tasks },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { title, description, status } = body;

    // Validation
    if (!title || title.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Title is required' },
        { status: 400 }
      );
    }

    // Get user details for initials
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: { name: true }
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Generate initials (e.g. Dimas Maulana Ahmad -> DMA)
    const nameParts = user.name.split(' ').filter(n => n.length > 0);
    let initials = 'TSK';
    if (nameParts.length > 0) {
      initials = nameParts.map(n => n[0]).join('').toUpperCase().substring(0, 3);
    }
      
    // Find highest sequence for these initials
    // Since code ends with e.g. -001, -002, string sort works for same length suffix, but we should parse it.
    const lastTasks = await db.task.findMany({
      where: { code: { startsWith: `${initials}-` } },
      select: { code: true }
    });
    
    let maxNumber = 0;
    for (const t of lastTasks) {
      const parts = t.code.split('-');
      if (parts.length === 2) {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    }
    
    const nextNumber = maxNumber + 1;
    const code = `${initials}-${nextNumber.toString().padStart(3, '0')}`;

    // Create task
    const task = await db.task.create({
      data: {
        code,
        title: title.trim(),
        description: description?.trim() || null,
        status: status || 'todo',
        userId: decoded.userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Task created successfully',
        data: { task },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
