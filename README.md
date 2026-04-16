# event-hub
# 🎓 BEC Event Hub

Event Hub is a **centralized campus event discovery and participation platform** built as a module of **BEC Event Hub**, a campus operating system designed to unify academic and administrative services.

The platform transforms traditional event announcements into a **structured digital participation system** where students, faculty, and organizers can discover, register, and manage events efficiently.

---

# 🚀 Key Features

### 📅 Centralized Event Discovery

Students and faculty can explore all upcoming, live, and trending events happening across the campus.

### 📝 Hybrid Event Registration

Supports two types of registrations:

* **Internal Registration** – Participants register directly within the platform.
* **External Registration** – Users are redirected to an organizer’s external form.

This flexibility allows events open to **multiple colleges or external audiences**.

---

### 🎟 QR-Based Event Pass

When users register for an event internally, the system generates:

* Unique **Registration ID**
* **QR Code Event Pass**

Participants can download or save their event pass.

---

### 📷 QR Entry Verification

At the event venue, organizers can scan the participant's QR code using the **Event Hub scanner panel**.

The system automatically:

* Verifies the participant
* Marks attendance
* Prevents duplicate entries

---

### 📊 Event Analytics Dashboard

Admin and organizers can view detailed event insights:

* Total registrations
* Event attendance
* No-show rate
* Popular events

Analytics are visualized using **Chart.js**.

---

### 🔥 Trending Events

Events with the highest engagement are highlighted to help students quickly discover popular activities.

---

### 📡 Live Events Section

Displays events currently happening on campus.

---

### 🔔 Smart Notifications

Users receive real-time notifications for:

* New event announcements
* Registration openings
* Event reminders

---

### 🗺 Campus Event Map

Interactive campus map displaying event locations so users can visually explore events happening around the campus.

---

# 🏗 System Architecture

The Event Hub is designed with a **full-stack architecture**.

Frontend
Next.js
React
TypeScript
TailwindCSS
Three.js animations

Backend
Node.js
Express.js

Database
MongoDB

Analytics
Chart.js

QR Code System
qrcode
html5-qrcode

Notifications
Local toast notifications

---

# 👥 User Roles

### Admin

* Approves event submissions
* Publishes events
* Manages participants
* Views analytics

### Event Organizer

* Submits event proposals
* Tracks registrations
* Downloads participant lists
* Views event analytics

### Students & Faculty

* Discover events
* Register for events
* Receive event passes
* Participate in events

---

# 🔄 Event Lifecycle

The platform manages the **complete event lifecycle**.

Event Creation
↓
Admin Approval
↓
Event Discovery
↓
Participant Registration
↓
QR Event Pass Generation
↓
Event Entry Verification
↓
Attendance Analytics

---

# 📂 Project Structure

```
event-hub
│
├── backend
│   ├── routes
│   ├── models
│   ├── middleware
│   ├── config
│   └── server.js
│
├── frontend
│   ├── app
│   ├── components
│   ├── lib
│   └── types
│
└── README.md
```

---

# ⚙️ Installation & Setup

Clone the repository:

```
git clone https://github.com/samarthsugandhi/event-hub.git
```

Navigate into the project:

```
cd event-hub
```

---

## Backend Setup

```
cd backend
npm install
npm run dev
```

---

## Frontend Setup

```
cd frontend
npm install
npm run dev
```

---

# 🎬 Demo Flow

1. Open Event Hub
2. Browse available events
3. Open event details
4. Register for the event
5. Receive QR event pass
6. Scan QR at event entry
7. View analytics dashboard

Total demo time: **~40 seconds**

---

# 🎯 Project Goal

Event Hub aims to transform traditional campus event announcements into a **centralized participation platform** that enables efficient discovery, registration, attendance tracking, and analytics.

The system is designed to function as a **real-world university event management platform**, not just a hackathon prototype.

---

# 📜 License

This project is built for educational and research purposes.
