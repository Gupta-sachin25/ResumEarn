I want to modify the existing implementation plan for my project **InternMatch AI** according to a new MVP approach.

**Important:** I have already completed **Phase 1 and Phase 2** from the previous plan. Do NOT redo, replace, or unnecessarily modify those completed phases.

First inspect the existing codebase and understand what has already been implemented. Then update the remaining implementation plan accordingly.

## New MVP Concept

The main purpose of the application is:

> A user uploads their resume, and the application uses AI to find currently available jobs/internships that match the user's profile and provides the original company/application page.

I want the MVP to remain **free or extremely low-cost**, so I do not want the architecture to depend heavily on expensive paid job APIs or large-scale scraping.

### Main user flow

```text
Register
   ↓
Receive 100 coins
   ↓
Upload Resume
   ↓
AI analyzes resume
   ↓
User searches for jobs
   ↓
10 coins deducted
   ↓
AI discovers current job/internship openings
   ↓
Jobs are validated/normalized
   ↓
Jobs are matched with user's profile
   ↓
Show match percentage
   ↓
User opens original company career/application page
```

The exact coin values should be configurable.

For example:

```text
INITIAL_USER_COINS = 100
SEARCH_COST = 10
VALID_JOB_REWARD = 5
```

These should be environment/configuration values rather than hardcoded throughout the application.

---

## 1. AI Job Discovery

The **most important MVP feature** is job discovery.

I want Gemini to be the primary mechanism for discovering current job/internship openings according to the user's resume/profile.

The AI should try to find:

* Current internships
* Current full-time jobs
* Relevant roles
* Relevant companies
* Relevant locations
* Eligibility information
* Required skills
* Application links

The most important result is the **original application/career URL**.

Whenever possible, the result should point directly to the company's career/application page rather than an article or unrelated aggregator.

However, do NOT blindly trust Gemini.

The architecture should account for:

* Outdated jobs
* Fake/inaccurate URLs
* Duplicate jobs
* Expired jobs
* Incorrect eligibility information
* AI hallucinations

Create a validation layer between AI discovery and the final results.

---

## 2. Job Source Architecture

Keep job discovery modular.

I want the architecture to support multiple sources later.

Conceptually:

```text
JobSource
 ├── GeminiJobSource
 ├── DatabaseJobSource
 ├── UserSubmittedJobSource
 └── HirerJobSource
```

Later I may add:

```text
RSS
Public APIs
Company career pages
Other job providers
```

Adding a new source should not require rewriting the matching engine or frontend.

---

## 3. Job Database

Jobs discovered by AI should be normalized and stored in the database rather than treating every Gemini response as a completely new job.

A job should contain information such as:

```text
title
company
description
location
jobType
experienceLevel
skills
eligibility
applicationUrl
sourceUrl
postedDate
deadline
isActive
verificationStatus
lastVerifiedAt
sourceType
createdBy
```

The exact schema can be adjusted after inspecting the existing Prisma/database structure.

The system should detect duplicate jobs.

For example, the same application URL discovered multiple times should not create multiple job records.

---

## 4. Coin System

Every newly registered normal user should receive an initial amount of coins, e.g. **100**.

Searching for jobs costs coins, e.g. **10 coins per search**.

The backend must control coin deduction.

The frontend must NEVER be trusted to modify the user's balance.

I also want a complete coin transaction history.

For example:

```text
+100  Welcome bonus
-10   Job search
+5    Valid job submission
-10   Job search
```

Possible transaction types:

```text
INITIAL_BONUS
JOB_SEARCH
JOB_SUBMISSION_REWARD
ADMIN_ADJUSTMENT
```

Use proper database transactions so that the user's balance and transaction history cannot become inconsistent.

---

## 5. Users Can Submit Jobs

Normal users should be able to contribute job openings.

Example:

```text
User finds an internship
        ↓
Submits job URL/details
        ↓
System validates it
        ↓
Checks whether it already exists
        ↓
Checks whether it is actually open/relevant
        ↓
If valid and new
        ↓
User receives +5 coins
```

The reward should only happen for a **valid, new job**.

Users must not be able to repeatedly submit the same job to farm coins.

The submission system should support statuses such as:

```text
PENDING
APPROVED
REJECTED
```

Choose the safest/reasonable approach for whether the +5 reward happens automatically after validation or only after approval.

---

## 6. Role-Based Access Control

I want three roles:

```text
USER
HIRER
ADMIN
```

### USER

Can:

* Register/login
* Upload resume
* Edit profile
* Search jobs
* Spend coins
* Submit jobs
* Earn coins
* Save jobs
* Open external application links
* Track applications

### HIRER

Can:

* Create job postings
* Edit their own job postings
* Delete/deactivate their own postings
* View/manage their own postings

Later:

* View applicants
* Manage applications

### ADMIN

Can:

* Manage users
* Manage hirers
* Review job submissions
* Approve/reject submissions
* Manage jobs
* Remove invalid/fraudulent jobs
* Adjust coins
* Manage platform data

Authorization must be implemented on the **backend**, not just by hiding frontend pages.

---

## 7. Resume → AI Profile

After resume upload:

```text
PDF
 ↓
Text extraction
 ↓
Gemini
 ↓
Structured candidate profile
 ↓
Database
```

The profile should contain relevant information such as:

* Education
* Graduation year
* Skills
* Programming languages
* Frameworks
* Databases
* Tools
* Projects
* Experience
* Internships
* Achievements
* Certifications
* Preferred roles
* Preferred locations

The user should be able to edit the extracted profile.

Keep resume-analysis Gemini logic separate from job-discovery Gemini logic.

---

## 8. Matching Engine

After jobs are discovered, calculate a match percentage between the candidate and job.

Initially use deterministic scoring.

For example:

```text
Skills             35%
Eligibility        25%
Role relevance     20%
Experience         10%
Location            5%
Education           5%
```

These weights should be configurable.

The result can look conceptually like:

```text
87% Match

Matched skills:
C++
React
Node.js

Missing skills:
Docker

Eligibility:
Matched
```

Important:

**Hard eligibility rules should not be overridden by Gemini.**

For example, if a job explicitly requires a particular graduation year and the candidate does not satisfy it, the system should clearly indicate that mismatch.

---

## 9. Search Flow

The job search should conceptually work like:

```text
Authenticated user
       ↓
Check coins
       ↓
Deduct search cost
       ↓
Get candidate profile
       ↓
Discover current jobs
       ↓
Normalize jobs
       ↓
Validate jobs
       ↓
Remove duplicates
       ↓
Match jobs against profile
       ↓
Rank results
       ↓
Return jobs + remaining coins
```

If the user does not have enough coins, do not perform the search.

The backend should handle this securely.

---

## 10. Dashboard

The main dashboard should show:

* Current coin balance
* Search jobs button
* Recommended jobs
* Match percentages
* Saved jobs
* Submitted jobs
* Recent searches
* Application tracker

Example:

```text
Welcome

Coins: 85

[ Search Jobs ]

Recommended Jobs

Software Engineer Intern
Google
Bangalore

92% Match

[View Job]

Frontend Intern
Amazon
Bangalore

87% Match

[View Job]
```

Keep the UI modern and clean, but do not unnecessarily rewrite already completed frontend work.

---

## 11. Job Details

A job details page should show:

* Company
* Role
* Location
* Job type
* Eligibility
* Skills
* Description
* Match percentage
* Matched skills
* Missing skills
* Verification status
* Last verified date

Most importantly:

```text
Apply Now
```

This should take the user to the **original external application/career page**.

---

## 12. Saved Jobs & Application Tracker

Users should be able to save jobs.

They should also be able to manually track applications:

```text
Saved
Applied
Interview
Rejected
Offer
```

This can remain a simple manual tracker for the MVP.

---

## 13. Security

Make sure:

* Gemini API key stays on backend.
* Users cannot manipulate their own coin balance.
* Coin deductions happen server-side.
* Coin rewards happen server-side.
* Duplicate job submissions cannot farm coins.
* USER cannot access HIRER-only APIs.
* HIRER cannot access ADMIN APIs.
* Hirers can only modify their own jobs.
* Users can only manage their own submissions.
* Uploaded PDFs are validated.
* URLs are validated.
* User-submitted content is sanitized.
* AI output is validated before being stored/displayed.

---

# Updated Development Phases

Since Phase 1 and Phase 2 are already completed, update the plan starting from Phase 3:

### Phase 3

Resume upload + PDF text extraction

### Phase 4

Gemini resume analysis + structured profile

### Phase 5

Coin/credit system

### Phase 6

Job database + modular JobSource architecture

### Phase 7

Gemini-powered current job discovery

### Phase 8

Job validation + normalization + duplicate detection

### Phase 9

Resume/job matching engine

### Phase 10

Job search API + secure coin deduction

### Phase 11

User job submission + validation + coin rewards

### Phase 12

HIRER role + direct job posting

### Phase 13

Dashboard + job details

### Phase 14

Saved jobs + application tracker

### Phase 15

ADMIN moderation

### Phase 16

Testing, security, error handling and UI polish

---

# Most Important MVP Priority

Do NOT focus on building every feature first.

The first working MVP should prove this exact flow:

```text
USER REGISTERS
       ↓
GETS 100 COINS
       ↓
UPLOADS RESUME
       ↓
GEMINI UNDERSTANDS RESUME
       ↓
SEARCHES JOBS
       ↓
10 COINS DEDUCTED
       ↓
GEMINI DISCOVERS CURRENT JOBS
       ↓
JOBS ARE VALIDATED
       ↓
MATCHING SCORE IS CALCULATED
       ↓
JOBS ARE DISPLAYED
       ↓
USER CLICKS ORIGINAL APPLICATION LINK
```

Then add:

```text
USER SUBMITS VALID NEW JOB
       ↓
VALIDATION
       ↓
+5 COINS
```

Then:

```text
HIRER
 ↓
POSTS JOB
```

Then ADMIN moderation and other secondary features.

---

# What I want you to do

Do **not implement anything yet**.

Do not generate code yet.

First:

1. Inspect my existing project.
2. Understand what Phase 1 and Phase 2 already contain.
3. Update the implementation plan according to the new MVP concept above.
4. Identify which parts of the old plan should be removed, changed, or postponed.
5. Give me the **final revised implementation plan**, starting from Phase 3.
6. Clearly identify the **MVP-critical phases** versus later/optional phases.
7. Point out any major technical risks, especially around using Gemini to discover current jobs while keeping the application free/low-cost.

Only after I approve the revised plan should implementation begin.

Do not restart or rewrite completed work.
