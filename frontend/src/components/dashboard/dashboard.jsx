import { useState, useEffect } from 'react'
import { Plus, LayoutGrid, List } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import Header from '../common/Header'
import Loading from '../common/Loading'
import Modal from '../common/Modal'
import TaskFilters from '../tasks/TaskFilters'
import TaskList from '../tasks/TaskList'
import KanbanBoard from '../tasks/KanbanBoard'
import TaskForm from '../tasks/TaskForm'
import StatsCards from './StatsCards'


const Dashboard = () => {
  const { user, isAdmin } = useAuth()
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    deadline: 'all',
    assignedTo: 'all'
  })
  const [view, setView] = useState('list')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pages: 1,
    hasNext: false,
    hasPrev: false
  })

  useEffect(() => {
    loadTasks()
    if (isAdmin) {
      loadMembers()
    }
  }, [filters, pagination.current])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.current,
        limit: 20,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value && value !== 'all')
        )
      }

      const response = await api.tasks.getAll(params)
      setTasks(response.data.tasks)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMembers = async () => {
    try {
      const response = await api.users.getMembers()
      setMembers(response.data)
    } catch (error) {
      console.error('Failed to load members:', error)
    }
  }

  const handleCreateTask = async (taskData) => {
    try {
      await api.tasks.create(taskData)
      setShowTaskForm(false)
      loadTasks()
    } catch (error) {
      console.error('Failed to create task:', error)
      throw error
    }
  }

  const handleUpdateTask = async (taskData) => {
    try {
      await api.tasks.update(editingTask._id, taskData)
      setEditingTask(null)
      loadTasks()
    } catch (error) {
      console.error('Failed to update task:', error)
      throw error
    }
  }

  const handleDeleteTask = async (task) => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      try {
        await api.tasks.delete(task._id)
        loadTasks()
      } catch (error) {
        console.error('Failed to delete task:', error)
      }
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.tasks.update(taskId, { status: newStatus })
      loadTasks()
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handlePaginationChange = (newPage) => {
    setPagination(prev => ({ ...prev, current: newPage }))
  }

  const getTaskStats = () => {
    const total = tasks.length
    const pending = tasks.filter(task => task.status === 'Pending').length
    const inProgress = tasks.filter(task => task.status === 'In Progress').length
    const completed = tasks.filter(task => task.status === 'Completed').length
    
    return { total, pending, inProgress, completed }
  }

  if (loading && tasks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center pt-20">
          <Loading size="lg" text="Loading your dashboard..." />
        </div>
      </div>
    )
  }

  const stats = getTaskStats()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="mt-2 text-gray-600">
                {isAdmin ? 'Manage your team tasks and track progress' : 'Stay on top of your assigned tasks'}
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              {/* View Toggle */}
              <div className="bg-white rounded-lg p-1 flex border border-gray-200 shadow-sm">
                <button
                  onClick={() => setView('list')}
                  className={`flex items-center px-3 py-2 rounded text-sm font-medium transition-colors ${
                    view === 'list'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </button>
                <button
                  onClick={() => setView('kanban')}
                  className={`flex items-center px-3 py-2 rounded text-sm font-medium transition-colors ${
                    view === 'kanban'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Board
                </button>
              </div>

              {/* Create Task Button (Admin only) */}
              {isAdmin && (
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Task</span>
                </button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards stats={stats} />
        </div>

        {/* Filters */}
        <TaskFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          members={isAdmin ? members : []}
        />

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loading size="lg" text="Loading tasks..." />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {Object.values(filters).some(filter => filter && filter !== 'all')
                  ? 'No tasks match your filters'
                  : 'No tasks found'
                }
              </h3>
              <p className="text-gray-500 mb-6">
                {Object.values(filters).some(filter => filter && filter !== 'all')
                  ? 'Try adjusting your filters to see more tasks.'
                  : isAdmin
                    ? 'Create your first task to get started with team collaboration.'
                    : 'No tasks have been assigned to you yet.'
                }
              </p>
              {isAdmin && !Object.values(filters).some(filter => filter && filter !== 'all') && (
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Task
                </button>
              )}
            </div>
          ) : view === 'kanban' ? (
            <KanbanBoard
              tasks={tasks}
              onStatusChange={handleStatusChange}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
            />
          ) : (
            <TaskList
              tasks={tasks}
              pagination={pagination}
              onPaginationChange={handlePaginationChange}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      {showTaskForm && (
        <Modal
          isOpen={true}
          onClose={() => setShowTaskForm(false)}
          title="Create New Task"
          size="lg"
        >
          <TaskForm
            onSubmit={handleCreateTask}
            onCancel={() => setShowTaskForm(false)}
          />
        </Modal>
      )}

      {editingTask && (
        <Modal
          isOpen={true}
          onClose={() => setEditingTask(null)}
          title="Edit Task"
          size="lg"
        >
          <TaskForm
            task={editingTask}
            onSubmit={handleUpdateTask}
            onCancel={() => setEditingTask(null)}
          />
        </Modal>
      )}
    </div>
  )
}

export default Dashboard