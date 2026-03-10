import { Router, Response } from 'express';
import Event from '../models/Event';
import Registration from '../models/Registration';
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

export default router;
