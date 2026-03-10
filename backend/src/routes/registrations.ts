import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Event from '../models/Event';
import Registration from '../models/Registration';
import { protect, authorize, AuthRequest } from '../middleware/auth';
import { generateQRCode } from '../services/qrcode';
import { sendEventPassEmail } from '../services/email';
import { emitAttendanceUpdate } from '../services/notification';

const router = Router();

// ————— Named routes MUST be declared before /:eventId —————

// POST /api/registrations/verify — QR Verification
router.post(
  '/verify',
  protect,
  authorize('organizer', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { registrationId, eventId } = req.body;

      const registration = await Registration.findOne({ registrationId, eventId });

      if (!registration) {
        res.status(404).json({
          success: false,
          message: 'Registration not found',
          verified: false,
        });
        return;
      }

      if (registration.attendanceStatus === 'present') {
        res.status(400).json({
          success: false,
          message: 'Already checked in',
          verified: false,
          registration,
        });
        return;
      }

      registration.attendanceStatus = 'present';
      registration.checkedInAt = new Date();
      await registration.save();

      // Update event attendance count
      await Event.findByIdAndUpdate(eventId, { $inc: { attendanceCount: 1 } });

      // Emit real-time update
      emitAttendanceUpdate(eventId, {
        registrationId,
        name: registration.name,
        status: 'present',
        checkedInAt: registration.checkedInAt,
      });

      res.json({
        success: true,
        message: 'Check-in successful',
        verified: true,
        data: {
          name: registration.name,
          department: registration.department,
          usn: registration.usn,
          registrationId: registration.registrationId,
          checkedInAt: registration.checkedInAt,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// GET /api/registrations/my — User's registrations
router.get('/my', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const registrations = await Registration.find({
      email: req.user?.email,
    })
      .populate('eventId', 'title date venue poster category')
      .sort('-registeredAt');

    res.json({ success: true, data: registrations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/registrations/event/:eventId — Get registrations for event
router.get(
  '/event/:eventId',
  protect,
  authorize('organizer', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { page = '1', limit = '50', status } = req.query;
      const query: any = { eventId: req.params.eventId };

      if (status) query.attendanceStatus = status;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);

      const registrations = await Registration.find(query)
        .sort('-registeredAt')
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      const total = await Registration.countDocuments(query);

      res.json({
        success: true,
        data: registrations,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// GET /api/registrations/export/:eventId — Export CSV
router.get(
  '/export/:eventId',
  protect,
  authorize('organizer', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { format = 'csv' } = req.query;
      const registrations = await Registration.find({
        eventId: req.params.eventId,
      }).sort('name');

      const event = await Event.findById(req.params.eventId);
      const safeTitle = (event?.title || 'registrations').replace(/[^a-zA-Z0-9-_ ]/g, '');

      if (format === 'json') {
        // Return raw JSON for client-side PDF generation
        res.json({
          success: true,
          event: event ? {
            title: event.title,
            date: event.date,
            venue: event.venue,
            category: event.category,
            registrationCount: event.registrationCount,
            maxParticipants: event.maxParticipants,
            pricingType: event.pricingType,
            price: event.price,
            priceType: event.priceType,
            participationType: event.participationType,
          } : null,
          data: registrations.map((r, i) => ({
            sNo: i + 1,
            registrationId: r.registrationId,
            name: r.name,
            email: r.email,
            phone: r.phone,
            department: r.department,
            year: r.year,
            usn: r.usn,
            teamName: r.teamName || '',
            teamMembers: (r.teamMembers || []).map((m: any) => `${m.name} (${m.usn})`).join('; '),
            attendanceStatus: r.attendanceStatus,
            paymentStatus: r.paymentStatus || 'not_required',
            paymentAmount: r.paymentAmount || 0,
            registeredAt: r.registeredAt?.toISOString() || '',
            checkedInAt: r.checkedInAt?.toISOString() || '',
          })),
          total: registrations.length,
        });
        return;
      }

      // CSV format
      const csvHeader = 'S.No,Registration ID,Name,Email,Phone,Department,Year,USN,Team Name,Team Members,Attendance,Payment Status,Amount (₹),Registered At,Checked In At\n';
      const csvRows = registrations
        .map(
          (r, i) =>
            `${i + 1},"${r.registrationId}","${r.name}","${r.email}","${r.phone}","${r.department}","${r.year}","${r.usn}","${r.teamName || ''}","${(r.teamMembers || []).map((m: any) => m.name).join('; ')}","${r.attendanceStatus}","${r.paymentStatus || 'N/A'}",${r.paymentAmount || 0},"${r.registeredAt?.toISOString() || ''}","${r.checkedInAt?.toISOString() || ''}"`
        )
        .join('\n');

      const csv = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${safeTitle}-participants.csv"`
      );
      res.send('\ufeff' + csv); // BOM for Excel compatibility
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// GET /api/registrations/pass/:registrationId — Get event pass
router.get('/pass/:registrationId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const registration = await Registration.findOne({
      registrationId: req.params.registrationId,
    }).populate('eventId', 'title date venue poster category time');

    if (!registration) {
      res.status(404).json({ success: false, message: 'Registration not found' });
      return;
    }

    res.json({ success: true, data: registration });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ————— Parameterized routes —————

// POST /api/registrations/:eventId — Register for event
router.post('/:eventId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { name, email, phone, department, year, usn, teamName, teamMembers } = req.body;

    // Validate event
    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    if (event.status !== 'published') {
      res.status(400).json({ success: false, message: 'Event is not published yet' });
      return;
    }

    if (!event.registrationOpen) {
      res.status(400).json({ success: false, message: 'Registration is not open yet. The organizer will open it soon.' });
      return;
    }

    if (event.registrationType === 'external') {
      res.status(400).json({
        success: false,
        message: 'This event uses external registration',
        externalLink: event.externalLink,
      });
      return;
    }

    // Check deadline
    if (new Date() > new Date(event.registrationDeadline)) {
      res.status(400).json({ success: false, message: 'Registration deadline has passed' });
      return;
    }

    // Check capacity
    if (event.registrationCount >= event.maxParticipants) {
      res.status(400).json({ success: false, message: 'Event is full' });
      return;
    }

    // Check duplicate
    const existingReg = await Registration.findOne({ eventId, email });
    if (existingReg) {
      res.status(400).json({ success: false, message: 'Already registered for this event' });
      return;
    }

    // Validate team if team event
    if (event.participationType === 'team') {
      if (!teamName || !teamName.trim()) {
        res.status(400).json({ success: false, message: 'Team name is required for team events' });
        return;
      }
      const members = teamMembers || [];
      const totalSize = 1 + members.length; // leader + members
      if (totalSize < event.minTeamSize) {
        res.status(400).json({
          success: false,
          message: `Team must have at least ${event.minTeamSize} members (including you)`,
        });
        return;
      }
      if (totalSize > event.maxTeamSize) {
        res.status(400).json({
          success: false,
          message: `Team cannot exceed ${event.maxTeamSize} members`,
        });
        return;
      }
    }

    // Generate unique registration ID
    const registrationId = `BV-${uuidv4().slice(0, 8).toUpperCase()}`;

    // Generate QR code
    const qrData = JSON.stringify({
      registrationId,
      eventId,
      name,
      email,
    });
    const qrCode = await generateQRCode(qrData);

    // Create registration
    const registration = await Registration.create({
      registrationId,
      eventId,
      name,
      email,
      phone,
      department,
      year,
      usn,
      teamName: event.participationType === 'team' ? teamName : undefined,
      teamMembers: event.participationType === 'team' ? (teamMembers || []) : undefined,
      qrCode,
      paymentStatus: event.pricingType === 'paid' ? 'pending' : 'not_required',
      paymentAmount: event.pricingType === 'paid' ? event.price : 0,
    });

    // Update event registration count
    await Event.findByIdAndUpdate(eventId, { $inc: { registrationCount: 1 } });

    // Send email with pass (async, non-blocking)
    sendEventPassEmail({
      to: email,
      participantName: name,
      eventTitle: event.title,
      eventDate: new Date(event.date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      eventVenue: event.venue,
      registrationId,
      qrCode,
    }).catch(console.error);

    res.status(201).json({
      success: true,
      data: {
        registration,
        eventTitle: event.title,
        eventDate: event.date,
        eventVenue: event.venue,
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'Already registered for this event' });
      return;
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
