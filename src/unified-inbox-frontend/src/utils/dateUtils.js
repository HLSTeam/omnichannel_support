import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Extend dayjs with relative time plugin
dayjs.extend(relativeTime);

/**
 * Format date to relative time (e.g., "2 hours ago", "3 days ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeDate = (date) => {
  if (!date) return 'Unknown';
  
  try {
    return dayjs(date).fromNow();
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Unknown';
  }
};

/**
 * Format date to readable format (e.g., "Jan 15, 2024 at 2:30 PM")
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatReadableDate = (date) => {
  if (!date) return 'Unknown';
  
  try {
    return dayjs(date).format('MMM D, YYYY [at] h:mm A');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Unknown';
  }
};

/**
 * Check if date is recent (within last 24 hours)
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is recent
 */
export const isRecent = (date) => {
  if (!date) return false;
  
  try {
    const now = dayjs();
    const targetDate = dayjs(date);
    return now.diff(targetDate, 'hour') < 24;
  } catch (error) {
    console.error('Error checking if date is recent:', error);
    return false;
  }
};

/**
 * Get time ago in specific unit
 * @param {string|Date} date - Date to check
 * @param {string} unit - Unit to return (hour, day, week, month, year)
 * @returns {number} Time ago in specified unit
 */
export const getTimeAgo = (date, unit = 'hour') => {
  if (!date) return 0;
  
  try {
    const now = dayjs();
    const targetDate = dayjs(date);
    return now.diff(targetDate, unit);
  } catch (error) {
    console.error('Error getting time ago:', error);
    return 0;
  }
};
