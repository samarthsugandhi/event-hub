import { Router, Response } from 'express';
import Event from '../models/Event';
import Registration from '../models/Registration';
import AnalyticsEvent from '../models/AnalyticsEvent';
import { protect, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/analytics/overview
router.get(
  '/overview',
  protect,
  authorize('admin', 'organizer'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const query: any = {};
      if (req.user?.role === 'organizer') {
        query.createdBy = req.user._id;
      }

      const events = await Event.find(query);
      const eventIds = events.map((e) => e._id);

      const totalRegistrations = await Registration.countDocuments({
        eventId: { $in: eventIds },
      });
      const totalAttendance = await Registration.countDocuments({
        eventId: { $in: eventIds },
        attendanceStatus: 'present',
      });

      res.json({
        success: true,
        data: {
          totalEvents: events.length,
          totalRegistrations,
          totalAttendance,
          noShows: totalRegistrations - totalAttendance,
          attendanceRate: totalRegistrations > 0
            ? ((totalAttendance / totalRegistrations) * 100).toFixed(1)
            : '0',
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// GET /api/analytics/events — Per-event stats
router.get(
  '/events',
  protect,
  authorize('admin', 'organizer'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const query: any = {};
      if (req.user?.role === 'organizer') {
        query.createdBy = req.user._id;
      }

      const events = await Event.find(query).sort('-date').select(
        'title category date registrationCount attendanceCount maxParticipants'
      );

      const eventStats = events.map((event) => ({
        id: event._id,
        title: event.title,
        category: event.category,
        date: event.date,
        registrations: event.registrationCount,
        attendance: event.attendanceCount,
        maxParticipants: event.maxParticipants,
        noShows: event.registrationCount - event.attendanceCount,
        attendanceRate: event.registrationCount > 0
          ? ((event.attendanceCount / event.registrationCount) * 100).toFixed(1)
          : '0',
        fillRate: ((event.registrationCount / event.maxParticipants) * 100).toFixed(1),
      }));

      res.json({ success: true, data: eventStats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// GET /api/analytics/departments
router.get(
  '/departments',
  protect,
  authorize('admin', 'organizer'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const departmentStats = await Registration.aggregate([
        {
          $group: {
            _id: '$department',
            totalRegistrations: { $sum: 1 },
            attended: {
              $sum: { $cond: [{ $eq: ['$attendanceStatus', 'present'] }, 1, 0] },
            },
          },
        },
        { $sort: { totalRegistrations: -1 } },
      ]);

      res.json({ success: true, data: departmentStats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// GET /api/analytics/categories
router.get(
  '/categories',
  protect,
  authorize('admin', 'organizer'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const categoryStats = await Event.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalRegistrations: { $sum: '$registrationCount' },
            totalAttendance: { $sum: '$attendanceCount' },
          },
        },
        { $sort: { totalRegistrations: -1 } },
      ]);

      res.json({ success: true, data: categoryStats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// GET /api/analytics/event/:id
router.get(
  '/event/:id',
  protect,
  authorize('admin', 'organizer'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) {
        res.status(404).json({ success: false, message: 'Event not found' });
        return;
      }

      const registrations = await Registration.find({ eventId: req.params.id });

      const departmentBreakdown = registrations.reduce((acc: Record<string, number>, reg) => {
        acc[reg.department] = (acc[reg.department] || 0) + 1;
        return acc;
      }, {});

      const yearBreakdown = registrations.reduce((acc: Record<string, number>, reg) => {
        acc[reg.year] = (acc[reg.year] || 0) + 1;
        return acc;
      }, {});

      const attended = registrations.filter((r) => r.attendanceStatus === 'present').length;

      res.json({
        success: true,
        data: {
          event: {
            title: event.title,
            category: event.category,
            date: event.date,
            maxParticipants: event.maxParticipants,
          },
          registrations: registrations.length,
          attended,
          noShows: registrations.length - attended,
          attendanceRate: registrations.length > 0
            ? ((attended / registrations.length) * 100).toFixed(1)
            : '0',
          departmentBreakdown,
          yearBreakdown,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// POST /api/analytics/track — Record funnel event (no auth required for offline support)
router.post(
  '/track',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId, eventId, step, path, metadata } = req.body;

      if (!step || !['discover', 'view_detail', 'register', 'pay', 'attend'].includes(step)) {
        res.status(400).json({ success: false, message: 'Invalid funnel step' });
        return;
      }

      const analyticsEvent = await AnalyticsEvent.create({
        userId,
        eventId,
        step,
        path,
        metadata,
      });

      res.status(201).json({ success: true, data: analyticsEvent });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// GET /api/analytics/funnel — Get user's funnel journey
router.get(
  '/funnel',
  protect,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      const query: any = { userId: req.user?._id };

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate as string);
        if (endDate) query.createdAt.$lte = new Date(endDate as string);
      }

      const events = await AnalyticsEvent.find(query)
        .sort('createdAt')
        .populate('eventId', 'title category');

      // Compute funnel conversion rates
      const steps = ['discover', 'view_detail', 'register', 'pay', 'attend'];
      const stepCounts: Record<string, number> = {};
      steps.forEach((s) => {
        stepCounts[s] = events.filter((e) => e.step === s).length;
      });

      const conversions: Record<string, string> = {};
      for (let i = 0; i < steps.length - 1; i++) {
        const current = steps[i];
        const next = steps[i + 1];
        const rate = stepCounts[current] > 0
          ? ((stepCounts[next] / stepCounts[current]) * 100).toFixed(1)
          : '0';
        conversions[`${current}_to_${next}`] = rate;
      }

      res.json({
        success: true,
        data: {
          events,
          stepCounts,
          conversions,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// GET /api/analytics/funnel/summary (admin) — Platform-wide funnel summary
router.get(
  '/funnel/summary',
  protect,
  authorize('admin'),
  async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const steps = ['discover', 'view_detail', 'register', 'pay', 'attend'];
      const stepCounts: Record<string, number> = {};
      const uniqueUsers: Record<string, Set<string>> = {};

      for (const step of steps) {
        const events = await AnalyticsEvent.find({ step });
        stepCounts[step] = events.length;
        uniqueUsers[step] = new Set(events.map((e) => e.userId).filter(Boolean) as string[]);
      }

      const conversions: Record<string, string> = {};
      for (let i = 0; i < steps.length - 1; i++) {
        const current = steps[i];
        const next = steps[i + 1];
        const rate = stepCounts[current] > 0
          ? ((stepCounts[next] / stepCounts[current]) * 100).toFixed(1)
          : '0';
        conversions[`${current}_to_${next}`] = rate;
      }

      res.json({
        success: true,
        data: {
          stepCounts,
          uniqueUserCounts: Object.fromEntries(
            Object.entries(uniqueUsers).map(([step, users]) => [step, users.size])
          ),
          conversions,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;
