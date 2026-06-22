# 🤝 Bharat Connect AI

**Bharat Connect AI** is a modern, AI-powered community empowerment platform designed to bridge the gap between NGOs, local volunteers, and citizens in need. Built as an interactive web application, it streamlines volunteer coordinate efforts, skill donation networks, and emergency blood request routing using real-time communication and AI-driven matching algorithms.

---

## 🌟 Key Features

### 🤖 AI-Powered Recommendation & Matching
- **Smart Skill Matching**: Analyzes volunteer profiles (interests, skills, location) and computes a relevance score using a matching algorithm to recommend the most suitable opportunities.
- **AI-Assisted NGO Tooling**: Integrated with the **Google Gemini API** to help NGOs dynamically generate, enrich, and format volunteer job listings.
- **Blood Compatibility Router**: Algorithms to automatically filter compatible donor types (e.g., O- negative to any type, matching exact antigens) and notify nearby matches.

### 💼 Volunteer Hub
- **NGO Dashboard**: Create, publish, and delete volunteer opportunities. Track applicant resumes, status updates (Pending, Accepted, Rejected), and communicate in real-time.
- **Volunteer Dashboard**: Search, sort, and filter listings by location, type, or skills. Track active applications and status history.

### 🛠️ Skill Donation Platform
- A peer-to-peer and NGO-to-peer network facilitating professional skill-sharing (e.g., teaching, legal assistance, marketing, tech support) to help local communities scale.

### 🩸 Emergency Blood Donation Portal
- **Urgent Broadcasts**: Create urgent blood requests specifying blood group, hospital location, units required, and urgency level.
- **Donor Directory**: Opt-in to be a donor and receive real-time location-based alerts when someone nearby requires your blood type.

### 💬 Real-Time Features & Engagement
- **Interactive Chat**: Live instant messaging between volunteers and NGOs/buddies to coordinate logistics.
- **Instant Notifications**: Real-time push alerts via **Socket.io** for new messages, application status changes, and emergency blood requests.
- **Gamification & Badges**: Earn achievements like *First Contribution*, *First Blood Donation*, and *5 Applications* with instant badge unlock notifications.

---

## 🛠️ Tech Stack

| Layer | Technology | Key Libraries/Features |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite 8 | Tailwind CSS 4, React Router v7, Axios, Lucide React |
| **Backend** | Node.js, Express.js | Socket.io, JWT Auth, Google Auth Library |
| **Database** | MongoDB, Mongoose | Auto-fallback to `mongodb-memory-server` if local MongoDB is absent |
| **AI Integration** | Google Gemini API | Automated opportunity generation & profile summarization |

---

## 📂 Project Structure

```text
bharat-connect-ai/
├── backend/                  # Express.js API server
│   ├── config/               # Database, WebSockets, and Badges config
│   ├── controllers/          # Business logic handlers
│   ├── middleware/           # Auth validation and route protection
│   ├── models/               # MongoDB Mongoose schemas
│   ├── routes/               # API route definitions
│   ├── server.js             # Server entry point
│   └── .env                  # Backend environment configurations
│
├── frontend/                 # Vite + React Single Page App
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable UI widgets (cards, sidebars, alerts)
│   │   ├── context/          # React Auth and State Providers
│   │   ├── pages/            # Core views (Dashboard, Blood Hub, Profile, etc.)
│   │   ├── services/         # Axios API clients
│   │   ├── utils/            # Helper utilities and constants
│   │   ├── App.jsx           # Main routing & layout controller
│   │   └── index.css         # Tailwind directives & design tokens
│   └── package.json          # Frontend build dependencies
│
└── start.bat                 # Direct double-click script to run the entire app
```

---

## ⚙️ Setup & Installation

### Prerequisites
Make sure you have **Node.js (v18+)** installed.

---

### Step 1: Set Up Backend Environment Variables
Navigate to the `backend` directory and create a file named `.env`:
```bash
cd backend
# Create .env and paste the configuration below
```

Add the following environment variables:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bharat-connect
JWT_SECRET=supersecretkeyforbharatconnectbackendjwt
JWT_EXPIRE=30d

# Optional Google OAuth Keys
GOOGLE_CLIENT_ID=your_google_client_id

# Optional Gemini API Key for AI Generation Features
GEMINI_API_KEY=your_gemini_api_key
```

> [!NOTE]  
> If you do not have MongoDB running locally, the backend is configured to **automatically spin up an in-memory MongoDB Server (`mongodb-memory-server`)** as a fallback. You can start testing immediately without installing any databases! *(Note: In-memory database records are ephemeral and will clear when the backend process terminates).*

---

### Step 2: Running the Project

#### Option A: Quick-Start (Windows)
Double-click the **`start.bat`** file located in the root directory. This script will:
1. Automatically check and install missing dependencies in both `backend` and `frontend`.
2. Boot up the Node Express server on `http://localhost:5000`.
3. Boot up the Vite dev server on `http://localhost:5173`.
4. Open the web app automatically in your default browser.

#### Option B: Manual Startup (All Platforms)
Open two separate terminal tabs/windows:

* **Tab 1: Backend Server**
  ```bash
  cd backend
  npm install
  npm run dev
  ```

* **Tab 2: Frontend Client**
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
  Open your browser and navigate to `http://localhost:5173`.

---

## 🔗 Key API Endpoints

### 🔐 Authentication & Profile
- `POST /api/auth/register` - Create volunteer or NGO account.
- `POST /api/auth/login` - Authenticate credentials and receive JWT.
- `POST /api/auth/google` - Sign-in/Sign-up with Google OAuth tokens.
- `GET /api/users/profile` - Fetch current user's profile, badges, and status.

### 🤝 Volunteer Opportunities & Applications
- `GET /api/opportunities` - Query opportunities (supports filtering and search).
- `POST /api/opportunities` - Create a volunteer slot (NGO access only).
- `DELETE /api/opportunities/:id` - Delete opportunities (NGO access only).
- `POST /api/applications` - Apply to a volunteer opportunity.
- `PUT /api/applications/:id` - Accept/reject applicant (NGO access only).

### 🩸 Blood Donation Portal
- `GET /api/blood/requests` - Retrieve all emergency blood requests.
- `POST /api/blood/requests` - Post an urgent blood request.
- `POST /api/blood/respond/:id` - Offer response as a matching donor.

### 🤖 Gemini AI Integration
- `POST /api/ai/generate-opportunity` - Generates description/tags from prompt using Gemini API.
- `GET /api/ai/recommendations` - Returns customized matching recommendations for users based on distance, skills, and availability.

---

## 🏆 Gamification Badges Available
Users earn these achievements which unlock custom profile markers:
1. **First Contribution** - Earned for the first accepted volunteer application or submitted donor request response.
2. **First Blood Donation** - Awarded upon coordinating/submitting a donor offer for emergency blood requests.
3. **5 Applications** - Earned for submitting 5 volunteer applications.

---

## 🤝 Contributing
1. Fork the Repository.
2. Create your Feature Branch (`git checkout -b feature/NewFeature`).
3. Commit your changes (`git commit -m 'Add NewFeature'`).
4. Push to the Branch (`git push origin feature/NewFeature`).
5. Open a Pull Request.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for details.
