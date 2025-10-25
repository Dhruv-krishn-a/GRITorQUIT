export function getISODate(daysFromToday = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().split('T')[0];
}

export function formatDate(isoString) {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Check if it's today
  if (isoString === today.toISOString().split('T')[0]) {
    return 'Today';
  }
  
  // Check if it's tomorrow
  if (isoString === tomorrow.toISOString().split('T')[0]) {
    return 'Tomorrow';
  }
  
  // Check if it's in the next 6 days
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  if (date < nextWeek && date > today) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
  
  // Default format for other dates
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'short', 
    day: 'numeric' 
  });
}

export function getPriorityClass(priority) {
  const classes = {
    high: 'priority-high',
    medium: 'priority-medium', 
    low: 'priority-low',
    none: ''
  };
  return classes[priority] || '';
}