import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: (process.env.JWT_EXPIRE || '7d') as any,
  });
};

// POST /api/auth/register
router.post('/register', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, department, year, usn, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'An account with this email already exists' });
      return;
    }

    // Only allow student/faculty/organizer roles during self-registration
    const allowedRoles = ['student', 'faculty', 'organizer'];
    const userRole = role && allowedRoles.includes(role) ? role : 'student';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone?.trim(),
      department: department?.trim(),
      year,
      usn: usn?.trim(),
      role: userRole,
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        year: user.year,
        usn: user.usn,
      },
    });
  } catch (error: any) {
    // Better error messages for mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      res.status(400).json({ success: false, message: messages.join('. ') });
      return;
    }
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'An account with this email already exists' });
      return;
    }
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide both email and password' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, message: 'No account found with this email. Please sign up first.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
      return;
    }

    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        year: user.year,
        usn: user.usn,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/auth/update
router.put('/update', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const fields = ['name', 'email', 'phone', 'department', 'year', 'usn'];
    const updates: any = {};
    fields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // If email is being changed, check for uniqueness
    if (updates.email) {
      updates.email = updates.email.toLowerCase().trim();
      const existing = await User.findOne({ email: updates.email, _id: { $ne: req.user?._id } });
      if (existing) {
        res.status(400).json({ success: false, message: 'This email is already in use by another account' });
        return;
      }
    }

    const user = await User.findByIdAndUpdate(req.user?._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'This email is already in use' });
      return;
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
