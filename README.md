# 🎓 BEC Event Hub

BEC Event Hub is a full-stack campus event platform for discovery, registration, attendance, analytics, and organizer/admin operations.

It supports the full lifecycle of an event:

Create → Review → Publish → Register → Attend (QR) → Analyze

---

## ✨ Current Capabilities

### Core Event Flow
- Centralized event discovery (`featured`, `trending`, `upcoming`, `live`)
- Internal and external registration support
- QR pass generation and QR scan-based attendance verification
- Payment flow support for paid events

### Admin & Organizer Operations
- Admin approval/rejection/publish workflow
- Bulk admin actions (approve/publish/reject)
- Organizer event management (create/edit/duplicate)
- Participant export tools (CSV/Word/PDF)

### Analytics & Intelligence
- Event analytics dashboards (overview, event-level, category, department)
- **Server-side funnel analytics** (`discover`, `view_detail`, `register`, `pay`, `attend`)
- **Server anomaly detection** + configurable admin anomaly rules

### Personalization & Productivity
- **Persistent saved filters per user** (backend stored)
- Personalized home surfaces (recommended / recent / bookmarks)
- Actionable notifications
- Profile utilities + certificates view

### Certificates
- **Bulk certificate issuance** (admin)
- User certificate listing and certificate detail retrieval

---

## 🧱 Tech Stack

### Frontend
- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Framer Motion

### Backend
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- Socket.IO (notifications)

### Supporting Modules
- QR: `qrcode`, scanner support route/UI
- Charts: Chart.js

---

## 👥 Roles

### Admin
- Manage approvals/publishing
- Monitor anomalies and attendance gaps
- Issue certificates
- Access analytics and scanner

### Organizer
- Submit/manage events
- Duplicate and edit events
- Track registrations and exports

### Student / Faculty
- Discover and register for events
- Use QR pass for entry
- Track notifications, payments, bookmarks, certificates

---

## 📁 Project Structure

```bash
Events Hub/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   └── package.json
└── README.md
```

---

## ⚙️ Local Setup

### 1) Clone

```bash
git clone https://github.com/samarthsugandhi/event-hub.git
cd event-hub
```

### 2) Backend

```bash
cd backend
npm install
```

Create `.env` in `backend/` with at least:

```env
MONGODB_URI=mongodb://localhost:27017/bec-vortex-events
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
PORT=5000
```

Run backend:

```bash
npm run dev
```

### 3) Frontend

```bash
cd ../frontend
npm install
npm run dev
```

App runs on `http://localhost:3000`

---

## 🔌 Backend APIs Added in Integrated Phase

### Funnel Analytics
- `POST /api/analytics/track`
- `GET /api/analytics/funnel`
- `GET /api/analytics/funnel/summary` (admin)

### Saved Filters
- `GET /api/user/saved-filters`
- `POST /api/user/saved-filters`
- `GET /api/user/saved-filters/:id`
- `PUT /api/user/saved-filters/:id`
- `DELETE /api/user/saved-filters/:id`

### Anomalies + Rules
- `GET /api/admin/anomalies`
- `GET /api/admin/anomaly-rules`
- `POST /api/admin/anomaly-rules`
- `PUT /api/admin/anomaly-rules/:id`
- `DELETE /api/admin/anomaly-rules/:id`

### Certificates
- `POST /api/certificates/issue` (admin)
- `GET /api/certificates`
- `GET /api/certificates/:id`
- Alias: `GET /api/user/certificates`

---

## 🧪 Build Validation

### Backend build

```bash
cd backend
npm run build
```

### Frontend build

```bash
cd frontend
npm run build
```

---

## 📌 Notes

- Funnel tracking is backend-first with local fallback for offline/failure scenarios.
- Certificate endpoints currently return certificate data; signed PDF generation can be extended as a next enhancement.

---

## 📜 License

Built for educational and research use.
