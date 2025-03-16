import EventLog from '../models/EventLog.js';

const logEvent = async (eventType, details) => {
  const log = new EventLog({
    timestamp: new Date(),
    event_type: eventType,
    details
  });
  await log.save();
};

export default logEvent;
