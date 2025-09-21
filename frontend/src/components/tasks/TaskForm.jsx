import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import Loading from '../common/Loading'
import { validateForm } from '../../utils/helper'

const TaskForm = ({ task, onSubmit, onCancel }) => {
  const { isAdmin } = useAuth()
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    deadline: task?.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
    assignedTo: task?.assignedTo?._id || '',
    priority: task?.priority || 'Medium',
    status: task?.status || 'Pending'
  })
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isAdmin) {
      loadMembers()
    }
  }, [isAdmin])

  const loadMembers = async () => {
    try {
      setLoadingMembers(true)
      const response = await api.users.getMembers()
      setMembers(response.data)
    } catch (error) {
      console.error('Failed to load members:', error)
    } finally {
      setLoadingMembers(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validateFormData = () => {
    const rules = {
      title: { required: true, minLength: 1, maxLength: 100 },
      description: { required: true, minLength: 1, maxLength: 500 },
      deadline: { required: true },
      ...(isAdmin && { assignedTo: { required: true } })
    }

    // Additional validation for deadline
    if (formData.deadline) {
      const selectedDate = new Date(formData.deadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        setErrors(prev => ({ ...prev, deadline: 'Deadline must be in the future' }))
        return false
      }
    }

    const validationErrors = validateForm(formData, rules)
    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateFormData()) return

    setLoading(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
      setErrors({ submit: error.response?.data?.message || 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {errors.submit && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter a clear, descriptive title"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Provide detailed description of the task"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Deadline and Priority Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline *
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.deadline ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
          </div>
        </div>

        {/* Assignee (Admin only) */}
        {isAdmin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to *
            </label>
            {loadingMembers ? (
              <div className="flex items-center justify-center py-3">
                <Loading size="sm" text="Loading team members..." />
              </div>
            ) : (
              <select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.assignedTo ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select team member</option>
                {members.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            )}
            {errors.assignedTo && <p className="text-red-500 text-sm mt-1">{errors.assignedTo}</p>}
          </div>
        )}

        {/* Status (when editing) */}
        {task && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center font-medium"
          >
            {loading && <Loading size="sm" />}
            <span className={loading ? 'ml-2' : ''}>
              {task ? 'Update Task' : 'Create Task'}
            </span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default TaskForm