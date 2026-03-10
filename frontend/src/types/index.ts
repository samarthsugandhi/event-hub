export type EventCategory =
  | 'technical'
  | 'workshop'
  | 'cultural'
  | 'sports'
  | 'seminar'
  | 'hackathon'
  | 'webinar'
  | 'conference'
  | 'other';

export type EventStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'cancelled'
  | 'completed';

export type RegistrationType = 'internal' | 'external';
export type PricingType = 'free' | 'paid';
export type PriceType = 'per_person' | 'per_team';
export type ParticipationType = 'individual' | 'team';
export type AttendanceStatus = 'registered' | 'present' | 'absent';
export type PaymentStatus = 'not_required' | 'pending' | 'completed' | 'failed';
export type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet';
export type UserRole = 'admin' | 'organizer' | 'student' | 'faculty' | 'visitor';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  year?: string;
  usn?: string;
  role: UserRole;
  avatar?: string;
}

export interface Event {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: EventCategory;
  poster?: string;
  date: string;
  endDate?: string;
  time: string;
  endTime?: string;
  venue: string;
  locationCoordinates?: {
    lat: number;
    lng: number;
  };
  organizerName: string;
  organizerDepartment: string;
  organizerEmail: string;
  registrationType: RegistrationType;
  externalLink?: string;
  maxParticipants: number;
  registrationDeadline: string;
  registrationCount: number;
  attendanceCount: number;
  views: number;
  pricingType: PricingType;
  price: number;
  priceType: PriceType;
  participationType: ParticipationType;
  minTeamSize: number;
  maxTeamSize: number;
  createdBy: User | string;
  status: EventStatus;
  registrationOpen: boolean;
  featured: boolean;
  tags: string[];
  remainingSeats?: number;
  isLive?: boolean;
  isTrending?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  name: string;
  email: string;
  usn: string;
}

export interface Registration {
  _id: string;
  registrationId: string;
  eventId: Event | string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  year: string;
  usn: string;
  teamName?: string;
  teamMembers?: TeamMember[];
  qrCode: string;
  attended: boolean;
  attendanceStatus: AttendanceStatus;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  checkedInAt?: string;
  registeredAt: string;
}

export interface Payment {
  _id: string;
  paymentId: string;
  registrationId: string;
  eventId: Event | string;
  amount: number;
  currency: string;
  payerName: string;
  payerEmail: string;
  method?: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  metadata?: Record<string, any>;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  eventId?: Event | string;
  read: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AdminStats {
  totalEvents: number;
  publishedEvents: number;
  pendingEvents: number;
  upcomingEvents: number;
  totalRegistrations: number;
  totalAttendance: number;
  totalUsers: number;
  attendanceRate: string;
}

export interface EventAnalytics {
  id: string;
  title: string;
  category: EventCategory;
  date: string;
  registrations: number;
  attendance: number;
  maxParticipants: number;
  noShows: number;
  attendanceRate: string;
  fillRate: string;
}

export interface DepartmentStats {
  _id: string;
  totalRegistrations: number;
  attended: number;
}

export interface CategoryStats {
  _id: EventCategory;
  count: number;
  totalRegistrations: number;
  totalAttendance: number;
}

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  technical: '#3b82f6',
  workshop: '#8b5cf6',
  cultural: '#ec4899',
  sports: '#22c55e',
  seminar: '#f97316',
  hackathon: '#ef4444',
  webinar: '#06b6d4',
  conference: '#eab308',
  other: '#6b7280',
};

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  technical: 'Technical',
  workshop: 'Workshop',
  cultural: 'Cultural',
  sports: 'Sports',
  seminar: 'Seminar',
  hackathon: 'Hackathon',
  webinar: 'Webinar',
  conference: 'Conference',
  other: 'Other',
};

export interface Bookmark {
  _id: string;
  userId: string;
  eventId: Event;
  createdAt: string;
}
