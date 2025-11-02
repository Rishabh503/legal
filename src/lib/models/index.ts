// Import User first - it's the base model
import User from './user';
import Lawyer from './lawyer';
import Client from './client';
import Booking from './booking';
import Review from './review';

// Export all models
export { User, Lawyer, Client, Booking, Review };

// Export default for easy import
export default {
  User,
  Lawyer,
  Client,
  Booking,
  Review
};