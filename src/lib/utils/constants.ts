// Legal Specializations
export const SPECIALIZATIONS = [
  'Criminal Law',
  'Civil Law',
  'Corporate Law',
  'Family Law',
  'Property Law',
  'Tax Law',
  'Labor Law',
  'Intellectual Property',
  'Constitutional Law',
  'Environmental Law',
  'Immigration Law',
  'Cyber Law'
] as const;

// Languages
export const LANGUAGES = [
  'English',
  'Hindi',
  'Bengali',
  'Telugu',
  'Marathi',
  'Tamil',
  'Gujarati',
  'Urdu',
  'Kannada',
  'Malayalam',
  'Punjabi'
] as const;

// Session Types
export const SESSION_TYPES = [
  { value: 'consultation', label: 'Initial Consultation' },
  { value: 'follow-up', label: 'Follow-up Session' },
  { value: 'legal-advice', label: 'Legal Advice' },
  { value: 'case-review', label: 'Case Review' }
] as const;

// Duration Types
export const DURATION_TYPES = [
  { value: 'half-hour', label: '30 Minutes' },
  { value: 'full-hour', label: '60 Minutes' }
] as const;

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded'
} as const;

// Days of Week
export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
] as const;

// Time Slots (24-hour format)
export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00'
] as const;

// Education Degrees
export const DEGREES = [
  'LLB (Bachelor of Laws)',
  'LLM (Master of Laws)',
  'BA LLB',
  'BBA LLB',
  'BCom LLB',
  'BSc LLB',
  'PhD in Law'
] as const;

// Currency
export const CURRENCIES = [
  { value: 'INR', label: '₹ INR', symbol: '₹' },
  { value: 'USD', label: '$ USD', symbol: '$' },
  { value: 'EUR', label: '€ EUR', symbol: '€' },
  { value: 'GBP', label: '£ GBP', symbol: '£' }
] as const;