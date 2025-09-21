import { useState } from 'react'
import { MoreVertical, Edit, Trash2, Clock, Users, MessageCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { formatDate, getPriorityColor, getStatusColor } from '../../utils/helper'

const TaskCard = ({ task, onEdit, onDelete, onStatusChange, showActions = true }) => {
  const { isAdmin, user } = useAuth()
  const [showMenu, setShowMenu] = useState(false)

  const deadline = formatDate(task.deadline)
  const canEdit = isAdmin || task.assignedTo._id === user.id

  const handleStatusChange = (e) => {
    onStatusChange(task._id, e.target.value)
  }

  return (
    <div className={`task-card bg-white rounded-lg border-l-4 ${getPriorityColor(task.priority)} p-6 mb-4 relative hover:shadow-lg transition-all duration-200 fade-in`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-lg pr-2 leading-tight">
          {task.title}
        </h3>
        {showActions && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-200">
                {canEdit && (
                  <button
                    onClick={() => {
                      onEdit(task)
                      setShowMenu(false)
                    }}
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                  >
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => {
                      onDelete(task)
                      setShowMenu(false)
                    }}
                    className="flex items-center px-3 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left transition-colors"
                  >
                    <Trash2 className="mr-2 h-3 w-3" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
        {task.description}
      </p>

      {/* Metadata */}
      <div className="space-y-3">
        {/* Status and Priority */}
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
          <span className={`text-xs font-semibold px-2 py-1 rounded ${
            task.priority === 'High' ? 'text-red-700 bg-red-100' :
            task.priority === 'Medium' ? 'text-yellow-700 bg-yellow-100' :
            'text-green-700 bg-green-100'
          }`}>
            {task.priority}
          </span>
        </div>

        {/* Assignee */}
        <div className="flex items-center text-sm text-gray-600">
          <Users className="h-4 w-4 mr-2" />
          <span className="font-medium">{task.assignedTo.name}</span>
          <span className="text-gray-400 ml-1">({task.assignedTo.email})</span>
        </div>

        {/* Deadline */}
        <div className="flex items-center text-sm">
          <Clock className="h-4 w-4 mr-2" />
          <span className={`font-medium ${deadline.color}`}>
            {deadline.text}
          </span>
          {deadline.isOverdue && (
            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
              Overdue
            </span>
          )}
        </div>

        {/* Comments count */}
        {task.comments && task.comments.length > 0 && (
          <div className="flex items-center text-sm text-gray-500">
            <MessageCircle className="h-4 w-4 mr-2" />
            <span>{task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Status change dropdown for assignees */}
      {canEdit && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Update Status
          </label>
          <select
            value={task.status}
            onChange={handleStatusChange}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      )}
    </div>
  )
}

export default TaskCard
