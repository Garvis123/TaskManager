import TaskCard from './TaskCard'

const KanbanBoard = ({ tasks, onStatusChange, onEdit, onDelete }) => {
  const columns = [
    { id: 'Pending', title: 'Pending', color: 'bg-gray-50', borderColor: 'border-gray-200' },
    { id: 'In Progress', title: 'In Progress', color: 'bg-blue-50', borderColor: 'border-blue-200' },
    { id: 'Completed', title: 'Completed', color: 'bg-green-50', borderColor: 'border-green-200' }
  ]

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {columns.map(column => {
        const columnTasks = getTasksByStatus(column.id)
        return (
          <div
            key={column.id}
            className={`${column.color} rounded-lg border-2 ${column.borderColor} p-4 min-h-96`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 text-lg">
                {column.title}
              </h3>
              <span className="bg-white text-gray-600 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                {columnTasks.length}
              </span>
            </div>

            {/* Tasks */}
            <div className="space-y-4 overflow-y-auto max-h-96">
              {columnTasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">No tasks in {column.title.toLowerCase()}</p>
                </div>
              ) : (
                columnTasks.map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                    showActions={true}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default KanbanBoard
