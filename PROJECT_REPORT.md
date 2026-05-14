# EduReach: AI-Powered Adaptive Learning Ecosystem
## Technical & Functional Project Report

---

### 1. Executive Summary
**EduReach** is a state-of-the-art Learning Management System (LMS) designed to bridge the gap between content creation and personalized learning. By leveraging advanced AI models (Gemma-3-12b) and a robust media processing pipeline, EduReach automates the tedious aspects of course building—such as transcription, summarization, and quiz generation—while providing students with an adaptive, bandwidth-conscious learning experience.

---

### 2. Core Technical Stack

#### Frontend (Client)
- **Framework**: React 19 (Latest)
- **Build Tool**: Vite (Ultra-fast HMR)
- **Styling**: Tailwind CSS 4 (Atomic design system)
- **Real-time**: Socket.io-client (Live interactions)
- **Media**: Custom Adaptive Video Player with quality switching (H.264/Audio-only)
- **Internationalization**: i18next (Multi-language support)

#### Backend (Server)
- **Runtime**: Node.js (Express.js framework)
- **Database**: MongoDB (Mongoose ODM for flexible schema)
- **AI Services**: Google Generative AI (Gemma-3-12b integration)
- **Media Engine**: FFmpeg (Video transcoding, thumbnailing, audio extraction)
- **File Parsing**: Mammoth (DOCX), OfficeParser (PPTX/PPT), PDF-Lib (PDF Optimization)
- **Authentication**: JWT (JSON Web Tokens) with Secure HTTP-Only Cookies

---

### 3. Key Architectural Innovations

#### A. AI-Driven Automation (Gemma-3-12b)
The system features a background processing pipeline that triggers automatically upon lecture creation:
1. **Context Extraction**: System parses uploaded PDFs, Word docs, or PPTs for raw educational context.
2. **Intelligent Synthesis**: Gemma-3 analyzes the text and video transcripts to generate:
   - **Comprehensive Summaries**: Key takeaways and structural overviews.
   - **Adaptive Question Banks**: Multi-difficulty (Easy, Medium, Hard) MCQs tailored to the specific lecture content.
3. **Manual JSON Handling**: Custom parsers ensure high-reliability JSON output even with non-native JSON models like Gemma-3.

#### B. Adaptive Media Delivery
EduReach solves the "connectivity gap" with a tiered media strategy:
- **H.264 Optimization**: High-efficiency compression for web playback.
- **Audio-Only Mode**: A dedicated stream for students with extremely low bandwidth.
- **Offline Mode**: A sophisticated caching system that allows students to download entire course packs for offline learning.
- **Smart Quality Switching**: Automatic network detection (Mbps) to suggest the best streaming mode.

#### C. Live Learning Ecosystem
- **VideoSDK Integration**: Low-latency, high-definition live classrooms.
- **Live Sync**: Real-time course status updates and live session triggers via Socket.io.

---

### 4. Functional Modules

#### Teacher Studio
- **Curriculum Builder**: Drag-and-drop module organization.
- **Draft/Publish Workflow**: Secure environment to build content privately before public release.
- **Auto-Processing Dashboard**: Real-time tracking of AI and video optimization jobs.
- **Analytics**: (Planned) Visual insights into student progress and quiz performance.

#### Student Portal
- **Dashboard**: personalized view of enrolled courses and progress tracking.
- **Unified Player**: Integrated view for video, notes, AI summaries, and transcripts.
- **Adaptive Quizzing**: AI-generated practice tests that help reinforce learned concepts.
- **Course Exploration**: Categories, levels, and rating-based discovery.

---

### 5. Security & Data Integrity
- **Role-Based Access Control (RBAC)**: Strict separation between Admin, Teacher, and Student roles.
- **Privacy Layer**: All draft content is inaccessible via direct URL or API calls for non-staff users.
- **File Sanitization**: Cryptographic filename generation and secure local storage structures.

---

### 6. Development & Deployment
- **Containerization**: Full Docker & Docker-Compose setup for production-parity development.
- **Environmental Safety**: Centralized `.env` configuration for AI API keys, DB URIs, and processing flags.

---

### 7. Future Roadmap
1. **Gamification**: Badges and leaderboards for course completions.
2. **Advanced Analytics**: Heatmaps showing where students drop off in videos.
3. **P2P Learning**: Peer-review systems and community discussion forums.

---

**Report Generated On**: 2026-04-26
**Project Status**: Production Ready / Active Enhancement Phase
