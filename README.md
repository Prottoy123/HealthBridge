# HealthBridge - Comprehensive Health-Care System

**HealthBridge** is a modern, comprehensive healthcare management platform designed to bridge the gap between patients, doctors, and medical staff. It streamlines the medical process by providing a unified interface for appointment scheduling, medical record management, telemedicine (chat), prescription handling, and AI-assisted health insights. 

The system provides dedicated portals for different user roles, ensuring secure and efficient healthcare delivery while reducing administrative overhead.

### 🌐 Live Demo: [https://health-bridge-gamma.vercel.app/](https://health-bridge-gamma.vercel.app/)

---

## 🌟 Key Features by Role

### 🧑‍⚕️ For Patients
* **User Authentication & Profile:** Secure login, registration, and personalized profile management.
* **Appointment Booking:** Easily browse doctors, view availability, and schedule, reschedule, or cancel appointments.
* **Medical Records Access:** Securely view past medical records, test results, and health history.
* **Digital Prescriptions:** Access, download, and manage prescriptions provided by doctors.
* **Real-time Messaging:** Chat directly with doctors for follow-ups and quick consultations.
* **AI Health Assistant:** Integrated AI tools for general health queries and symptom guidance.

### 👨‍⚕️ For Doctors
* **Doctor Dashboard & Profile:** Manage personal information, specialization details, and consultation hours.
* **Appointment Management:** View, accept, reschedule, or cancel patient appointments.
* **Patient Medical History:** Access comprehensive medical records of assigned patients before consultations.
* **Prescription Generation:** Create, manage, and digitally sign prescriptions for patients.
* **Follow-up Tracking:** Schedule and manage follow-ups for continuous patient care.
* **Direct Patient Chat:** Communicate with patients securely for updates or post-consultation queries.

### 👨‍💼 For Administrators
* **User Management:** Oversee all users (Patients, Doctors, Staff) with the ability to activate/deactivate accounts.
* **System Monitoring:** Monitor overall platform activity, revenue, and appointment statistics.
* **Role Assignment:** Manage roles, permissions, and verify doctor credentials across the platform.

### 🏥 For Medical Staff
* **Operational Dashboard:** Assist in managing hospital operations, billing, and schedules.
* **Records Management:** Help in digitizing and updating patient medical records.
* **Appointment Support:** Manage walk-in appointments and coordinate with available doctors.

---

## 💻 Tech Stack

### Frontend (Client-side)
* **Framework:** React.js (Vite)
* **Styling:** Tailwind CSS
* **State Management:** Redux Toolkit & Redux Persist
* **Routing:** React Router DOM
* **Real-time Communication:** Socket.io-client
* **Icons & UI:** Lucide React, React Hot Toast
* **HTTP Client:** Axios

### Backend (Server-side)
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB with Mongoose
* **Authentication:** JSON Web Tokens (JWT) & Bcryptjs
* **Real-time Communication:** Socket.io
* **File Upload & Storage:** Multer & Cloudinary
* **Email Service:** Nodemailer
* **Caching:** Redis (ioredis)
* **AI Integration:** Google Generative AI (Gemini)

---

## 🚀 Local Setup & Installation

### Prerequisites
* Node.js (v16 or higher)
* MongoDB database
* Cloudinary Account (for media uploads)
* Google Gemini API Key (for AI features)
* Redis (optional, for caching)

### 1. Clone the repository
```bash
git clone https://github.com/Prottoy123/HealthBridge.git
cd "Health-Care System"
```

### 2. Backend Setup
```bash
cd Backend
npm install
```
* Create a `.env` file in the `Backend` directory based on `.env.example` and add your database, JWT, Cloudinary, and other required API credentials.
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd Frontend
npm install
```
* Create a `.env` file in the `Frontend` directory based on `.env.example` and add your backend API URL (e.g., `VITE_API_URL=http://localhost:3000/api/v1`).
```bash
npm run dev
```

### 4. Access the App
Open your browser and navigate to `http://localhost:5173`
