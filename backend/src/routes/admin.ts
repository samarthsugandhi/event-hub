import { Router, Response } from 'express';
import Event from '../models/Event';
import Registration from '../models/Registration';
import User from '../models/User';
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

export default router;
