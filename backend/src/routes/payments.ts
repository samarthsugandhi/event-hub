import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Payment from '../models/Payment';
import Registration from '../models/Registration';
import Event from '../models/Event';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/payments/initiate — Create a pending payment for a registration
router.post('/initiate', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { registrationId } = req.body;

    const registration = await Registration.findOne({ registrationId });
    if (!registration) {
      res.status(404).json({ success: false, message: 'Registration not found' });
      return;
    }

    if (registration.paymentStatus === 'completed') {
      res.status(400).json({ success: false, message: 'Payment already completed' });
      return;
    }

    if (registration.paymentStatus === 'not_required') {
      res.status(400).json({ success: false, message: 'No payment required for this event' });
      return;
    }

    const event = await Event.findById(registration.eventId);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    // Check if there's already a pending payment
    const existingPayment = await Payment.findOne({
      registrationId,
      status: 'pending',
    });

    if (existingPayment) {
      // Return the existing pending payment
      res.json({
        success: true,
        data: existingPayment,
        event: {
          title: event.title,
          date: event.date,
          venue: event.venue,
          pricingType: event.pricingType,
          priceType: event.priceType,
          participationType: event.participationType,
        },
      });
      return;
    }

    // Calculate payment amount
    const amount = registration.paymentAmount;

    const paymentId = `PAY-${uuidv4().slice(0, 12).toUpperCase()}`;

    const payment = await Payment.create({
      paymentId,
      registrationId,
      eventId: registration.eventId,
      amount,
      currency: 'INR',
      payerName: registration.name,
      payerEmail: registration.email,
      status: 'pending',
      metadata: {
        teamName: registration.teamName || undefined,
        teamSize: registration.teamMembers ? registration.teamMembers.length + 1 : 1,
      },
    });

    res.status(201).json({
      success: true,
      data: payment,
      event: {
        title: event.title,
        date: event.date,
        venue: event.venue,
        pricingType: event.pricingType,
        priceType: event.priceType,
        participationType: event.participationType,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/payments/confirm — Simulate payment completion (prototype)
router.post('/confirm', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { paymentId, method } = req.body;

    const payment = await Payment.findOne({ paymentId });
    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment not found' });
      return;
    }

    if (payment.status === 'completed') {
      res.status(400).json({ success: false, message: 'Payment already completed' });
      return;
    }

    // Simulate payment processing delay
    // In production, this would be a webhook from a payment gateway like Razorpay/Stripe

    // Generate mock transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // Update payment
    payment.status = 'completed';
    payment.method = method || 'upi';
    payment.transactionId = transactionId;
    payment.paidAt = new Date();
    await payment.save();

    // Update registration payment status
    await Registration.findOneAndUpdate(
      { registrationId: payment.registrationId },
      { paymentStatus: 'completed' }
    );

    res.json({
      success: true,
      message: 'Payment successful!',
      data: payment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/payments/registration/:registrationId — Get payment for a registration
router.get('/registration/:registrationId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payment = await Payment.findOne({
      registrationId: req.params.registrationId,
    }).sort('-createdAt');

    if (!payment) {
      res.status(404).json({ success: false, message: 'No payment found' });
      return;
    }

    const registration = await Registration.findOne({
      registrationId: req.params.registrationId,
    });

    const event = registration ? await Event.findById(registration.eventId) : null;

    res.json({
      success: true,
      data: payment,
      registration: registration ? {
        registrationId: registration.registrationId,
        name: registration.name,
        email: registration.email,
        teamName: registration.teamName,
        teamMembers: registration.teamMembers,
      } : null,
      event: event ? {
        title: event.title,
        date: event.date,
        venue: event.venue,
        time: event.time,
        pricingType: event.pricingType,
        price: event.price,
        priceType: event.priceType,
        participationType: event.participationType,
      } : null,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/payments/my — Get current user's payments
router.get('/my', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payments = await Payment.find({
      payerEmail: req.user?.email,
    })
      .populate('eventId', 'title date venue category poster')
      .sort('-createdAt');

    res.json({ success: true, data: payments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/payments/event/:eventId — Get all payments for an event (organizer/admin)
router.get('/event/:eventId', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payments = await Payment.find({
      eventId: req.params.eventId,
      status: 'completed',
    }).sort('-paidAt');

    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      data: payments,
      summary: {
        totalPayments: payments.length,
        totalCollected,
        currency: 'INR',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
