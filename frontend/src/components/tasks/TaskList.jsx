import { ChevronLeft, ChevronRight } from 'lucide-react'
import TaskCard from './TaskCard'

const TaskList = ({ tasks, pagination, onPaginationChange, onEdit, onDelete, onStatusChange }) => {
  const handlePageChange = (newPage) => {
    onPaginationChange(newPage)
  }

  return (
    <div>
      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {tasks.map(task => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            showActions={true}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page <span className="font-medium">{pagination.current}</span> of{' '}
              <span className="font-medium">{pagination.pages}</span>
              {' '}({pagination.total} total tasks)
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.current - 1)}
                disabled={!pagination.hasPrev}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {[...Array(pagination.pages)].map((_, index) => {
                  const page = index + 1
                  const isCurrentPage = page === pagination.current
                  
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === pagination.pages ||
                    (page >= pagination.current - 1 && page <= pagination.current + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isCurrentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  } else if (
                    page === pagination.current - 2 ||
                    page === pagination.current + 2
                  ) {
                    return (
                      <span key={page} className="px-2 py-2 text-gray-400">
                        ...
                      </span>
                    )
                  }
                  return null
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.current + 1)}
                disabled={!pagination.hasNext}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskList
