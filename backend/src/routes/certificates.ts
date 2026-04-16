import { Router, Response } from 'express';
import Certificate from '../models/Certificate';
import Event from '../models/Event';
import Registration from '../models/Registration';
import { protect, authorize, AuthRequest } from '../middleware/auth';
import { emitNotification } from '../services/notification';

const router = Router();

// Helper: Generate unique certificate number (CERT-YYYY-NNNNNNN)
function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, '0');
  return `CERT-${year}-${random}`;
}

// POST /api/certificates/issue — Bulk issue certificates to event attendees (admin)
router.post(
  '/issue',
  protect,
  authorize('admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { eventId, userIds } = req.body;

      if (!eventId) {
        res.status(400).json({ success: false, message: 'Event ID is required' });
        return;
      }

      const event = await Event.findById(eventId);
      if (!event) {
        res.status(404).json({ success: false, message: 'Event not found' });
        return;
      }

      // If no userIds provided, issue to all attendees
      let targetUserIds = userIds;
      if (!targetUserIds || targetUserIds.length === 0) {
        const attendees = await Registration.find({
          eventId,
          attendanceStatus: 'present',
        }).select('userId');
        targetUserIds = attendees.map((a) => a.userId);
      }

      const certificates = [];
      for (const userId of targetUserIds) {
        // Skip if certificate already exists
        const existing = await Certificate.findOne({ userId, eventId });
        if (existing) continue;

        const cert = await Certificate.create({
          userId,
          eventId,
          certificateNumber: generateCertificateNumber(),
          issuedAt: new Date(),
        });

        certificates.push(cert);

        // Send notification to user
        try {
          await emitNotification({
            title: 'Certificate Issued',
            message: `You have been issued a certificate for ${event.title}`,
            type: 'certificate_issued',
            eventId: eventId.toString(),
          });
        } catch (e) {
          // Silently ignore notification errors
        }
      }

      res.status(201).json({
        success: true,
        data: certificates,
        message: `${certificates.length} certificates issued`,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// GET /api/user/certificates — Get user's certificates
router.get(
  '/',
  protect,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const certificates = await Certificate.find({
        userId: req.user?._id,
      })
        .populate('eventId', 'title category date')
        .sort('-issuedAt');

      res.json({
        success: true,
        data: certificates,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// GET /api/certificates/:id — Get certificate details (for PDF generation)
router.get(
  '/:id',
  protect,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const cert = await Certificate.findById(req.params.id)
        .populate('userId', 'name email')
        .populate('eventId', 'title date venue category');

      if (!cert) {
        res.status(404).json({ success: false, message: 'Certificate not found' });
        return;
      }

      // Check authorization (user can only view own cert, admin can view all)
      if (req.user?.role !== 'admin' && cert.userId._id.toString() !== req.user?._id.toString()) {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }

      // Increment download count
      cert.downloadCount = (cert.downloadCount || 0) + 1;
      cert.lastDownloadedAt = new Date();
      await cert.save();

      res.json({
        success: true,
        data: cert,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;
