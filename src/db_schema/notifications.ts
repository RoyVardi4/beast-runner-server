import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const NotificationsSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  workout: {
    type: String,
    required: true
  },
  is_seen: {
    type: Boolean,
    required: true
  }
});

const Notifications = mongoose.model('Notifications', NotificationsSchema);

export default Notifications;
