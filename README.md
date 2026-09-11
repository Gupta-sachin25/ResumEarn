# ResumEarn

> **AI-powered job and internship discovery platform that finds opportunities based on your resume, skills, and preferences.**

## 🚀 About ResumEarn

**ResumEarn** is an AI-powered platform designed to help students and job seekers discover relevant internships and job opportunities without manually searching across multiple career websites.

Users can upload their resume, let AI analyze their profile, and search for relevant opportunities. ResumEarn uses AI-assisted job discovery and matching to find opportunities that fit the user's skills, education, experience, and preferences.

ResumEarn also introduces a **coin-based contribution system** where users can earn coins by submitting valid and previously unavailable job opportunities.

---

## ✨ Features

### 📄 AI Resume Analysis

* Upload your resume in PDF format
* Extract resume information automatically
* Analyze the resume using Google Gemini
* Generate a structured candidate profile
* Edit and update extracted profile information

### 🔎 AI-Powered Job Discovery

* Find relevant internships and jobs
* Search based on resume and candidate profile
* Discover current job openings
* Get direct links to company career/application pages
* Filter opportunities based on user preferences

### 🎯 Job Matching

ResumEarn calculates how well a job matches the candidate's profile.

The initial matching system considers:

| Factor         |   Weight |
| -------------- | -------: |
| Skills         |      35% |
| Eligibility    |      25% |
| Role Relevance |      20% |
| Experience     |      10% |
| Location       |       5% |
| Education      |       5% |
| **Total**      | **100%** |

Example:

```text
Software Engineer Intern

87% Match

Matched Skills
✓ C++
✓ React
✓ Node.js

Missing Skills
• Docker

Eligibility
✓ Eligible
```

### 🪙 Coin System

New users receive coins that can be used to search for opportunities.

Default configuration:

| Action                   | Coins |
| ------------------------ | ----: |
| New user bonus           |  +100 |
| Job search               |   -10 |
| Valid new job submission |    +5 |

The values are configurable and can be changed as the platform evolves.

### ➕ Earn Coins by Contributing Jobs

Users can submit job openings they discover.

If a submitted opportunity is:

* Valid
* Currently open
* Not already available on ResumEarn
* Successfully verified

the user can receive bonus coins.

Duplicate submissions cannot be used to repeatedly earn coins.

### 🏢 Hirer Accounts

Hirers can:

* Create job postings
* Edit their own postings
* Manage their job listings
* Deactivate job postings

### 🛡️ Role-Based Access Control

ResumEarn supports three roles:

```text
USER
HIRER
ADMIN
```

Each role has different permissions and access levels.

### 📌 Saved Jobs

Users can save interesting opportunities for later.

### 📋 Application Tracker

Users can manually track their applications:

```text
Saved
Applied
Interview
Rejected
Offer
```

### 🔍 Job Validation

AI-discovered and user-submitted jobs are not blindly trusted.

ResumEarn can check:

* Application URL
* Company information
* Job title
* Duplicate listings
* Job page availability
* Job status
* Source information

---

## 🧠 How ResumEarn Works

```text
                         Resume
                            │
                            ▼
                    PDF Text Extraction
                            │
                            ▼
                       Gemini AI
                            │
                            ▼
                    Candidate Profile
                            │
                            ▼
                       Job Search
                            │
                       - Coins
                            │
                            ▼
                  AI Job Discovery
                            │
                            ▼
                 Validation & Filtering
                            │
                            ▼
                    Matching Engine
                            │
                            ▼
                 Ranked Job Results
                            │
                            ▼
              Original Application Page
```

---

## 🪙 Coin Economy

The coin system is designed to encourage users to contribute useful opportunities to the platform.

### Example

```text
New User
   │
   └── +100 Coins
          │
          ▼
      Job Search
          │
          └── -10 Coins
                    │
                    ▼
              90 Coins Left
                    │
                    ▼
         Submit Valid New Job
                    │
                    └── +5 Coins
                              │
                              ▼
                        95 Coins
```

All coin operations are controlled by the backend.

Users cannot directly modify their own coin balance.

---

## 🔎 Job Discovery & Verification

Gemini is used as the primary job discovery mechanism for the MVP.

However, AI-generated information can sometimes be inaccurate or outdated.

Therefore, ResumEarn treats AI results as **job leads** and applies validation before considering them verified.

### Job Verification Flow

```text
Gemini discovers job
        │
        ▼
Extract job information
        │
        ▼
Validate application URL
        │
        ▼
Check duplicate
        │
        ▼
Verify company & job details
        │
        ▼
Check availability
        │
        ▼
Store / Display job
```

Possible verification statuses:

```text
VERIFIED
UNVERIFIED
EXPIRED
REJECTED
```

The goal is to provide users with reliable and useful opportunities while minimizing duplicate, outdated, or incorrect listings.

---

## 👥 User Roles

### USER

Users can:

* Register and login
* Upload resumes
* Manage their profiles
* Search for jobs
* Spend coins
* Submit job opportunities
* Earn coins
* Save jobs
* Track applications

### HIRER

Hirers can:

* Create job postings
* Edit their own postings
* Deactivate their postings
* Manage their job listings

### ADMIN

Admins can:

* Manage users
* Manage hirers
* Review submitted jobs
* Approve or reject job submissions
* Remove invalid jobs
* Manage platform data
* Adjust coins when required

Authorization is enforced on the backend.

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* React Router
* Axios

### Backend

* Node.js
* Express.js
* JWT
* bcrypt
* Multer

### Database

* PostgreSQL
* Prisma ORM

### AI

* Google Gemini API

### Development Tools

* Git
* GitHub
* Postman
* VS Code

---

## 📁 Project Structure

```text
ResumEarn/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── ...
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── ...
│   │
│   ├── prisma/
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed:

* [Node.js](https://nodejs.org/)
* npm
* PostgreSQL
* Git

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/ResumEarn.git
cd ResumEarn
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../backend
npm install
```

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend` directory.

```env
PORT=5000

DATABASE_URL="your_postgresql_database_url"

JWT_SECRET="your_jwt_secret"

GEMINI_API_KEY="your_gemini_api_key"

INITIAL_USER_COINS=100
SEARCH_COST=10
VALID_JOB_REWARD=5
```

> ⚠️ **Never commit your `.env` file or API keys to GitHub.**

---

## ▶️ Running the Application

### Start the Backend

```bash
cd backend
npm run dev
```

### Start the Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

The backend will normally run at:

```text
http://localhost:5000
```

---

## 🗺️ Development Roadmap

### Phase 1 — Project Setup

* Frontend setup
* Backend setup
* Environment configuration

### Phase 2 — Authentication

* User registration
* Login
* JWT authentication
* Protected routes

### Phase 3 — Resume Processing

* Resume upload
* PDF text extraction
* Gemini resume analysis

### Phase 4 — Candidate Profile

* Structured AI profile
* Profile editing

### Phase 5 — Coin System

* Initial coin allocation
* Search deductions
* Coin transaction history
* Job submission rewards

### Phase 6 — Job Discovery

* Job database
* Modular job source architecture
* Gemini-powered job discovery

### Phase 7 — Job Validation

* URL validation
* Duplicate detection
* Job verification
* Active/expired status

### Phase 8 — Matching Engine

* Resume/job matching
* Match percentage
* Skill comparison
* Eligibility checking

### Phase 9 — User Job Contributions

* Job submission
* Validation
* Duplicate prevention
* Coin rewards

### Phase 10 — Hirer Platform

* Hirer accounts
* Job posting
* Job management

### Phase 11 — Dashboard

* Recommended jobs
* Job search
* Saved jobs
* Coin balance

### Phase 12 — Application Tracking

* Saved jobs
* Application status
* Application history

### Phase 13 — Admin

* Job moderation
* User management
* Hirer management
* Coin management

### Phase 14 — Testing & Deployment

* API testing
* Authentication testing
* Matching engine testing
* Security testing
* Error handling
* UI improvements
* Deployment

---

## 🎯 MVP Goal

The primary goal of the MVP is simple:

> **Help students discover relevant and currently available jobs and internships based on their resume.**

The core MVP flow is:

```text
Register
   ↓
Receive 100 Coins
   ↓
Upload Resume
   ↓
AI Profile Generation
   ↓
Search Jobs
   ↓
Spend Coins
   ↓
AI Job Discovery
   ↓
Validate Jobs
   ↓
Calculate Match %
   ↓
Show Relevant Opportunities
   ↓
Apply Through Original Company Website
```

A secondary MVP feature allows users to contribute new opportunities:

```text
Submit Job
   ↓
Validate
   ↓
Check Duplicate
   ↓
Verify
   ↓
Valid & New
   ↓
+5 Coins
```

---

## 🔮 Future Improvements

Planned or potential improvements include:

* More job APIs and data sources
* Company career-page integrations
* Automatic job expiry detection
* Personalized job alerts
* Email notifications
* Advanced semantic matching
* Resume improvement suggestions
* AI-generated cover letters
* Recruiter dashboards
* Applicant management
* Interview preparation
* Application analytics
* Personalized recommendations

---

## ⚠️ Disclaimer

ResumEarn uses AI-assisted job discovery and matching.

Job listings, eligibility requirements, deadlines, and availability can change over time. AI-generated information may occasionally be inaccurate.

Users should always verify the job details on the **original company's career/application page** before applying.

---

## 🤝 Contributing

Contributions are welcome.

To contribute:

```bash
git checkout -b feature/your-feature
```

Make your changes, test them, and create a pull request.

Please keep changes focused and maintain the existing project structure.

---

## 📄 License

This project is currently under development.

An appropriate open-source license will be added when the project is ready for public distribution.

---

## 👨‍💻 Author

**Your Name**

Built with ❤️ using **React, Node.js, PostgreSQL, Prisma, and Google Gemini AI**.
