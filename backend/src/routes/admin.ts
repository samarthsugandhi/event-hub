import { Router, Response } from 'express';
import Event from '../models/Event';
import Registration from '../models/Registration';
import User from '../models/User';
import AnomalyRule from '../models/AnomalyRule';
import { protect, authorize, AuthRequest } from '../middleware/auth';
import { emitNotification } from '../services/notification';

const router = Router();

// All admin routes require admin role
router.use(protect, authorize('admin'));

// GET /api/admin/stats
router.get('/stats', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalEvents,
      publishedEvents,
      pendingEvents,
      upcomingEvents,
      totalRegistrations,
      totalAttendance,
      totalUsers,
    ] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ status: 'published' }),
      Event.countDocuments({ status: 'pending' }),
      Event.countDocuments({ status: 'published', date: { $gte: new Date() } }),
      Registration.countDocuments(),
      Registration.countDocuments({ attendanceStatus: 'present' }),
      User.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        totalEvents,
        publishedEvents,
        pendingEvents,
        upcomingEvents,
        totalRegistrations,
        totalAttendance,
        totalUsers,
        attendanceRate: totalRegistrations > 0
          ? ((totalAttendance / totalRegistrations) * 100).toFixed(1)
          : '0',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/events — All events (any status)
router.get('/events', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const query: any = {};
    if (status) query.status = status;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const events = await Event.find(query)
      .sort('-createdAt')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('createdBy', 'name email role');

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: events,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/events/:id/approve — Approve & publish in one step
router.put('/events/:id/approve', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: 'published' },
      { new: true }
    );
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    await emitNotification({
      title: 'New Event Published',
      message: `${event.title} has been approved & published! Registration will be opened by the organizer.`,
      type: 'event_published',
      eventId: event._id.toString(),
    });

    res.json({ success: true, data: event });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/events/:id/publish
router.put('/events/:id/publish', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: 'published' },
      { new: true }
    );
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    await emitNotification({
      title: 'New Event Published',
      message: `${event.title} is now open for registration!`,
      type: 'event_published',
      eventId: event._id.toString(),
    });

    res.json({ success: true, data: event });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/events/:id/reject
router.put('/events/:id/reject', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }
    res.json({ success: true, data: event });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/events/:id/feature
router.put('/events/:id/feature', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }
    event.featured = !event.featured;
    await event.save();
    res.json({ success: true, data: event });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/users
router.get('/users', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, page = '1', limit = '20' } = req.query;
    const query: any = {};
    if (role) query.role = role;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const users = await User.find(query)
      .sort('-createdAt')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/anomalies — Detect anomalies based on rules
router.get('/anomalies', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rules = await AnomalyRule.find({ enabled: true });
    const anomalies: any[] = [];

    // Fetch all events with registrations
    const events = await Event.find().select(
      '_id title date registrationCount attendanceCount maxParticipants status registrationOpen'
    );

    for (const event of events) {
      // Check 'overflow' rule: registrations exceed max participants
      const overflowRule = rules.find((r) => r.ruleType === 'overflow');
      if (overflowRule && event.registrationCount > event.maxParticipants) {
        anomalies.push({
          type: 'overflow',
          severity: 'high',
          eventId: event._id,
          title: event.title,
          message: `Registration overflow: ${event.registrationCount} registrations exceed ${event.maxParticipants} max capacity`,
          excess: event.registrationCount - event.maxParticipants,
        });
      }

      // Check 'no-show-gap' rule: high no-show rate
      const noShowGapRule = rules.find((r) => r.ruleType === 'no-show-gap');
      if (noShowGapRule && event.attendanceCount > 0) {
        const noShowCount = event.registrationCount - event.attendanceCount;
        if (noShowCount >= noShowGapRule.threshold) {
          anomalies.push({
            type: 'no-show-gap',
            severity: 'medium',
            eventId: event._id,
            title: event.title,
            message: `High no-show rate: ${noShowCount} no-shows out of ${event.registrationCount} registrations`,
            gap: noShowCount,
          });
        }
      }

      // Check 'low-attendance' rule: attendance rate below threshold
      const lowAttendanceRule = rules.find((r) => r.ruleType === 'low-attendance');
      if (lowAttendanceRule && event.registrationCount > 0) {
        const attendanceRate = (event.attendanceCount / event.registrationCount) * 100;
        if (attendanceRate < lowAttendanceRule.threshold) {
          anomalies.push({
            type: 'low-attendance',
            severity: 'medium',
            eventId: event._id,
            title: event.title,
            message: `Low attendance rate: ${attendanceRate.toFixed(1)}% (${event.attendanceCount}/${event.registrationCount})`,
            rate: attendanceRate.toFixed(1),
          });
        }
      }
    }

    // Sort by severity and return top anomalies
    const sortedAnomalies = anomalies.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity as keyof typeof severityOrder] - 
             severityOrder[b.severity as keyof typeof severityOrder];
    });

    res.json({
      success: true,
      data: sortedAnomalies.slice(0, 20), // Return top 20 anomalies
      total: anomalies.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/anomaly-rules — List configured anomaly rules
router.get('/anomaly-rules', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rules = await AnomalyRule.find().sort('ruleType');
    res.json({ success: true, data: rules });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/anomaly-rules — Create anomaly rule
router.post('/anomaly-rules', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ruleType, threshold, description, enabled } = req.body;
    if (!ruleType || threshold === undefined) {
      res.status(400).json({ success: false, message: 'ruleType and threshold are required' });
      return;
    }

    const rule = await AnomalyRule.create({
      ruleType,
      threshold,
      description: description || '',
      enabled: typeof enabled === 'boolean' ? enabled : true,
    });

    res.status(201).json({ success: true, data: rule });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/anomaly-rules/:id — Update anomaly rule
router.put('/anomaly-rules/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rule = await AnomalyRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!rule) {
      res.status(404).json({ success: false, message: 'Rule not found' });
      return;
    }

    res.json({ success: true, data: rule });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/anomaly-rules/:id — Delete anomaly rule
router.delete('/anomaly-rules/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rule = await AnomalyRule.findByIdAndDelete(req.params.id);
    if (!rule) {
      res.status(404).json({ success: false, message: 'Rule not found' });
      return;
    }

    res.json({ success: true, message: 'Rule deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
