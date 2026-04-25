# EduReach

EduReach is a MERN-based low-bandwidth learning platform designed for inclusive education. It supports student, teacher, and admin workflows with structured courses, lecture progress tracking, quizzes, recommendations, analytics, and profile preferences such as low-bandwidth mode.

## Features

- JWT authentication with role-based access
- Student enrollment and progress tracking
- Lecture viewer with low-bandwidth image loading
- Lecture videos with low-bandwidth H.264-optimized playback
- Teacher course, module, lecture, and quiz management
- Student quiz attempts and result review
- Rule-based learning recommendations
- Teacher analytics dashboard
- Admin analytics and user role management

## Tech Stack

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JSON Web Tokens

## Project Structure

- `client/` contains the React frontend
- `server/` contains the Express API and MongoDB models

## Environment Setup

Create these files before running the project:

- `client/.env`
- `server/.env`

Use the included examples:

- [client/.env.example](C:/Users/Siddharth/Desktop/Agentic%20Capstone/client/.env.example)
- [server/.env.example](C:/Users/Siddharth/Desktop/Agentic%20Capstone/server/.env.example)

Local lecture uploads are stored under `server/uploads`.
For video optimization, make sure `ffmpeg` is installed and available in your system `PATH`.
For AI lecture summaries, MCQs, and chat, set `GEMINI_API_KEY` to your Google AI Studio API key in `server/.env`. The default model is `gemma-3-27b-it`; override it with `GOOGLE_AI_MODEL` if your AI Studio project uses a different Gemma model.
For automatic video transcripts, set `OPENAI_API_KEY` and `ENABLE_WHISPER_TRANSCRIPTION=true` in `server/.env`. Keep `ENABLE_WHISPER_TRANSCRIPTION=false` while testing to use a sample AI transcript without making paid transcription calls.

## Run Locally

Server:

```bash
cd server
npm install
npm run seed
npm run dev
```

Client:

```bash
cd client
npm install
npm run dev
```

## Seed Data For Testing

The backend includes a demo seed script:

```bash
cd server
npm run seed
```

It creates realistic sample data for all main roles and workflows.

Default password for every seeded user:

```bash
password123
```

Seeded accounts:

- `admin@edureach.dev` for admin analytics and role management
- `teacher1@edureach.dev` for managing two active courses with quizzes
- `teacher2@edureach.dev` for science-course analytics testing
- `teacher3@edureach.dev` for communication-course testing
- `student1@edureach.dev` for low-bandwidth mode, notes, achievements, recommendations, and streak testing
- `student2@edureach.dev` for partial progress and failed quiz scenarios
- `student3@edureach.dev` for completed-course and certificate testing

## Roles

- `student`: enroll, learn, take quizzes, view progress and recommendations
- `teacher`: create and manage courses, modules, lectures, and quizzes
- `admin`: view platform analytics and manage user roles

## Current Status

The platform now supports the full planned core workflow for a final-year project:

- Auth and role protection
- Course authoring
- Student learning flow
- Quiz flow
- Recommendations
- Teacher and admin dashboards

## Next Expansion Ideas

- Rich multi-question quiz builder
- Certificates and badges
- File uploads for lecture resources
- Search and category filters
- PWA/offline caching
