import mongoose from 'mongoose';
const EventLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true
  },
  event_type: {
    type: String,
    required: true
  },
  details: {
    type: String
  }
});

export default mongoose.model('EventLog', EventLogSchema);