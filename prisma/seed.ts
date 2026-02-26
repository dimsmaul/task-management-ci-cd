import { PrismaClient, TaskStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleaned existing data');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: hashedPassword,
    },
  });

  console.log('✅ Created users:', { user1: user1.email, user2: user2.email });

  // Create tasks for user1
  const tasks1 = [
    {
      title: 'Implement user authentication',
      description: 'Add login and register functionality with JWT tokens',
      status: TaskStatus.done,
    },
    {
      title: 'Design database schema',
      description: 'Create Prisma schema with User and Task models',
      status: TaskStatus.done,
    },
    {
      title: 'Build task management UI',
      description: 'Create dashboard with task list, filters, and CRUD operations',
      status: TaskStatus.in_progress,
    },
    {
      title: 'Add task status workflow',
      description: 'Implement custom API endpoints for status transitions',
      status: TaskStatus.testing,
    },
    {
      title: 'Write unit tests',
      description: 'Add tests for API endpoints and components',
      status: TaskStatus.todo,
    },
    {
      title: 'Fix authentication bug',
      description: 'Session token not persisting after page refresh',
      status: TaskStatus.fixing,
    },
    {
      title: 'Prepare for deployment',
      description: 'Configure environment variables and deployment settings',
      status: TaskStatus.closed,
    },
  ];

  for (const task of tasks1) {
    await prisma.task.create({
      data: {
        ...task,
        userId: user1.id,
      },
    });
  }

  console.log('✅ Created tasks for user1:', tasks1.length);

  // Create tasks for user2
  const tasks2 = [
    {
      title: 'Review pull requests',
      description: 'Review and approve pending PRs',
      status: TaskStatus.in_progress,
    },
    {
      title: 'Update documentation',
      description: 'Add API documentation and user guides',
      status: TaskStatus.todo,
    },
    {
      title: 'Optimize database queries',
      description: 'Improve query performance with indexes',
      status: TaskStatus.testing,
    },
  ];

  for (const task of tasks2) {
    await prisma.task.create({
      data: {
        ...task,
        userId: user2.id,
      },
    });
  }

  console.log('✅ Created tasks for user2:', tasks2.length);

  console.log('🎉 Seed completed successfully!');
  console.log('\n📝 Test Accounts:');
  console.log('   - Email: john@example.com, Password: password123');
  console.log('   - Email: jane@example.com, Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
