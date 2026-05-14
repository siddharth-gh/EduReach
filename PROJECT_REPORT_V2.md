# EduReach: Comprehensive Technical Architecture & Infrastructure Report
## Version 2.0 - Extended Specification

---

### 1. Architectural Philosophy
EduReach (formerly RemoteSmart) is engineered as a **resilient learning platform** designed specifically for inclusive education. It operates on three core pillars:
1.  **AI-First Content Generation**: Reducing teacher friction via automated synthesis.
2.  **Adaptive Delivery**: Supporting high-end fiber connections and low-bandwidth mobile data equally.
3.  **Local-First Resilience**: Ensuring learning continues even without an active internet connection.

---

### 2. Docker Infrastructure & Orchestration
The project is fully containerized using Docker, allowing for "one-click" deployment and environment parity.

#### Service Orchestration (docker-compose.yml)
- **`client`**: Vite-powered React container serving the frontend.
- **`server`**: Node.js Express container handling the core business logic and media pipeline.
- **`whisper-ai`**: A specialized Python container running OpenAI Whisper for high-accuracy local transcription.
- **`mongodb`**: Document store for persistent application state.

#### specialized Dockerfiles
- **Whisper Server**: Utilizes a Python base image with `ffmpeg` and `openai-whisper` installed, exposing a REST API for the Node.js backend to offload heavy transcription tasks.
- **Build Stages**: The frontend utilizes multi-stage builds to optimize final bundle size (Vite Build -> Nginx/Node Serve).

---

### 3. Progressive Web App (PWA) Implementation
EduReach is a fully compliant PWA, providing a "near-native" mobile experience.

#### A. Service Worker (sw.js)
- **Caching Strategies**:
    - **Network First**: Used for API calls and navigation to ensure students always see the latest data when online.
    - **Stale-While-Revalidate**: Used for static assets (styles, scripts, icons) to provide instant load times.
- **Offline Shell**: A dedicated `offline.html` is served when the network is unavailable and the requested page isn't in the cache.

#### B. Manifest & Integration
- **Standalone Mode**: Configured in `manifest.webmanifest` to remove browser UI, making the app feel like a native Android/iOS application.
- **Theming**: Dynamic theme colors (`#2f7d61`) and maskable icons for a premium look on all platforms.

---

### 4. Advanced Media Pipeline

#### A. Video Processing (FFmpeg)
- **H.264 Transcoding**: Automatically converts high-bitrate uploads into a web-optimized 720p H.264 format.
- **Audio Extraction**: Generates a dedicated `.m4a` audio stream for "Audio-Only" mode, reducing data consumption by up to 90%.
- **Intelligent Thumbnailing**: Automatically captures a frame at 00:01 as the lecture cover.

#### B. Document Intelligence
- **Text Extraction**: Uses `mammoth` (Word), `officeparser` (PPTX), and `pdf-parse` (PDF) to build a "Searchable Knowledge Base" from static uploads.
- **PDF Optimization**: Uses `pdf-lib` to linearize and compress PDF resources for faster mobile viewing.

---

### 5. AI Content Synthesis (Gemma-3-12b)
The system integrates with Google's latest Gemma-3-12b model to provide automated educational support:
- **Zero-Friction Summaries**: Generates key learning points and chapter summaries automatically.
- **Adaptive Quizzing**: Creates formal Quiz documents with multi-difficulty questions based on the extracted lecture text.
- **JSON Reliability**: Implements a "Prompt Injection + Manual Parser" fallback strategy to ensure valid data structures even when JSON-mode is unsupported by the model.

---

### 6. Security & Privacy Model
- **Staff-Only Drafts**: A robust backend filter ensures `isPublished: false` content is never leaked to students or guest users.
- **Secure Authentication**: Uses JWT (JSON Web Tokens) with cross-site protection.
- **RBAC (Role Based Access Control)**: Granular permissions for Admins, Teachers, and Students.

---

### 7. Environment & Persistence
- **Volume Mapping**: Docker volumes are used to persist `uploads/` and `mongodb_data/`, ensuring no data loss during container restarts.
- **Centralized Config**: A comprehensive `.env` system manages everything from AI Model selection to local storage paths.

---

**Report Finalized**: 2026-04-26
**Lead Architect**: antigravity AI
