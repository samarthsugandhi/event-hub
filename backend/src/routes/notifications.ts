import { Router, Response } from 'express';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/notifications
router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find()
      .sort('-createdAt')
      .limit(20)
      .populate('eventId', 'title');
    res.json({ success: true, data: notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
