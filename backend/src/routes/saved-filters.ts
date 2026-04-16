import { Router, Response } from 'express';
import SavedFilter, { ISavedFilter } from '../models/SavedFilter';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require auth
router.use(protect);

// GET /api/user/saved-filters — List user's saved filter presets
router.get(
  '/',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const filters = await SavedFilter.find({ userId: req.user?._id }).sort('-createdAt');

      res.json({
        success: true,
        data: filters,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// POST /api/user/saved-filters — Create new filter preset
router.post(
  '/',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name, filters, isDefault } = req.body;

      if (!name || !filters) {
        res.status(400).json({ success: false, message: 'Name and filters are required' });
        return;
      }

      // Check for duplicate name
      const existing = await SavedFilter.findOne({
        userId: req.user?._id,
        name,
      });

      if (existing) {
        res.status(409).json({ success: false, message: 'Filter preset with this name already exists' });
        return;
      }

      const filter = await SavedFilter.create({
        userId: req.user?._id,
        name,
        filters,
        isDefault: isDefault || false,
      });

      res.status(201).json({
        success: true,
        data: filter,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// GET /api/user/saved-filters/:id — Get single preset
router.get(
  '/:id',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const filter = await SavedFilter.findOne({
        _id: req.params.id,
        userId: req.user?._id,
      });

      if (!filter) {
        res.status(404).json({ success: false, message: 'Filter preset not found' });
        return;
      }

      res.json({
        success: true,
        data: filter,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// PUT /api/user/saved-filters/:id — Update preset
router.put(
  '/:id',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name, filters, isDefault } = req.body;

      const filter = await SavedFilter.findOne({
        _id: req.params.id,
        userId: req.user?._id,
      });

      if (!filter) {
        res.status(404).json({ success: false, message: 'Filter preset not found' });
        return;
      }

      // Check if new name conflicts with another preset
      if (name && name !== filter.name) {
        const duplicate = await SavedFilter.findOne({
          userId: req.user?._id,
          name,
          _id: { $ne: req.params.id },
        });

        if (duplicate) {
          res.status(409).json({ success: false, message: 'Another preset with this name already exists' });
          return;
        }
      }

      if (name) filter.name = name;
      if (filters) filter.filters = filters;
      if (typeof isDefault === 'boolean') filter.isDefault = isDefault;

      await filter.save();

      res.json({
        success: true,
        data: filter,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// DELETE /api/user/saved-filters/:id — Delete preset
router.delete(
  '/:id',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const filter = await SavedFilter.findOneAndDelete({
        _id: req.params.id,
        userId: req.user?._id,
      });

      if (!filter) {
        res.status(404).json({ success: false, message: 'Filter preset not found' });
        return;
      }

      res.json({
        success: true,
        message: 'Filter preset deleted',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;
