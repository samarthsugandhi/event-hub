import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from './config/database';
import User from './models/User';
import Event from './models/Event';
import Registration from './models/Registration';
import Notification from './models/Notification';
import Bookmark from './models/Bookmark';
import Payment from './models/Payment';
import { generateQRCode } from './services/qrcode';
import { v4 as uuidv4 } from 'uuid';

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Registration.deleteMany({}),
      Notification.deleteMany({}),
      Bookmark.deleteMany({}),
      Payment.deleteMany({}),
    ]);

    console.log('🗑️  Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@becvortex.com',
      password: 'admin123',
      role: 'admin',
      department: 'Administration',
    });

    const organizer = await User.create({
      name: 'Dr. Priya Sharma',
      email: 'priya@becvortex.com',
      password: 'organizer123',
      role: 'organizer',
      department: 'Computer Science',
    });

    const organizer2 = await User.create({
      name: 'Prof. Rajesh Kumar',
      email: 'rajesh@becvortex.com',
      password: 'organizer123',
      role: 'organizer',
      department: 'Electronics',
    });

    const students = await User.create([
      {
        name: 'Ananya Patel',
        email: 'ananya@student.bec.edu',
        password: 'student123',
        role: 'student',
        department: 'Computer Science',
        year: '3rd',
        usn: '2BA22CS001',
      },
      {
        name: 'Arjun Reddy',
        email: 'arjun@student.bec.edu',
        password: 'student123',
        role: 'student',
        department: 'Electronics',
        year: '2nd',
        usn: '2BA23EC015',
      },
      {
        name: 'Meera Nair',
        email: 'meera@student.bec.edu',
        password: 'student123',
        role: 'student',
        department: 'Mechanical',
        year: '4th',
        usn: '2BA21ME042',
      },
      {
        name: 'Rohan Patil',
        email: 'rohan@student.bec.edu',
        password: 'student123',
        role: 'student',
        department: 'Information Science',
        year: '1st',
        usn: '2025010590',
      },
    ]);

    console.log('👤 Created users');

    // BEC Bagalkote campus area coordinates (5MC5+WV4 / 5MC5+XHP, Vidayagiri, Bagalkote)
    const BEC_LAT = 16.1842;
    const BEC_LNG = 75.6562;

    const campusOffset = (latOffset: number, lngOffset: number) => ({
      lat: BEC_LAT + latOffset,
      lng: BEC_LNG + lngOffset,
    });

    // Create events
    const now = new Date();
    const events = await Event.create([
      // ========== WAVE Hackathon 3.0 — FULLY BOOKED ==========
      {
        title: 'WAVE Hackathon 3.0',
        description: `🌊 WAVE Hackathon 3.0 — The Ultimate Innovation Challenge!

A 24-hour offline hackathon at Basaveshwar Engineering College, Bagalkote. Teams of 2-4 members compete across 10 exciting themes to build innovative solutions.

🏆 Prize Pool: ₹50,000
• 1st Place: ₹25,000
• 2nd Place: ₹15,000
• 3rd Place: ₹10,000

📋 Themes:
1. Healthcare Innovation
2. Smart Cities & Infrastructure
3. AgriTech Solutions
4. FinTech & Digital Payments
5. Robotics & Drones
6. Cybersecurity & Privacy
7. EdTech & E-Learning
8. E-Commerce & Logistics
9. GenAI & Agentic AI
10. Open Innovation (Build Anything!)

🎓 All participants receive participation certificates.
🍕 Meals and refreshments provided throughout the event.
👨‍💻 Industry mentors will guide teams during the hackathon.

⚠️ SEATS FULLY BOOKED — No new registrations accepted.
Visit https://wave3-0.netlify.app/ for more details.`,
        category: 'hackathon',
        poster: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80',
        date: new Date('2026-03-13T09:00:00+05:30'),
        endDate: new Date('2026-03-14T18:00:00+05:30'),
        time: '09:00 AM',
        endTime: '06:00 PM',
        venue: 'Main Auditorium & CS Labs, BEC Bagalkote',
        locationCoordinates: campusOffset(0.00005, -0.00004),
        organizerName: 'WAVE Team - BEC',
        organizerDepartment: 'Computer Science & Information Science',
        organizerEmail: 'wave@becbgk.edu',
        registrationType: 'external',
        externalLink: 'https://wave3-0.netlify.app/',
        maxParticipants: 200,
        registrationDeadline: new Date('2026-03-10T23:59:59+05:30'),
        registrationCount: 200,
        attendanceCount: 0,
        views: 1250,
        createdBy: organizer._id,
        status: 'published',
        featured: true,
        tags: ['Hackathon', 'WAVE', 'GenAI', 'Innovation', 'Prize Pool', 'BEC Bagalkote'],
        pricingType: 'paid',
        price: 500,
        priceType: 'per_team',
        participationType: 'team',
        minTeamSize: 2,
        maxTeamSize: 4,
      },
      // ========== Regular Events ==========
      {
        title: 'AI & Machine Learning Workshop',
        description:
          'An intensive hands-on workshop on artificial intelligence and machine learning fundamentals. Learn about neural networks, deep learning frameworks, and real-world AI applications. This workshop features live coding sessions, interactive demos, and expert-led discussions on the latest trends in AI research. Perfect for beginners and intermediate developers looking to upskill.',
        category: 'workshop',
        poster: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1400&q=80',
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
        time: '09:00 AM',
        endTime: '03:00 PM',
        venue: 'Seminar Hall A, CS Block, BEC',
        locationCoordinates: campusOffset(0.00018, 0.00006),
        organizerName: 'Dr. Priya Sharma',
        organizerDepartment: 'Computer Science',
        organizerEmail: 'priya@becvortex.com',
        registrationType: 'internal',
        maxParticipants: 150,
        registrationDeadline: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        registrationCount: 120,
        attendanceCount: 0,
        views: 340,
        createdBy: organizer._id,
        status: 'published',
        featured: true,
        tags: ['AI', 'Machine Learning', 'Python', 'TensorFlow'],
        pricingType: 'paid',
        price: 200,
        priceType: 'per_person',
        participationType: 'individual',
      },
      {
        title: 'CodeStorm Hackathon 2026',
        description:
          'The biggest 24-hour hackathon on campus! Form teams of 3-4, solve real-world problems, and compete for exciting prizes. Categories include Web Dev, AI/ML, IoT, and Blockchain. Mentors from top tech companies will be available throughout the event. Meals and refreshments provided.',
        category: 'hackathon',
        poster: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80',
        date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        time: '10:00 AM',
        endTime: '10:00 AM',
        venue: 'Main Auditorium, BEC',
        locationCoordinates: campusOffset(0.00026, -0.00012),
        organizerName: 'Prof. Rajesh Kumar',
        organizerDepartment: 'Computer Science',
        organizerEmail: 'rajesh@becvortex.com',
        registrationType: 'internal',
        maxParticipants: 200,
        registrationDeadline: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
        registrationCount: 178,
        attendanceCount: 0,
        views: 520,
        createdBy: organizer2._id,
        status: 'published',
        featured: true,
        tags: ['Hackathon', 'Coding', 'Innovation', 'Competition'],
        pricingType: 'paid',
        price: 300,
        priceType: 'per_team',
        participationType: 'team',
        minTeamSize: 3,
        maxTeamSize: 4,
      },
      {
        title: 'Cybersecurity Masterclass',
        description:
          'Learn about the latest cybersecurity threats and defense mechanisms. This technical seminar covers ethical hacking, network security, cryptography, and security best practices for modern applications. Featuring live demonstrations of common attack vectors and hands-on defense exercises.',
        category: 'technical',
        date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        time: '02:00 PM',
        endTime: '06:00 PM',
        venue: 'Lab 301, IT Block, BEC',
        locationCoordinates: campusOffset(-0.00012, 0.00016),
        organizerName: 'Dr. Priya Sharma',
        organizerDepartment: 'Computer Science',
        organizerEmail: 'priya@becvortex.com',
        registrationType: 'internal',
        maxParticipants: 80,
        registrationDeadline: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        registrationCount: 72,
        attendanceCount: 0,
        views: 210,
        createdBy: organizer._id,
        status: 'published',
        featured: false,
        tags: ['Cybersecurity', 'Ethical Hacking', 'Network Security'],
      },
      {
        title: 'Cultural Fest - Rhythms 2026',
        description:
          'The annual cultural extravaganza featuring dance, music, drama, and art competitions. Join us for two days of creativity, talent, and unforgettable performances. Open to all departments. Special guest performances by renowned artists.',
        category: 'cultural',
        poster: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80',
        date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000),
        time: '10:00 AM',
        endTime: '09:00 PM',
        venue: 'Open Air Theatre, BEC Campus',
        locationCoordinates: campusOffset(0.00036, 0.00022),
        organizerName: 'Cultural Committee',
        organizerDepartment: 'Student Affairs',
        organizerEmail: 'cultural@becvortex.com',
        registrationType: 'internal',
        maxParticipants: 500,
        registrationDeadline: new Date(now.getTime() + 19 * 24 * 60 * 60 * 1000),
        registrationCount: 320,
        attendanceCount: 0,
        views: 890,
        createdBy: admin._id,
        status: 'published',
        featured: true,
        tags: ['Cultural', 'Dance', 'Music', 'Art'],
      },
      {
        title: 'Inter-Department Cricket Tournament',
        description:
          'The annual inter-department cricket tournament is here! Form your department team and compete for the championship trophy. T20 format, knockout rounds. Exciting prizes for winners and runners-up.',
        category: 'sports',
        date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
        time: '08:00 AM',
        endTime: '06:00 PM',
        venue: 'BEC Cricket Ground, Vidayagiri',
        locationCoordinates: campusOffset(0.00042, -0.00024),
        organizerName: 'Sports Committee',
        organizerDepartment: 'Physical Education',
        organizerEmail: 'sports@becvortex.com',
        registrationType: 'internal',
        maxParticipants: 120,
        registrationDeadline: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        registrationCount: 96,
        attendanceCount: 0,
        views: 175,
        createdBy: admin._id,
        status: 'published',
        featured: false,
        tags: ['Sports', 'Cricket', 'Tournament'],
        pricingType: 'free',
        participationType: 'team',
        minTeamSize: 11,
        maxTeamSize: 15,
      },
      {
        title: 'Entrepreneurship Summit',
        description:
          'A seminar series featuring successful entrepreneurs sharing their journeys, lessons learned, and tips for aspiring business founders. Includes panel discussions, networking sessions, and a startup pitch competition.',
        category: 'seminar',
        date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
        time: '11:00 AM',
        endTime: '04:00 PM',
        venue: 'Conference Room, Admin Block, BEC',
        locationCoordinates: campusOffset(-0.0002, -0.00008),
        organizerName: 'Prof. Rajesh Kumar',
        organizerDepartment: 'Electronics',
        organizerEmail: 'rajesh@becvortex.com',
        registrationType: 'internal',
        maxParticipants: 100,
        registrationDeadline: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        registrationCount: 85,
        attendanceCount: 0,
        views: 155,
        createdBy: organizer2._id,
        status: 'published',
        featured: false,
        tags: ['Entrepreneurship', 'Business', 'Startup'],
      },
      {
        title: 'Web Development Bootcamp',
        description:
          'A comprehensive 2-day bootcamp covering full-stack web development with React, Node.js, and MongoDB. Build a real project from scratch. Perfect for beginners who want to kickstart their web development journey.',
        category: 'workshop',
        date: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 19 * 24 * 60 * 60 * 1000),
        time: '09:00 AM',
        endTime: '05:00 PM',
        venue: 'Computer Lab 1, CS Block, BEC',
        locationCoordinates: campusOffset(0.0001, 0.00012),
        organizerName: 'Dr. Priya Sharma',
        organizerDepartment: 'Computer Science',
        organizerEmail: 'priya@becvortex.com',
        registrationType: 'internal',
        maxParticipants: 60,
        registrationDeadline: new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000),
        registrationCount: 55,
        attendanceCount: 0,
        views: 230,
        createdBy: organizer._id,
        status: 'published',
        featured: false,
        tags: ['Web Development', 'React', 'Node.js', 'Full Stack'],
        pricingType: 'paid',
        price: 150,
        priceType: 'per_person',
        participationType: 'individual',
      },
      {
        title: 'IoT Innovation Challenge',
        description:
          'Design and prototype innovative IoT solutions for smart campus applications. Arduino and Raspberry Pi kits provided. Mentors from the Electronics department will guide each team.',
        category: 'technical',
        date: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
        time: '10:00 AM',
        endTime: '06:00 PM',
        venue: 'Innovation Lab, EC Block, BEC',
        locationCoordinates: campusOffset(-0.00018, 0.00019),
        organizerName: 'Prof. Rajesh Kumar',
        organizerDepartment: 'Electronics',
        organizerEmail: 'rajesh@becvortex.com',
        registrationType: 'external',
        externalLink: 'https://forms.google.com/iot-challenge-2026',
        maxParticipants: 80,
        registrationDeadline: new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000),
        registrationCount: 45,
        attendanceCount: 0,
        views: 120,
        createdBy: organizer2._id,
        status: 'published',
        featured: false,
        tags: ['IoT', 'Arduino', 'Raspberry Pi', 'Innovation'],
      },
      // Pending event for admin review demo
      {
        title: 'Data Science with Python',
        description:
          'Learn data analysis, visualization, and machine learning with Python. Topics include Pandas, NumPy, Matplotlib, Scikit-learn, and real-world data projects.',
        category: 'workshop',
        date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        time: '10:00 AM',
        venue: 'Lab 201, CS Block, BEC',
        locationCoordinates: campusOffset(0.00014, -0.00006),
        organizerName: 'Dr. Priya Sharma',
        organizerDepartment: 'Computer Science',
        organizerEmail: 'priya@becvortex.com',
        registrationType: 'internal',
        maxParticipants: 50,
        registrationDeadline: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
        registrationCount: 0,
        views: 18,
        createdBy: organizer._id,
        status: 'pending',
        tags: ['Data Science', 'Python', 'Analytics'],
      },
      // Live event (happening now)
      {
        title: 'Cloud Computing Seminar',
        description:
          'Exploring AWS, Azure, and GCP services for modern application deployment. Live demos included.',
        category: 'seminar',
        poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80',
        date: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 3 * 60 * 60 * 1000),
        time: new Date(now.getTime() - 1 * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        endTime: new Date(now.getTime() + 3 * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        venue: 'Seminar Hall B, BEC',
        locationCoordinates: campusOffset(-0.00006, 0.00008),
        organizerName: 'Prof. Rajesh Kumar',
        organizerDepartment: 'Computer Science',
        organizerEmail: 'rajesh@becvortex.com',
        registrationType: 'internal',
        maxParticipants: 100,
        registrationDeadline: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        registrationCount: 88,
        attendanceCount: 72,
        views: 310,
        createdBy: organizer2._id,
        status: 'published',
        featured: false,
        tags: ['Cloud', 'AWS', 'Azure', 'DevOps'],
      },
      // Randomized yearly events (2026 → 2027)
      {
        title: 'Quantum Code Sprint 2026',
        description:
          'A rapid coding sprint focused on quantum-inspired algorithms, optimization, and practical simulations. Includes mini challenges and mentor feedback rounds.',
        category: 'technical',
        poster: 'https://picsum.photos/id/11/1400/800',
        date: new Date('2026-05-07T10:00:00+05:30'),
        endDate: new Date('2026-05-07T17:00:00+05:30'),
        time: '10:00 AM',
        endTime: '05:00 PM',
        venue: 'Innovation Lab, CS Block, BEC',
        locationCoordinates: campusOffset(0.00016, -0.00014),
        organizerName: 'Dr. Priya Sharma',
        organizerDepartment: 'Computer Science',
        organizerEmail: 'priya@becvortex.com',
        registrationType: 'internal',
        maxParticipants: 90,
        registrationDeadline: new Date('2026-05-05T23:59:59+05:30'),
        registrationCount: 63,
        attendanceCount: 0,
        views: 245,
        createdBy: organizer._id,
        status: 'published',
        featured: false,
        tags: ['Quantum', 'Algorithms', 'Coding Sprint'],
      },
      {
        title: 'Design Thinking Jam 2026',
        description:
          'Collaborative design-thinking event where teams ideate, prototype, and validate solutions for student life challenges on campus.',
        category: 'workshop',
        poster: 'https://picsum.photos/id/21/1400/800',
        date: new Date('2026-06-12T09:30:00+05:30'),
        endDate: new Date('2026-06-12T16:30:00+05:30'),
        time: '09:30 AM',
        endTime: '04:30 PM',
        venue: 'Seminar Hall A, BEC',
        locationCoordinates: campusOffset(0.00028, 0.00005),
        organizerName: 'Prof. Rajesh Kumar',
        organizerDepartment: 'Electronics',
        organizerEmail: 'rajesh@becvortex.com',
        registrationType: 'internal',
        maxParticipants: 120,
        registrationDeadline: new Date('2026-06-10T23:59:59+05:30'),
        registrationCount: 84,
        attendanceCount: 0,
        views: 311,
        createdBy: organizer2._id,
        status: 'published',
        featured: true,
        tags: ['Design Thinking', 'Innovation', 'Prototype'],
      },
      {
        title: 'Campus Music Sunset 2026',
        description:
          'An open-air evening with student bands, acoustic sessions, and collaborative performances. Food stalls and art corners included.',
        category: 'cultural',
        poster: 'https://picsum.photos/id/29/1400/800',
        date: new Date('2026-07-19T05:30:00+05:30'),
        endDate: new Date('2026-07-19T10:00:00+05:30'),
        time: '05:30 PM',
        endTime: '10:00 PM',
        venue: 'Open Air Theatre, BEC Campus',
        locationCoordinates: campusOffset(0.00034, 0.00026),
        organizerName: 'Cultural Committee',
        organizerDepartment: 'Student Affairs',
        organizerEmail: 'cultural@becvortex.com',
        registrationType: 'internal',
        maxParticipants: 450,
        registrationDeadline: new Date('2026-07-17T23:59:59+05:30'),
        registrationCount: 286,
        attendanceCount: 0,
        views: 502,
        createdBy: admin._id,
        status: 'published',
        featured: true,
        tags: ['Music', 'Cultural', 'Live Performance'],
      },
      {
        title: 'Inter-College Esports Arena',
        description:
          'Competitive esports tournament featuring strategy and team-based titles. Brackets, casting, and finals on a live stage setup.',
        category: 'sports',
        poster: 'https://picsum.photos/id/33/1400/800',
        date: new Date('2026-08-23T09:00:00+05:30'),
        endDate: new Date('2026-08-24T20:00:00+05:30'),
        time: '09:00 AM',
        endTime: '08:00 PM',
        venue: 'Main Auditorium, BEC',
        locationCoordinates: campusOffset(0.00009, 0.00021),
        organizerName: 'Sports Committee',
        organizerDepartment: 'Physical Education',
        organizerEmail: 'sports@becvortex.com',
        registrationType: 'external',
        externalLink: 'https://forms.google.com/esports-arena-bec',
        maxParticipants: 220,
        registrationDeadline: new Date('2026-08-20T23:59:59+05:30'),
        registrationCount: 168,
        attendanceCount: 0,
        views: 640,
        createdBy: admin._id,
        status: 'published',
        featured: false,
        tags: ['Esports', 'Gaming', 'Tournament'],
        pricingType: 'paid',
        price: 250,
        priceType: 'per_team',
        participationType: 'team',
        minTeamSize: 3,
        maxTeamSize: 5,
      },
      {
        title: 'Future of Robotics Expo',
        description:
          'Hands-on robotics showcase with live demos, autonomous bot challenges, and technical talks from industry guests.',
        category: 'conference',
        poster: 'https://picsum.photos/id/48/1400/800',
        date: new Date('2026-09-11T10:00:00+05:30'),
        endDate: new Date('2026-09-11T18:00:00+05:30'),
        time: '10:00 AM',
        endTime: '06:00 PM',
        venue: 'ECE Auditorium, BEC',
        locationCoordinates: campusOffset(-0.00016, 0.00025),
        organizerName: 'Prof. Rajesh Kumar',
        organizerDepartment: 'Electronics',
        organizerEmail: 'rajesh@becvortex.com',
        registrationType: 'internal',
        maxParticipants: 140,
        registrationDeadline: new Date('2026-09-08T23:59:59+05:30'),
        registrationCount: 91,
        attendanceCount: 0,
        views: 376,
        createdBy: organizer2._id,
        status: 'published',
        featured: false,
        tags: ['Robotics', 'Expo', 'Autonomous Systems'],
      },
      {
        title: 'Startup Pitch Night 2026',
        description:
          'Student founders present startup ideas to a panel of mentors and investors. Feedback, networking, and funding opportunities included.',
        category: 'seminar',
        poster: 'https://picsum.photos/id/57/1400/800',
        date: new Date('2026-10-16T04:00:00+05:30'),
        endDate: new Date('2026-10-16T09:00:00+05:30'),
        time: '04:00 PM',
        endTime: '09:00 PM',
        venue: 'Conference Room, Admin Block, BEC',
        locationCoordinates: campusOffset(-0.00018, -0.00009),
        organizerName: 'Innovation Cell',
        organizerDepartment: 'Entrepreneurship',
        organizerEmail: 'innovation@becvortex.com',
        registrationType: 'internal',
        maxParticipants: 130,
        registrationDeadline: new Date('2026-10-13T23:59:59+05:30'),
        registrationCount: 105,
        attendanceCount: 0,
        views: 458,
        createdBy: admin._id,
        status: 'published',
        featured: true,
        tags: ['Startup', 'Pitch', 'Entrepreneurship'],
      },
      {
        title: 'Open Source Contribution Day',
        description:
          'A full-day contribution event to help students make their first open-source pull request with maintainers and mentors on-site.',
        category: 'technical',
        poster: 'https://picsum.photos/id/64/1400/800',
        date: new Date('2026-11-21T09:00:00+05:30'),
        endDate: new Date('2026-11-21T18:00:00+05:30'),
        time: '09:00 AM',
        endTime: '06:00 PM',
        venue: 'Lab 302, CS Block, BEC',
        locationCoordinates: campusOffset(0.0001, 0.00016),
        organizerName: 'Dr. Priya Sharma',
        organizerDepartment: 'Computer Science',
        organizerEmail: 'priya@becvortex.com',
        registrationType: 'internal',
        maxParticipants: 100,
        registrationDeadline: new Date('2026-11-18T23:59:59+05:30'),
        registrationCount: 77,
        attendanceCount: 0,
        views: 289,
        createdBy: organizer._id,
        status: 'published',
        featured: false,
        tags: ['Open Source', 'GitHub', 'Mentorship'],
      },
      {
        title: 'Winter Data Viz Marathon',
        description:
          'Create impactful data visualizations from real civic datasets. Teams will present dashboards and storytelling insights.',
        category: 'workshop',
        poster: 'https://picsum.photos/id/75/1400/800',
        date: new Date('2026-12-13T10:00:00+05:30'),
        endDate: new Date('2026-12-13T17:30:00+05:30'),
        time: '10:00 AM',
        endTime: '05:30 PM',
        venue: 'Data Lab, IS Block, BEC',
        locationCoordinates: campusOffset(0.0002, -0.00004),
        organizerName: 'Data Science Club',
        organizerDepartment: 'Information Science',
        organizerEmail: 'datascience@becvortex.com',
        registrationType: 'internal',
        maxParticipants: 110,
        registrationDeadline: new Date('2026-12-10T23:59:59+05:30'),
        registrationCount: 88,
        attendanceCount: 0,
        views: 334,
        createdBy: organizer._id,
        status: 'published',
        featured: false,
        tags: ['Data Visualization', 'Dashboard', 'Analytics'],
      },
      {
        title: 'New Year Innovation Meetup 2027',
        description:
          'Kickoff meetup for 2027 with lightning talks, tech demos, and collaboration opportunities across departments.',
        category: 'conference',
        poster: 'https://picsum.photos/id/83/1400/800',
        date: new Date('2027-01-09T11:00:00+05:30'),
        endDate: new Date('2027-01-09T16:00:00+05:30'),
        time: '11:00 AM',
        endTime: '04:00 PM',
        venue: 'Main Auditorium, BEC',
        locationCoordinates: campusOffset(0.00022, -0.00012),
        organizerName: 'Admin User',
        organizerDepartment: 'Administration',
        organizerEmail: 'admin@becvortex.com',
        registrationType: 'internal',
        maxParticipants: 250,
        registrationDeadline: new Date('2027-01-06T23:59:59+05:30'),
        registrationCount: 172,
        attendanceCount: 0,
        views: 702,
        createdBy: admin._id,
        status: 'published',
        featured: true,
        tags: ['Innovation', 'Meetup', 'Networking'],
      },
      {
        title: 'Women in Tech Leadership Forum',
        description:
          'Forum focused on leadership journeys, mentoring, and inclusive growth in technology domains with industry speakers.',
        category: 'seminar',
        poster: 'https://picsum.photos/id/91/1400/800',
        date: new Date('2027-02-18T02:00:00+05:30'),
        endDate: new Date('2027-02-18T07:00:00+05:30'),
        time: '02:00 PM',
        endTime: '07:00 PM',
        venue: 'Seminar Hall C, BEC',
        locationCoordinates: campusOffset(-0.00012, 0.00011),
        organizerName: 'Women Tech Council',
        organizerDepartment: 'Student Affairs',
        organizerEmail: 'wtc@becvortex.com',
        registrationType: 'internal',
        maxParticipants: 160,
        registrationDeadline: new Date('2027-02-15T23:59:59+05:30'),
        registrationCount: 121,
        attendanceCount: 0,
        views: 498,
        createdBy: admin._id,
        status: 'published',
        featured: false,
        tags: ['Leadership', 'Women in Tech', 'Mentorship'],
      },
      {
        title: 'Spring AI Product Hack 2027',
        description:
          'Build practical AI-powered products with rapid prototyping and product pitching in team format.',
        category: 'hackathon',
        poster: 'https://picsum.photos/id/102/1400/800',
        date: new Date('2027-03-20T09:00:00+05:30'),
        endDate: new Date('2027-03-21T17:00:00+05:30'),
        time: '09:00 AM',
        endTime: '05:00 PM',
        venue: 'CS Labs + Auditorium, BEC',
        locationCoordinates: campusOffset(0.00024, 0.00017),
        organizerName: 'Dr. Priya Sharma',
        organizerDepartment: 'Computer Science',
        organizerEmail: 'priya@becvortex.com',
        registrationType: 'internal',
        maxParticipants: 180,
        registrationDeadline: new Date('2027-03-16T23:59:59+05:30'),
        registrationCount: 144,
        attendanceCount: 0,
        views: 812,
        createdBy: organizer._id,
        status: 'published',
        featured: true,
        tags: ['AI', 'Hackathon', 'Product'],
        pricingType: 'paid',
        price: 350,
        priceType: 'per_team',
        participationType: 'team',
        minTeamSize: 2,
        maxTeamSize: 4,
      },
      // Additional live event (happening now)
      {
        title: 'Live UX Review Studio',
        description:
          'A real-time product critique session with UI/UX mentors reviewing student projects and giving actionable feedback.',
        category: 'workshop',
        poster: 'https://picsum.photos/id/119/1400/800',
        date: new Date(now.getTime() - 45 * 60 * 1000),
        endDate: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        time: new Date(now.getTime() - 45 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        endTime: new Date(now.getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        venue: 'Design Lab, IS Block, BEC',
        locationCoordinates: campusOffset(0.0001, 0.00016),
        organizerName: 'Design Club',
        organizerDepartment: 'Information Science',
        organizerEmail: 'designclub@becvortex.com',
        registrationType: 'internal',
        maxParticipants: 80,
        registrationDeadline: new Date(now.getTime() - 60 * 60 * 1000),
        registrationCount: 72,
        attendanceCount: 49,
        views: 265,
        createdBy: organizer._id,
        status: 'published',
        featured: false,
        tags: ['UX', 'Live Review', 'Design'],
      },
    ]);

    console.log(`📅 Created ${events.length} events (including WAVE Hackathon 3.0)`);
    console.log('   Slugs generated automatically from titles');

    // Set registrationOpen=true for all published events
    await Event.updateMany({ status: 'published' }, { registrationOpen: true });
    console.log('✅ Registration opened for all published events');

    // Create some bookmarks for demo student
    const student1 = students[0]; // Ananya Patel
    await Bookmark.create([
      { userId: student1._id, eventId: events[1]._id }, // AI Workshop
      { userId: student1._id, eventId: events[2]._id }, // CodeStorm Hackathon
      { userId: student1._id, eventId: events[4]._id }, // Cultural Fest
    ]);
    console.log('🔖 Created sample bookmarks');

    // Create sample registrations for AI Workshop
    const aiWorkshop = events[1]; // index 1 since WAVE is index 0

    // Create a personal registration for the demo student (Ananya)
    const ananyaRegId = `BV-${uuidv4().slice(0, 8).toUpperCase()}`;
    const ananyaQrData = JSON.stringify({
      registrationId: ananyaRegId,
      eventId: aiWorkshop._id,
      name: student1.name,
      email: student1.email,
    });
    const ananyaQrCode = await generateQRCode(ananyaQrData);
    await Registration.create({
      registrationId: ananyaRegId,
      eventId: aiWorkshop._id,
      name: student1.name,
      email: student1.email,
      phone: '9876500001',
      department: student1.department,
      year: '3rd',
      usn: '2BA22CS001',
      qrCode: ananyaQrCode,
      attendanceStatus: 'registered',
      paymentStatus: 'completed',
      paymentAmount: 200,
    });

    // Create a payment record for Ananya's registration
    const ananyaPaymentId = `PAY-${uuidv4().slice(0, 12).toUpperCase()}`;
    await Payment.create({
      paymentId: ananyaPaymentId,
      registrationId: ananyaRegId,
      eventId: aiWorkshop._id,
      amount: 200,
      currency: 'INR',
      payerName: student1.name,
      payerEmail: student1.email,
      method: 'upi',
      status: 'completed',
      transactionId: `TXN${Date.now()}DEMO1`,
      paidAt: new Date(),
    });

    console.log(`🎫 Created Ananya's registration (${ananyaRegId}) — Payment: ₹200 PAID`);

    const sampleNames = [
      'Aarav Singh', 'Diya Gupta', 'Vihaan Sharma', 'Saanvi Patel', 'Reyansh Kumar',
      'Aanya Reddy', 'Arjun Nair', 'Isha Mehta', 'Kabir Joshi', 'Priya Verma',
    ];
    const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Science'];
    const branchCodes = ['CS', 'EC', 'ME', 'CV', 'IS'];

    for (let i = 0; i < sampleNames.length; i++) {
      const registrationId = `BV-${uuidv4().slice(0, 8).toUpperCase()}`;
      const qrData = JSON.stringify({
        registrationId,
        eventId: aiWorkshop._id,
        name: sampleNames[i],
        email: `${sampleNames[i].toLowerCase().replace(' ', '.')}@student.bec.edu`,
      });
      const qrCode = await generateQRCode(qrData);

      await Registration.create({
        registrationId,
        eventId: aiWorkshop._id,
        name: sampleNames[i],
        email: `${sampleNames[i].toLowerCase().replace(' ', '.')}@student.bec.edu`,
        phone: `98765${String(i).padStart(5, '0')}`,
        department: departments[i % departments.length],
        year: `${(i % 4) + 1}${['st', 'nd', 'rd', 'th'][(i % 4)]}`,
        usn: `2BA2${(i % 4) + 1}${branchCodes[i % branchCodes.length]}${String(i + 1).padStart(3, '0')}`,
        qrCode,
        attendanceStatus: i < 7 ? 'present' : 'registered',
        checkedInAt: i < 7 ? new Date() : undefined,
        paymentStatus: 'completed',
        paymentAmount: 200,
      });

      // Create payment records for each
      await Payment.create({
        paymentId: `PAY-${uuidv4().slice(0, 12).toUpperCase()}`,
        registrationId,
        eventId: aiWorkshop._id,
        amount: 200,
        currency: 'INR',
        payerName: sampleNames[i],
        payerEmail: `${sampleNames[i].toLowerCase().replace(' ', '.')}@student.bec.edu`,
        method: i % 2 === 0 ? 'upi' : 'card',
        status: 'completed',
        transactionId: `TXN${Date.now()}DEMO${i + 2}`,
        paidAt: new Date(now.getTime() - (10 - i) * 24 * 60 * 60 * 1000),
      });
    }

    console.log('📝 Created sample registrations with payment records');

    // ——— Additional registrations across OTHER events for a rich demo ———
    const codeStorm = events[2]; // CodeStorm Hackathon (team event)
    const cyberMaster = events[3]; // Cybersecurity Masterclass
    const culturalFest = events[4]; // Cultural Fest
    const entrepreneurship = events[7]; // Entrepreneurship Summit
    const cloudSeminar = events[10]; // Cloud Computing (live)

    // Register Ananya for CodeStorm (team)
    const csRegId = `BV-${uuidv4().slice(0, 8).toUpperCase()}`;
    await Registration.create({
      registrationId: csRegId,
      eventId: codeStorm._id,
      name: student1.name,
      email: student1.email,
      phone: '9876500001',
      department: student1.department,
      year: '3rd',
      usn: '2BA22CS001',
      teamName: 'Code Crusaders',
      teamMembers: [
        { name: 'Arjun Reddy', usn: '2BA23EC015' },
        { name: 'Meera Nair', usn: '2BA21ME042' },
      ],
      qrCode: await generateQRCode(JSON.stringify({ registrationId: csRegId, eventId: codeStorm._id, name: student1.name })),
      attendanceStatus: 'registered',
      paymentStatus: 'completed',
      paymentAmount: 300,
    });

    // Register a few students for Cybersecurity Masterclass
    for (let i = 0; i < 5; i++) {
      const rid = `BV-${uuidv4().slice(0, 8).toUpperCase()}`;
      await Registration.create({
        registrationId: rid,
        eventId: cyberMaster._id,
        name: sampleNames[i],
        email: `${sampleNames[i].toLowerCase().replace(' ', '.')}@student.bec.edu`,
        phone: `98765${String(50 + i).padStart(5, '0')}`,
        department: departments[i % departments.length],
        year: `${(i % 4) + 1}${['st', 'nd', 'rd', 'th'][i % 4]}`,
        usn: `2BA2${(i % 4) + 1}${branchCodes[i % branchCodes.length]}${String(50 + i).padStart(3, '0')}`,
        qrCode: await generateQRCode(JSON.stringify({ registrationId: rid, eventId: cyberMaster._id, name: sampleNames[i] })),
        attendanceStatus: i < 3 ? 'present' : 'registered',
        checkedInAt: i < 3 ? new Date() : undefined,
      });
    }

    // Register Ananya for Cloud Seminar (live event — already checked in)
    const cloudRegId = `BV-${uuidv4().slice(0, 8).toUpperCase()}`;
    await Registration.create({
      registrationId: cloudRegId,
      eventId: cloudSeminar._id,
      name: student1.name,
      email: student1.email,
      phone: '9876500001',
      department: student1.department,
      year: '3rd',
      usn: '2BA22CS001',
      qrCode: await generateQRCode(JSON.stringify({ registrationId: cloudRegId, eventId: cloudSeminar._id, name: student1.name })),
      attendanceStatus: 'present',
      checkedInAt: new Date(),
    });

    console.log('📝 Created rich cross-event registrations for demo');

    // Create notifications
    await Notification.create([
      {
        title: '🌊 WAVE Hackathon 3.0 — Fully Booked!',
        message: 'WAVE Hackathon 3.0 is fully booked! 200/200 seats taken. Stay tuned for the next wave!',
        type: 'event_published',
        eventId: events[0]._id,
      },
      {
        title: 'New Event Published',
        message: 'AI & Machine Learning Workshop is now open for registration!',
        type: 'event_published',
        eventId: events[1]._id,
      },
      {
        title: 'Registration Closing Soon',
        message: 'Only 2 days left to register for Cybersecurity Masterclass!',
        type: 'registration_closing',
        eventId: events[3]._id,
      },
      {
        title: 'Event Starting Soon',
        message: 'Cloud Computing Seminar starts in 1 hour. Get ready!',
        type: 'event_starting',
        eventId: events[10]._id,
      },
    ]);

    console.log('🔔 Created notifications');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('── Architecture: 100% Local (No External APIs) ──');
    console.log('   Database:  MongoDB Atlas (your DB)');
    console.log('   QR Codes:  qrcode npm (local)');
    console.log('   Charts:    Chart.js (local)');
    console.log('   Maps:      Leaflet + OpenStreetMap (free, no API key)');
    console.log('   Auth:      JWT (local)');
    console.log('   Email:     Optional (SMTP) — QR pass shown on-screen');
    console.log('');
    console.log('📧 Login Credentials:');
    console.log('   Admin:     admin@becvortex.com / admin123');
    console.log('   Organizer: priya@becvortex.com / organizer123');
    console.log('   Organizer: rajesh@becvortex.com / organizer123');
    console.log('   Student:   ananya@student.bec.edu / student123');
    console.log('   Student:   arjun@student.bec.edu / student123');
    console.log('');
    console.log('🌊 WAVE Hackathon 3.0 — FULLY BOOKED (200/200)');
    console.log('   External: https://wave3-0.netlify.app/');
    console.log('');
    console.log('💳 Payment Prototype:');
    console.log('   AI Workshop (₹200/person) — Ananya\'s payment is completed');
    console.log('   CodeStorm Hackathon (₹300/team) — Code Crusaders registered');
    console.log('   Register for any paid event to test the payment flow');
    console.log('');
    console.log('📊 Demo Data Summary:');
    console.log(`   ${events.length} events (multiple live + pending + external + upcoming)`);
    console.log('   20+ registrations across multiple events');
    console.log('   Payment records, bookmarks, notifications pre-loaded');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
