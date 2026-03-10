import { Router, Response } from 'express';
import Bookmark from '../models/Bookmark';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

// All bookmark routes require authentication
router.use(protect);

// POST /api/bookmarks/:eventId — Toggle bookmark (add / remove)
router.post('/:eventId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const userId = req.user?._id;

    const existing = await Bookmark.findOne({ userId, eventId });

    if (existing) {
      await Bookmark.findByIdAndDelete(existing._id);
      res.json({ success: true, bookmarked: false, message: 'Bookmark removed' });
    } else {
      await Bookmark.create({ userId, eventId });
      res.json({ success: true, bookmarked: true, message: 'Event bookmarked' });
    }
  } catch (error: any) {
    if (error.code === 11000) {
      // Race condition fallback — already bookmarked
      res.json({ success: true, bookmarked: true, message: 'Already bookmarked' });
      return;
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/bookmarks — List my bookmarked events
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user?._id })
      .populate({
        path: 'eventId',
        select: 'title slug date venue category poster registrationCount maxParticipants status tags featured',
      })
      .sort('-createdAt');

    // Filter out any bookmarks whose event was deleted
    const valid = bookmarks.filter((b) => b.eventId != null);

    res.json({ success: true, data: valid });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/bookmarks/check/:eventId — Check if bookmarked
router.get('/check/:eventId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const exists = await Bookmark.findOne({
      userId: req.user?._id,
      eventId: req.params.eventId,
    });
    res.json({ success: true, bookmarked: !!exists });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/bookmarks/:eventId — Remove bookmark
router.delete('/:eventId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Bookmark.findOneAndDelete({
      userId: req.user?._id,
      eventId: req.params.eventId,
    });
    res.json({ success: true, bookmarked: false, message: 'Bookmark removed' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
