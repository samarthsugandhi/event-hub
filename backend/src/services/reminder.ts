import Event from '../models/Event';
import Registration from '../models/Registration';
import { emitNotification } from './notification';
import { sendEventNotificationEmail, isEmailConfigured } from './email';

// Set of eventIds we've already sent reminders for (to avoid duplicates per server lifetime)
const sentReminders = new Set<string>();

/**
 * Check for events starting within 1 hour and send reminder notifications
 * to all registered participants. Runs every 5 minutes.
 */
const checkAndSendReminders = async (): Promise<void> => {
  try {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    // Find published events starting within the next hour that we haven't reminded yet
    const upcomingEvents = await Event.find({
      status: 'published',
      date: { $gt: now, $lte: oneHourFromNow },
    });

    for (const event of upcomingEvents) {
      const eventKey = event._id.toString();

      if (sentReminders.has(eventKey)) continue;
      sentReminders.add(eventKey);

      console.log(`⏰ Sending reminders for: ${event.title}`);

      // Socket.io real-time notification to all connected clients
      await emitNotification({
        title: '⏰ Event Starting Soon!',
        message: `${event.title} starts in less than 1 hour at ${event.venue}. Get ready!`,
        type: 'event_starting',
        eventId: eventKey,
      });

      // Email reminders to all registered participants (async, non-blocking)
      // Skipped entirely if SMTP is not configured — socket notification still goes out
      if (isEmailConfigured()) {
        const registrations = await Registration.find({
          eventId: event._id,
          attendanceStatus: 'registered',
        });

        for (const reg of registrations) {
          sendEventNotificationEmail(
            reg.email,
            event.title,
            `⏰ Reminder: ${event.title} starts in less than 1 hour!\n\n📍 Venue: ${event.venue}\n🕐 Time: ${event.time}\n\nPlease arrive early. See you there!`
          ).catch((err) => console.error(`Reminder email failed for ${reg.email}:`, err));
        }

        console.log(`  ✉️ Sent ${registrations.length} email reminders`);
      } else {
        console.log(`  📧 Email reminders skipped (SMTP not configured) — toast notification sent`);
      }
    }
  } catch (error) {
    console.error('Reminder service error:', error);
  }
};

/**
 * Start the reminder scheduler — runs every 5 minutes
 */
export const startReminderService = (): void => {
  console.log('⏰ Event reminder service started (checks every 5 min)');

  // Check immediately on startup
  checkAndSendReminders();

  // Then every 5 minutes
  setInterval(checkAndSendReminders, 5 * 60 * 1000);
};
