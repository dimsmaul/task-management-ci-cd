'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { CheckCircle2, Circle, Loader2, LogOut, Plus, Pencil, Trash2, AlertCircle, TestTube, Wrench, FileCheck } from 'lucide-react';

type Task = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'testing' | 'done' | 'fixing' | 'closed';
  createdAt: string;
  updatedAt: string;
};

type TaskStatus = Task['status'];

const STATUS_CONFIG = {
  todo: { label: 'Todo', icon: Circle, color: 'bg-slate-500' },
  in_progress: { label: 'In Progress', icon: Loader2, color: 'bg-blue-500' },
  testing: { label: 'Testing', icon: TestTube, color: 'bg-purple-500' },
  fixing: { label: 'Fixing', icon: Wrench, color: 'bg-orange-500' },
  done: { label: 'Done', icon: CheckCircle2, color: 'bg-green-500' },
  closed: { label: 'Closed', icon: FileCheck, color: 'bg-gray-500' },
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
  });
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchTasks();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.success) {
        setUser(data.data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const url = statusFilter !== 'all' ? `/api/tasks?status=${statusFilter}` : '/api/tasks';
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setTasks(data.data.tasks);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch tasks',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to logout',
      });
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createFormData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: data.message,
        });
        setCreateDialogOpen(false);
        setCreateFormData({ title: '', description: '', status: 'todo' });
        fetchTasks();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.message,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create task',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: data.message,
        });
        setEditDialogOpen(false);
        setSelectedTask(null);
        fetchTasks();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.message,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update task',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: data.message,
        });
        fetchTasks();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.message,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete task',
      });
    }
  };

  const openEditDialog = (task: Task) => {
    setSelectedTask(task);
    setEditFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
    });
    setEditDialogOpen(true);
  };

  const moveToTesting = async (taskCode: string, currentStatus: TaskStatus) => {
    if (currentStatus !== 'in_progress') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Only tasks in "in_progress" status can be moved to testing',
      });
      return;
    }

    try {
      const response = await fetch(`/api/task/${taskCode}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: data.message,
        });
        fetchTasks();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.message,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update task status',
      });
    }
  };

  const moveToFixing = async (taskCode: string) => {
    try {
      const response = await fetch(`/api/task-failed/${taskCode}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: data.message,
        });
        fetchTasks();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.message,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update task status',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Task Management</h1>
            {user && <p className="text-sm text-muted-foreground">Welcome, {user.name}</p>}
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>Fill in the details to create a new task</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTask}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-title">Title</Label>
                    <Input
                      id="create-title"
                      placeholder="Task title"
                      value={createFormData.title}
                      onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-description">Description</Label>
                    <Textarea
                      id="create-description"
                      placeholder="Task description"
                      value={createFormData.description}
                      onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-status">Status</Label>
                    <Select
                      value={createFormData.status}
                      onValueChange={(value: TaskStatus) => setCreateFormData({ ...createFormData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Task'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <div className="flex-1">
            <Select value={statusFilter} onValueChange={(value: TaskStatus | 'all') => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tasks found</p>
              <p className="text-sm text-muted-foreground">Create a new task to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Code</TableHead>
                  <TableHead className='w-2/3'>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => {
                  const StatusIcon = STATUS_CONFIG[task.status].icon;
                  return (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.code}</TableCell>
                      <TableCell>
                        <div className="font-semibold text-base">{task.title}</div>
                        {task.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1 mt-1">
                            {task.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${STATUS_CONFIG[task.status].color} text-white`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {STATUS_CONFIG[task.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(task)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>

                          {task.status === 'in_progress' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveToTesting(task.code, task.status)}
                            >
                              <TestTube className="h-4 w-4 mr-1" />
                              To Testing
                            </Button>
                          )}

                          {task.status === 'testing' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveToFixing(task.code)}
                            >
                              <Wrench className="h-4 w-4 mr-1" />
                              To Fixing
                            </Button>
                          )}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this task? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteTask(task.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update the task details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateTask}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  placeholder="Task title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Task description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value: TaskStatus) => setEditFormData({ ...editFormData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Task'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
