
// Import User first - it's the base model
import User from './user';
import Lawyer from './lawyer';
import Client from './client';
import Booking from './booking';
import Review from './review';
import Chat from './chat';

// Export all models
export { User, Lawyer, Client, Booking, Review, Chat };

// Export default for easy import
const models = {
  User,
  Lawyer,
  Client,
  Booking,
  Review,
  Chat
};

export default models;
