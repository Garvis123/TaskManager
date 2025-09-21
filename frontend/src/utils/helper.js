export const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return { 
      text: `${Math.abs(diffDays)} days overdue`, 
      color: 'text-red-600',
      isOverdue: true
    }
  } else if (diffDays === 0) {
    return { 
      text: 'Due today', 
      color: 'text-orange-600',
      isDueToday: true
    }
  } else if (diffDays === 1) {
    return { 
      text: 'Due tomorrow', 
      color: 'text-yellow-600',
      isDueTomorrow: true
    }
  } else {
    return { 
      text: `${diffDays} days left`, 
      color: 'text-gray-600',
      isUpcoming: true
    }
  }
}

export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High': return 'border-red-500 bg-red-50'
    case 'Medium': return 'border-yellow-500 bg-yellow-50'
    case 'Low': return 'border-green-500 bg-green-50'
    default: return 'border-gray-300 bg-white'
  }
}

export const getStatusColor = (status) => {
  switch (status) {
    case 'Completed': return 'bg-green-100 text-green-800'
    case 'In Progress': return 'bg-blue-100 text-blue-800'
    case 'Pending': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export const getStatusIcon = (status) => {
  switch (status) {
    case 'Completed': return 'CheckCircle'
    case 'In Progress': return 'Clock'
    case 'Pending': return 'Circle'
    default: return 'Circle'
  }
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validateForm = (formData, rules) => {
  const errors = {}
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field]
    const value = formData[field]
    
    if (rule.required && (!value || value.trim() === '')) {
      errors[field] = `${field} is required`
    } else if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = `${field} must be at least ${rule.minLength} characters`
    } else if (rule.maxLength && value && value.length > rule.maxLength) {
      errors[field] = `${field} must be less than ${rule.maxLength} characters`
    } else if (rule.email && value && !validateEmail(value)) {
      errors[field] = 'Please enter a valid email address'
    } else if (rule.match && value && formData[rule.match] && value !== formData[rule.match]) {
      errors[field] = `${field} does not match`
    }
  })
  
  return errors
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}