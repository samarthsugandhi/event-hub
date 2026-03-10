import { Router, Response } from 'express';
import Event from '../models/Event';
import Registration from '../models/Registration';
import { protect, authorize, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { emitNotification } from '../services/notification';

const router = Router();

// GET /api/events — Public: list published events
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      category,
      search,
      status,
      featured,
      sort = '-date',
      page = '1',
      limit = '12',
      department,
    } = req.query;

    const query: any = {};

    // Public users only see published events
    if (!status) {
      query.status = 'published';
    } else {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (department) {
      query.organizerDepartment = department;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const events = await Event.find(query)
      .sort(sort as string)
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name email');

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/events/featured
router.get('/featured', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const events = await Event.find({ status: 'published', featured: true })
      .sort('-date')
      .limit(5);
    res.json({ success: true, data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/events/trending
router.get('/trending', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const events = await Event.find({ status: 'published', date: { $gte: new Date() } })
      .sort({ registrationCount: -1, views: -1 })
      .limit(8);
    res.json({ success: true, data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/events/upcoming
router.get('/upcoming', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const events = await Event.find({
      status: 'published',
      date: { $gte: new Date() },
    })
      .sort('date')
      .limit(12);
    res.json({ success: true, data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/events/live
router.get('/live', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const events = await Event.find({
      status: 'published',
      date: { $lte: now },
      $or: [
        { endDate: { $gte: now } },
        { endDate: null, date: { $gte: new Date(now.getTime() - 4 * 60 * 60 * 1000) } },
      ],
    }).sort('-registrationCount');
    res.json({ success: true, data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/events/recommended
router.get('/recommended', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userDept = req.user?.department;
    const events = await Event.find({
      status: 'published',
      date: { $gte: new Date() },
      ...(userDept ? { organizerDepartment: userDept } : {}),
    })
      .sort('-registrationCount')
      .limit(8);
    res.json({ success: true, data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/events/map
router.get('/map', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const events = await Event.find({
      status: 'published',
      date: { $gte: new Date() },
      'locationCoordinates.lat': { $exists: true },
    }).select('title slug date time venue locationCoordinates category registrationCount maxParticipants pricingType price priceType registrationDeadline');
    res.json({ success: true, data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/events/slug/:slug — SEO-friendly lookup
router.get('/slug/:slug', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await Event.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('createdBy', 'name email');

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }
    res.json({ success: true, data: event });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/events/my — Any user: get own events (all statuses), admin sees all
router.get('/my', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: any = {};
    if (req.user?.role !== 'admin') {
      query.createdBy = req.user?._id;
    }
    // Admin sees all events
    const events = await Event.find(query)
      .sort('-createdAt')
      .populate('createdBy', 'name email');
    res.json({ success: true, data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/events/:id/toggle-registration — Admin/organizer toggle registration open/close
router.put('/:id/toggle-registration', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }
    // Only admin or event creator can toggle
    if (req.user?.role !== 'admin' && event.createdBy.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }
    // Only published events can have registration toggled
    if (event.status !== 'published') {
      res.status(400).json({ success: false, message: 'Event must be published first' });
      return;
    }
    event.registrationOpen = !event.registrationOpen;
    await event.save();

    if (event.registrationOpen) {
      await emitNotification({
        title: 'Registration Opened',
        message: `Registration is now open for ${event.title}!`,
        type: 'event_published',
        eventId: event._id.toString(),
      });
    }

    res.json({ success: true, data: event });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/events/:id — also increments view count
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('createdBy', 'name email');

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }
    res.json({ success: true, data: event });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/events — Any logged-in user can create an event
router.post(
  '/',
  protect,
  upload.single('poster'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const eventData = {
        ...req.body,
        createdBy: req.user?._id,
        status: req.user?.role === 'admin' ? 'published' : 'pending',
        registrationOpen: req.user?.role === 'admin' ? true : false,
        poster: req.file ? `/uploads/${req.file.filename}` : undefined,
      };

      // Parse JSON fields
      if (req.body.locationCoordinates) {
        eventData.locationCoordinates = JSON.parse(req.body.locationCoordinates);
      }
      if (req.body.tags) {
        eventData.tags = JSON.parse(req.body.tags);
      }

      // Handle legacy nested organizer JSON (if sent as single field)
      if (req.body.organizer && typeof req.body.organizer === 'string') {
        try {
          const org = JSON.parse(req.body.organizer);
          eventData.organizerName = org.name || '';
          eventData.organizerDepartment = org.department || '';
          eventData.organizerEmail = org.email || '';
          delete eventData.organizer;
        } catch {}
      }

      // Parse numeric fields from FormData strings
      if (eventData.maxParticipants) eventData.maxParticipants = parseInt(eventData.maxParticipants);
      if (eventData.price) eventData.price = parseFloat(eventData.price);
      if (eventData.minTeamSize) eventData.minTeamSize = parseInt(eventData.minTeamSize);
      if (eventData.maxTeamSize) eventData.maxTeamSize = parseInt(eventData.maxTeamSize);

      const event = await Event.create(eventData);

      if (event.status === 'published') {
        await emitNotification({
          title: 'New Event Published',
          message: `${event.title} is now open for registration!`,
          type: 'event_published',
          eventId: event._id.toString(),
        });
      }

      res.status(201).json({ success: true, data: event });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// PUT /api/events/:id
router.put(
  '/:id',
  protect,
  upload.single('poster'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      let event = await Event.findById(req.params.id);
      if (!event) {
        res.status(404).json({ success: false, message: 'Event not found' });
        return;
      }

      // Only admin can edit any event; others can only edit their own
      if (
        req.user?.role !== 'admin' &&
        event.createdBy.toString() !== req.user?._id.toString()
      ) {
        res.status(403).json({ success: false, message: 'Not authorized to edit this event' });
        return;
      }

      const updates: any = { ...req.body };
      if (req.file) {
        updates.poster = `/uploads/${req.file.filename}`;
      }
      if (req.body.locationCoordinates) {
        updates.locationCoordinates = JSON.parse(req.body.locationCoordinates);
      }
      if (req.body.tags) {
        updates.tags = JSON.parse(req.body.tags);
      }

      event = await Event.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      });

      res.json({ success: true, data: event });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// DELETE /api/events/:id
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) {
        res.status(404).json({ success: false, message: 'Event not found' });
        return;
      }
      await Event.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'Event deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;
