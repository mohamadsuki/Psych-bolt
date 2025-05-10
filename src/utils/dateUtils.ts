/**
 * Formats a date string to DD/MM/YYYY format
 * @param dateString - The date string to format
 * @returns Formatted date string in DD/MM/YYYY format
 */
export const formatDateToDDMMYYYY = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Check for invalid date
  if (isNaN(date.getTime())) return '';
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Converts a date string from any format to YYYY-MM-DD for HTML date inputs
 * @param dateString - The date string to convert
 * @returns Date string in YYYY-MM-DD format
 */
export const formatDateForInput = (dateString: string): string => {
  if (!dateString) return '';
  
  // If it's already in YYYY-MM-DD format, return it
  if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
    return dateString.split('T')[0];
  }
  
  // If it's in DD/MM/YYYY format, convert it
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  }
  
  // Otherwise, try to parse it as a date and format
  const date = new Date(dateString);
  
  // Check for invalid date
  if (isNaN(date.getTime())) return '';
  
  return date.toISOString().split('T')[0];
};

/**
 * Parses a date from DD/MM/YYYY format to a proper Date object
 * @param dateString - Date in DD/MM/YYYY format
 * @returns Date object or null if invalid
 */
export const parseDDMMYYYY = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  // Check if it's in DD/MM/YYYY format
  const match = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  
  const [_, day, month, year] = match;
  // Note: month is 0-based in Date constructor
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  // Validate the date is correct
  if (isNaN(date.getTime())) return null;
  
  return date;
};

/**
 * Calculates age from date of birth
 * @param dobString - Date of birth string
 * @returns Age in years and months as a formatted string
 */
export const calculateAge = (dobString: string): string => {
  if (!dobString) return '';
  
  const dob = new Date(dobString);
  const today = new Date();
  
  // Check for invalid date
  if (isNaN(dob.getTime())) return '';
  
  let years = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    years--;
  }
  
  const months = (today.getMonth() + 12 - dob.getMonth()) % 12;
  
  if (months > 0) {
    return `${years} שנים ו-${months} חודשים`;
  } else {
    return `${years} שנים`;
  }
};