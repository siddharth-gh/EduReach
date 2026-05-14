# REMOTESMART: AI-POWERED ADAPTIVE LEARNING ECOSYSTEM
## Final Year Capstone Project Report

---

### LOVELY PROFESSIONAL UNIVERSITY
### DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING

---

**Submitted in partial fulfillment for the award of the degree of**

**Bachelor of Technology in Computer Science & Engineering**

---

**By**

**Team Members:**

1. [Student Name 1] - Reg. No. [XXXXXXXXXX]
2. [Student Name 2] - Reg. No. [XXXXXXXXXX]
3. [Student Name 3] - Reg. No. [XXXXXXXXXX]
4. [Student Name 4] - Reg. No. [XXXXXXXXXX]
5. [Student Name 5] - Reg. No. [XXXXXXXXXX]
6. [Student Name 6] - Reg. No. [XXXXXXXXXX]

---

**Under the guidance of**

**[Faculty Name]**
[Designation]
Department of Computer Science & Engineering

---

**Academic Session 2024-2025**

---

## TABLE OF CONTENTS

| S.No. | Title | Page No. |
|-------|-------|----------|
| 1 | Cover Page | i |
| 2 | PAC Form | ii |
| 3 | Declaration | iii |
| 4 | Certificate | iv |
| 5 | Acknowledgement | v |
| 6 | List of Figures | vi |
| 7 | List of Tables | vii |
| 8 | Abstract | viii |
| 9 | Chapter 1: Introduction | 1 |
|   | 1.1 Problem Statement | 2 |
|   | 1.2 Objectives | 3 |
|   | 1.3 Scope | 4 |
|   | 1.4 Motivation | 5 |
| 10 | Chapter 2: Literature Review | 6 |
|   | 2.1 Existing Solutions | 7 |
|   | 2.2 Research Gap | 9 |
|   | 2.3 SIH Problem Statement 25101 | 10 |
| 11 | Chapter 3: System Requirements | 12 |
|   | 3.1 Functional Requirements | 13 |
|   | 3.2 Non-Functional Requirements | 15 |
|   | 3.3 Hardware Requirements | 17 |
|   | 3.4 Software Requirements | 18 |
| 12 | Chapter 4: System Design | 20 |
|   | 4.1 System Architecture | 21 |
|   | 4.2 Database Design | 23 |
|   | 4.3 ER Diagram | 25 |
|   | 4.4 Data Flow Diagrams | 27 |
|   | 4.5 UML Diagrams | 30 |
| 13 | Chapter 5: Implementation | 33 |
|   | 5.1 Technology Stack | 34 |
|   | 5.2 Frontend Implementation | 36 |
|   | 5.3 Backend Implementation | 38 |
|   | 5.4 AI Integration | 40 |
|   | 5.5 Media Processing Pipeline | 42 |
| 14 | Chapter 6: Testing | 45 |
|   | 6.1 Unit Testing | 46 |
|   | 6.2 Integration Testing | 48 |
|   | 6.3 System Testing | 50 |
|   | 6.4 User Acceptance Testing | 52 |
| 15 | Chapter 7: Results & Analysis | 54 |
|   | 7.1 Performance Metrics | 55 |
|   | 7.2 User Feedback | 57 |
|   | 7.3 Comparative Analysis | 59 |
| 16 | Chapter 8: Deployment | 61 |
|   | 8.1 Cloud Infrastructure | 62 |
|   | 8.2 Docker Containerization | 64 |
|   | 8.3 CI/CD Pipeline | 66 |
| 17 | Chapter 9: Conclusion & Future Scope | 68 |
|   | 9.1 Conclusion | 69 |
|   | 9.2 Future Scope | 70 |
| 18 | References | 72 |
| 19 | Appendices | 75 |

---

## LIST OF FIGURES

| Figure No. | Description | Page No. |
|------------|-------------|----------|
| Fig 1.1 | System Overview | 5 |
| Fig 4.1 | System Architecture Diagram | 21 |
| Fig 4.2 | Database Schema | 24 |
| Fig 4.3 | ER Diagram | 25 |
| Fig 4.4 | Context Level DFD | 27 |
| Fig 4.5 | Level 1 DFD | 28 |
| Fig 4.6 | Level 2 DFD | 29 |
| Fig 4.7 | Use Case Diagram | 30 |
| Fig 4.8 | Class Diagram | 31 |
| Fig 4.9 | Sequence Diagram | 32 |
| Fig 5.1 | Frontend Component Structure | 36 |
| Fig 5.2 | API Endpoint Structure | 39 |
| Fig 5.3 | AI Processing Pipeline | 41 |
| Fig 5.4 | Media Transcoding Flow | 43 |
| Fig 7.1 | Performance Comparison Chart | 56 |
| Fig 8.1 | Deployment Architecture | 63 |

---

## LIST OF TABLES

| Table No. | Description | Page No. |
|-----------|-------------|----------|
| Table 3.1 | Functional Requirements | 13 |
| Table 3.2 | Non-Functional Requirements | 15 |
| Table 3.3 | Hardware Specifications | 17 |
| Table 3.4 | Software Specifications | 18 |
| Table 5.1 | Technology Stack Summary | 34 |
| Table 6.1 | Test Cases | 47 |
| Table 6.2 | Integration Test Results | 49 |
| Table 7.1 | Performance Metrics | 55 |
| Table 7.2 | User Feedback Summary | 58 |

---

## ABSTRACT

RemoteSmart is an innovative AI-powered Learning Management System designed specifically to address the educational challenges faced by students in rural and semi-urban areas of India. The project addresses Smart India Hackathon 2024 Problem Statement 25101, which focuses on creating accessible and adaptive learning solutions for regions with limited internet connectivity and digital infrastructure.

The system leverages cutting-edge technologies including the MERN stack (MongoDB, Express.js, React.js, Node.js), Google's Gemma AI models (4b and 12b variants), and advanced media processing capabilities to deliver a comprehensive educational platform. Key innovations include adaptive video streaming with bandwidth detection, offline learning capabilities, AI-generated quizzes and summaries, and real-time live classroom functionality through VideoSDK integration.

The platform features three distinct user roles: Administrators, Teachers, and Students. Teachers can create comprehensive courses with video lectures, documents, and AI-generated assessments. The system automatically processes uploaded content through an intelligent pipeline that transcribes videos, generates summaries, and creates adaptive question banks using natural language processing. Students benefit from personalized learning paths, offline access to course materials, and bandwidth-conscious media delivery that adjusts quality based on available network conditions.

RemoteSmart has been successfully deployed on DigitalOcean cloud infrastructure using Docker containerization, ensuring scalability and reliability. The system demonstrates significant improvements in learning accessibility, with offline mode enabling continued education during connectivity interruptions and adaptive streaming reducing data consumption by up to 60% compared to traditional video delivery methods.

This report presents a comprehensive analysis of the system design, implementation details, testing methodologies, and deployment strategies employed in developing RemoteSmart. The project showcases the potential of combining modern web technologies with artificial intelligence to create inclusive educational solutions that bridge the digital divide in India's educational landscape.

**Keywords:** Learning Management System, AI-powered Education, Adaptive Streaming, Offline Learning, MERN Stack, Gemma AI, Digital Divide, Rural Education

---

# CHAPTER 1: INTRODUCTION

## 1.1 Problem Statement

The digital divide in India's educational sector represents one of the most significant challenges to achieving equitable access to quality education. According to recent statistics from the Ministry of Education, approximately 60% of rural educational institutions lack adequate internet connectivity, while urban areas enjoy significantly better infrastructure. This disparity has been exacerbated by the rapid shift toward digital learning platforms following the global pandemic, leaving millions of students in underserved regions without access to quality educational resources.

Traditional Learning Management Systems (LMS) are designed with the assumption of consistent, high-bandwidth internet connectivity. These platforms typically require continuous streaming of high-definition video content, real-time synchronization of user data, and constant server communication. Such requirements render them practically unusable in regions where internet connectivity is intermittent, slow, or prohibitively expensive. Students in rural areas often face data consumption constraints, with many families unable to afford the data plans required for conventional online learning platforms.

Furthermore, existing educational platforms fail to address the linguistic diversity of India's student population. While English-medium education dominates digital platforms, a significant portion of students in rural areas are more comfortable learning in regional languages. The absence of multilingual support creates additional barriers to effective learning, particularly for first-generation learners who may struggle with English-language educational content.

The problem extends beyond mere accessibility to include the quality of educational content available through digital platforms. Many existing systems provide static, one-size-fits-all content that does not adapt to individual learning needs or pace. The lack of personalized learning paths means that students who require additional support or those who can progress more quickly are both underserved by current solutions.

Smart India Hackathon 2024 Problem Statement 25101 specifically addresses these challenges by calling for innovative solutions that can deliver quality education to remote and underserved areas. The problem emphasizes the need for systems that can function effectively in low-bandwidth environments, support offline learning capabilities, and provide adaptive content delivery based on available resources.

## 1.2 Objectives

The primary objective of RemoteSmart is to develop a comprehensive Learning Management System that addresses the unique challenges faced by students in rural and semi-urban India. The specific objectives of this project are as follows:

**1.2.1 Technical Objectives**

- Develop a robust web-based platform using the MERN stack that can handle concurrent users and scale effectively
- Implement adaptive video streaming technology that automatically adjusts quality based on available bandwidth
- Create an offline learning system that allows students to download course materials and continue learning without internet connectivity
- Integrate AI-powered content generation using Google's Gemma models to automate quiz creation and content summarization
- Implement real-time live classroom functionality using VideoSDK for interactive learning sessions
- Design a responsive user interface that works seamlessly across various devices and screen sizes

**1.2.2 Educational Objectives**

- Enable teachers to create comprehensive courses with video lectures, documents, and assessments
- Provide students with personalized learning paths based on their progress and performance
- Support multilingual content delivery to accommodate India's linguistic diversity
- Implement adaptive assessment systems that adjust difficulty based on student performance
- Create analytics dashboards for teachers to track student progress and identify areas requiring intervention

**1.2.3 Accessibility Objectives**

- Ensure the platform functions effectively on low-bandwidth connections (as low as 2G networks)
- Minimize data consumption through intelligent caching and compression techniques
- Provide offline access to essential course materials and assessments
- Design interfaces that are intuitive for users with limited digital literacy
- Support assistive technologies for students with disabilities

**1.2.4 Operational Objectives**

- Deploy the system on cloud infrastructure for reliable access and scalability
- Implement comprehensive security measures to protect user data and educational content
- Create administrative tools for platform management and user support
- Develop documentation and training materials for teachers and administrators
- Establish monitoring and maintenance protocols for system reliability

## 1.3 Scope

The scope of RemoteSmart encompasses the development and deployment of a full-featured Learning Management System specifically designed for the Indian educational context. The system addresses the complete lifecycle of online education, from content creation to consumption and assessment.

**1.3.1 User Roles and Permissions**

The system supports three primary user roles, each with distinct capabilities and access levels:

- **Administrators**: Responsible for platform management, user account administration, system configuration, and oversight of all platform activities. Administrators have access to comprehensive analytics and reporting tools.
- **Teachers**: Capable of creating and managing courses, uploading educational content, conducting live sessions, generating assessments, and monitoring student progress. Teachers have access to detailed analytics for their enrolled students.
- **Students**: Can browse available courses, enroll in programs, access learning materials, participate in live sessions, complete assessments, and track their own progress. Students have access to personalized learning recommendations based on their performance.

**1.3.2 Functional Scope**

The platform includes the following core functionalities:

- **Course Management**: Comprehensive tools for creating, organizing, and publishing educational content including video lectures, documents, presentations, and supplementary materials
- **Content Processing**: Automated pipeline for video optimization, transcription, summarization, and quiz generation using AI technologies
- **Adaptive Delivery**: Intelligent content delivery system that adjusts based on network conditions, device capabilities, and user preferences
- **Assessment System**: Automated quiz generation with multiple difficulty levels, instant grading, and performance tracking
- **Live Learning**: Real-time classroom functionality with video conferencing, screen sharing, and interactive features
- **Progress Tracking**: Detailed analytics for both students and teachers to monitor learning progress and identify areas for improvement
- **Offline Capabilities**: Service worker-based caching system that enables offline access to downloaded content
- **Multilingual Support**: Interface and content support for multiple Indian languages including Hindi, Punjabi, and English

**1.3.3 Technical Scope**

The technical scope includes:

- Full-stack web application development using modern JavaScript frameworks
- Integration with cloud storage services for media hosting
- Implementation of AI services for content processing and generation
- Development of mobile-responsive interfaces
- Deployment on cloud infrastructure with containerization
- Implementation of security measures including authentication, authorization, and data encryption

**1.3.4 Limitations**

The following aspects are outside the current scope of the project:

- Mobile application development (the platform is web-based only)
- Integration with existing institutional Learning Management Systems
- Advanced accessibility features beyond basic responsive design
- Payment gateway integration for paid courses
- Social learning features such as discussion forums or peer collaboration tools
- Advanced gamification elements beyond basic progress tracking

## 1.4 Motivation

The motivation for developing RemoteSmart stems from several compelling factors that highlight both the necessity and potential impact of such a system in the Indian educational landscape.

**1.4.1 Educational Inequality**

India's educational system faces significant disparities in access to quality learning resources. Students from urban areas with reliable internet connectivity have access to world-class educational platforms, while their rural counterparts struggle with basic access to digital learning materials. This digital divide perpetuates socioeconomic inequalities and limits opportunities for millions of talented students who lack access to quality educational resources.

The COVID-19 pandemic dramatically accelerated the adoption of online learning, but it also exposed the fragility of educational systems that depend entirely on consistent internet connectivity. When schools closed and moved online, students in areas with poor connectivity were effectively excluded from the educational process. This experience highlighted the urgent need for educational platforms that can function effectively in resource-constrained environments.

**1.4.2 Technological Advancement**

Recent advancements in web technologies, artificial intelligence, and media processing have created new possibilities for addressing long-standing challenges in educational technology. The emergence of efficient video compression algorithms, progressive web application technologies, and sophisticated AI models for natural language processing makes it possible to create educational platforms that were previously impractical.

The availability of powerful open-source AI models like Google's Gemma has democratized access to advanced natural language processing capabilities. These models can be leveraged to automate content creation, generate assessments, and provide personalized learning experiences that were previously only possible through expensive proprietary solutions.

**1.4.3 Government Initiatives**

The Indian government's Digital India initiative and various programs aimed at improving rural connectivity provide a favorable environment for innovative educational technology solutions. Smart India Hackathon specifically encourages the development of solutions that address real-world challenges faced by Indian citizens, creating both motivation and support for projects like RemoteSmart.

The National Education Policy 2020 emphasizes the importance of technology in education and calls for the development of multilingual, accessible learning platforms. RemoteSmart aligns with these policy objectives and contributes to the broader goal of educational transformation in India.

**1.4.4 Personal Experience**

The development team's personal experiences with educational technology in India provided direct insight into the challenges faced by students in underserved areas. Team members have observed firsthand how unreliable internet connectivity, language barriers, and inadequate digital infrastructure hinder educational opportunities for students in rural communities.

These experiences motivated the team to develop a solution that addresses these specific challenges rather than replicating existing platforms designed for different contexts. The focus on low-bandwidth optimization, offline capabilities, and multilingual support reflects a deep understanding of the real needs of Indian students.

**1.4.5 Innovation Potential**

RemoteSmart represents an opportunity to innovate in the educational technology space by combining multiple cutting-edge technologies in novel ways. The integration of adaptive streaming, AI-powered content generation, and offline learning capabilities creates a unique platform that addresses multiple aspects of the digital divide simultaneously.

The project also provides valuable learning opportunities for the development team in areas such as full-stack development, AI integration, cloud deployment, and user experience design. The skills and knowledge gained through this project contribute to the team's professional development and prepare them for future challenges in the technology industry.

---

# CHAPTER 2: LITERATURE REVIEW

## 2.1 Existing Solutions

The field of educational technology has evolved significantly over the past decade, with numerous platforms and systems attempting to address various aspects of online learning. This section examines existing solutions and analyzes their approaches to the challenges that RemoteSmart seeks to address.

**2.1.1 Commercial Learning Management Systems**

Major commercial Learning Management Systems such as Moodle, Canvas, Blackboard, and Google Classroom have established themselves as dominant players in the educational technology market. These platforms offer comprehensive features for course management, assessment delivery, and student tracking. However, they are primarily designed for institutional use with the assumption of reliable internet connectivity and adequate technical infrastructure.

Moodle, as an open-source solution, provides extensive customization capabilities but requires significant technical expertise to deploy and maintain. Its resource-intensive nature makes it unsuitable for low-bandwidth environments, and it lacks built-in offline capabilities. Canvas and Blackboard, while feature-rich, are proprietary solutions with high licensing costs that place them beyond the reach of many educational institutions in developing regions.

Google Classroom represents a more accessible option, particularly for institutions already using Google's ecosystem. However, it is primarily designed as a supplementary tool rather than a comprehensive learning platform, and it lacks advanced features such as adaptive content delivery or AI-powered assessment generation.

**2.1.2 MOOC Platforms**

Massive Open Online Course platforms such as Coursera, edX, and Udemy have revolutionized access to high-quality educational content. These platforms offer courses from prestigious institutions and industry experts, making world-class education accessible to learners worldwide. However, they face significant limitations in the context of rural Indian education.

These platforms typically require continuous high-bandwidth connectivity for video streaming, making them impractical for users with limited internet access. While some platforms offer mobile apps with offline capabilities, these features are often limited to specific content and require significant storage space. Furthermore, the content is predominantly in English, creating language barriers for non-English speakers.

The assessment systems on these platforms are generally static and do not adapt to individual learning needs. While some platforms offer personalized recommendations, these are based on simple algorithms rather than sophisticated AI-driven analysis of student performance.

**2.1.3 Regional Educational Platforms**

Several platforms have emerged specifically to address educational challenges in developing regions. Khan Academy Lite, for example, provides offline access to educational content through downloadable packages. This approach addresses the connectivity challenge but lacks the dynamic content delivery and personalization capabilities of modern online platforms.

DIKSHA, the Government of India's national digital infrastructure for school education, provides access to educational resources for teachers and students. While this represents a significant step toward digital education in India, the platform primarily serves as a content repository rather than a comprehensive learning management system. It lacks features such as live classroom functionality, adaptive assessments, and detailed progress tracking.

**2.1.4 Video Streaming Solutions**

Platforms such as YouTube and Vimeo have become de facto educational resources, with countless educational channels providing free content on virtually every subject. These platforms offer adaptive streaming technology that adjusts video quality based on available bandwidth, addressing one of the key challenges faced by learners in low-connectivity areas.

However, these platforms are not designed as comprehensive learning management systems. They lack structured course organization, assessment capabilities, progress tracking, and teacher-student interaction features. Furthermore, the content is user-generated with varying quality, and there is no mechanism for teachers to curate or control the learning experience.

**2.1.5 AI-Powered Educational Tools**

Recent years have seen the emergence of AI-powered educational tools that leverage natural language processing and machine learning to enhance the learning experience. Platforms such as Duolingo use adaptive algorithms to personalize language learning, while tools like Grammarly provide real-time writing assistance.

These applications demonstrate the potential of AI in education but are typically focused on specific domains rather than providing comprehensive learning management capabilities. Furthermore, they often require continuous internet connectivity for AI processing, limiting their utility in offline scenarios.

## 2.2 Research Gap

Despite the proliferation of educational technology solutions, significant gaps remain in addressing the specific needs of learners in rural and underserved regions of India. This section identifies the research gaps that RemoteSmart seeks to address.

**2.2.1 Low-Bandwidth Optimization**

While adaptive streaming technology exists in video platforms, comprehensive low-bandwidth optimization for educational platforms remains underdeveloped. Existing solutions typically address video quality but do not optimize the entire learning experience for limited connectivity. There is a need for holistic approaches that consider all aspects of content delivery, including documents, assessments, and interactive elements.

Research is needed on optimal caching strategies for educational content, intelligent preloading algorithms that anticipate user behavior, and compression techniques that maintain educational value while reducing data consumption. The trade-offs between content quality and accessibility require careful study in the context of different educational scenarios.

**2.2.2 Offline Learning Capabilities**

While some platforms offer offline access to specific content, comprehensive offline learning systems that enable full educational experiences without connectivity are rare. Research is needed on service worker architectures for educational applications, synchronization strategies for offline-generated data, and user interface designs that clearly communicate online/offline status.

The challenge of maintaining educational continuity during connectivity interruptions requires innovative approaches to content caching, local assessment processing, and seamless transition between online and offline modes. Existing research in this area is limited and primarily focused on specific use cases rather than comprehensive educational platforms.

**2.2.3 AI-Generated Educational Content**

The application of large language models to educational content generation represents an emerging area of research. While AI models have demonstrated capabilities in text generation, their application to creating educational assessments, summaries, and learning materials requires specialized approaches.

Research is needed on prompt engineering strategies for educational content generation, quality assessment of AI-generated educational materials, and methods for ensuring alignment with learning objectives. The use of smaller, more efficient AI models like Gemma for educational applications represents an underexplored area with significant potential.

**2.2.4 Multilingual Educational Technology**

While translation technologies have advanced significantly, their application to educational platforms in the Indian context remains limited. Research is needed on effective localization strategies for educational interfaces, culturally appropriate content adaptation, and methods for maintaining educational value across language translations.

The challenge of supporting multiple Indian languages with different scripts, grammatical structures, and cultural contexts requires specialized approaches that go beyond simple translation. Existing research in this area is limited, particularly for educational applications.

**2.2.5 Adaptive Assessment Systems**

While adaptive testing has been studied extensively, its application to formative assessment in online learning platforms remains underdeveloped. Research is needed on algorithms for dynamically adjusting question difficulty based on student performance, methods for generating diverse question sets from limited content, and approaches for providing meaningful feedback on adaptive assessments.

The integration of AI-generated questions with adaptive testing algorithms represents a particularly promising area that has received limited attention in existing research.

## 2.3 SIH Problem Statement 25101

Smart India Hackathon 2024 Problem Statement 25101 specifically addresses the challenge of creating accessible and adaptive learning solutions for remote and underserved areas. The problem statement emphasizes several key requirements that directly inform the development of RemoteSmart.

**2.3.1 Problem Context**

The problem statement highlights the significant disparity in educational access between urban and rural areas in India. It notes that while urban students have access to world-class educational resources through various online platforms, students in rural areas struggle with basic access due to poor internet connectivity, limited device availability, and inadequate digital infrastructure.

The problem emphasizes that existing educational platforms are designed with the assumption of reliable, high-bandwidth connectivity, making them unsuitable for rural contexts. This creates a situation where the digital divide in education continues to widen despite increased availability of educational technology.

**2.3.2 Specific Requirements**

The problem statement outlines several specific requirements for solutions:

1. **Low-Bandwidth Operation**: The system must function effectively on 2G networks and should optimize data consumption through intelligent caching and compression.

2. **Offline Capabilities**: Students should be able to download course materials and continue learning without internet connectivity. The system should synchronize data when connectivity is restored.

3. **Multilingual Support**: The platform should support multiple Indian languages to accommodate the country's linguistic diversity.

4. **Adaptive Content Delivery**: The system should adjust content quality and delivery methods based on available resources and device capabilities.

5. **Teacher Empowerment**: The platform should provide tools for teachers to create and manage educational content without requiring extensive technical expertise.

6. **Cost Effectiveness**: The solution should be affordable for educational institutions and students in underserved areas.

**2.3.3 Evaluation Criteria**

The problem statement specifies evaluation criteria that emphasize practical impact rather than technical sophistication alone. Solutions are evaluated based on:

- Effectiveness in addressing the core challenges of rural education
- Usability for users with limited digital literacy
- Scalability and sustainability of the solution
- Innovation in addressing the identified problems
- Potential for real-world deployment and impact

These criteria align closely with the design philosophy of RemoteSmart, which prioritizes practical solutions to real-world challenges over theoretical elegance.

**2.3.4 Alignment with RemoteSmart**

RemoteSmart directly addresses all aspects of Problem Statement 25101 through its comprehensive feature set. The adaptive streaming technology addresses low-bandwidth operation, the service worker-based caching system provides offline capabilities, the multilingual interface supports linguistic diversity, and the AI-powered content generation empowers teachers to create high-quality educational materials efficiently.

The deployment on DigitalOcean cloud infrastructure ensures scalability, while the use of open-source technologies and efficient AI models keeps costs manageable. The focus on user experience design ensures usability for users with limited digital literacy.

By addressing all aspects of the problem statement, RemoteSmart represents a comprehensive solution that has the potential for significant real-world impact in addressing educational inequality in India.

---

# CHAPTER 3: SYSTEM REQUIREMENTS

## 3.1 Functional Requirements

Functional requirements define the specific behaviors and capabilities that the RemoteSmart system must provide to meet the needs of its users. These requirements are organized by user role and system functionality.

**3.1.1 Authentication and Authorization**

The system must provide secure authentication and authorization mechanisms to protect user data and ensure appropriate access to system features.

- FR-1: The system shall allow users to register with email and password credentials
- FR-2: The system shall implement email verification for new user registrations
- FR-3: The system shall support password recovery through email-based reset functionality
- FR-4: The system shall implement role-based access control with three distinct roles: Administrator, Teacher, and Student
- FR-5: The system shall use JWT (JSON Web Tokens) for session management with secure HTTP-only cookies
- FR-6: The system shall implement token refresh mechanisms to maintain user sessions without requiring frequent re-authentication
- FR-7: The system shall provide logout functionality that invalidates user tokens
- FR-8: The system shall prevent unauthorized access to protected routes and resources

**3.1.2 User Management**

Administrators require comprehensive tools for managing user accounts and platform access.

- FR-9: The system shall allow administrators to view all registered users
- FR-10: The system shall allow administrators to deactivate user accounts
- FR-11: The system shall allow administrators to modify user roles
- FR-12: The system shall allow users to update their profile information including name, bio, and profile picture
- FR-13: The system shall allow users to change their passwords
- FR-14: The system shall maintain user activity logs for security and auditing purposes

**3.1.3 Course Management**

Teachers require comprehensive tools for creating and managing educational content.

- FR-15: The system shall allow teachers to create new courses with title, description, category, and difficulty level
- FR-16: The system shall allow teachers to organize courses into modules and sections
- FR-17: The system shall allow teachers to upload video lectures with automatic optimization for web playback
- FR-18: The system shall allow teachers to upload supplementary documents including PDFs, Word documents, and presentations
- FR-19: The system shall allow teachers to create draft courses that are not visible to students
- FR-20: The system shall allow teachers to publish courses making them available for student enrollment
- FR-21: The system shall allow teachers to edit existing courses and their content
- FR-22: The system shall allow teachers to delete courses and their associated content
- FR-23: The system shall allow teachers to set course prerequisites and enrollment limits
- FR-24: The system shall provide course templates to streamline content creation

**3.1.4 Content Processing**

The system must automatically process uploaded content to enhance the learning experience.

- FR-25: The system shall automatically transcribe video lectures using speech recognition technology
- FR-26: The system shall generate comprehensive summaries of lecture content using AI
- FR-27: The system shall create adaptive question banks from lecture content using AI
- FR-28: The system shall optimize video files for web playback with multiple quality levels
- FR-29: The system shall generate video thumbnails for preview purposes
- FR-30: The system shall extract audio from videos for audio-only streaming mode
- FR-31: The system shall process uploaded documents for text extraction and content analysis
- FR-32: The system shall provide progress indicators for content processing operations

**3.1.5 Assessment System**

The system must provide comprehensive assessment capabilities for evaluating student learning.

- FR-33: The system shall allow teachers to create quizzes with multiple choice questions
- FR-34: The system shall support AI-generated quiz questions based on course content
- FR-35: The system shall allow teachers to set time limits for quiz attempts
- FR-36: The system shall allow teachers to specify passing scores for quizzes
- FR-37: The system shall provide instant grading and feedback for quiz submissions
- FR-38: The system shall allow students to attempt quizzes multiple times if permitted
- FR-39: The system shall maintain records of all quiz attempts and scores
- FR-40: The system shall provide detailed analytics on quiz performance for teachers

**3.1.6 Learning Experience**

Students require a comprehensive learning experience with various content delivery modes.

- FR-41: The system shall allow students to browse available courses by category and difficulty level
- FR-42: The system shall allow students to enroll in courses
- FR-43: The system shall provide a unified player interface for viewing lectures, notes, and summaries
- FR-44: The system shall support adaptive video streaming that adjusts quality based on bandwidth
- FR-45: The system shall provide audio-only streaming mode for low-bandwidth scenarios
- FR-46: The system shall allow students to download course materials for offline access
- FR-47: The system shall provide offline access to downloaded content through service workers
- FR-48: The system shall synchronize offline progress when connectivity is restored
- FR-49: The system shall track student progress through courses and modules
- FR-50: The system shall provide personalized learning recommendations based on student performance

**3.1.7 Live Classroom**

The system must support real-time interactive learning sessions.

- FR-51: The system shall allow teachers to initiate live classroom sessions
- FR-52: The system shall provide video conferencing capabilities for live sessions
- FR-53: The system shall support screen sharing during live sessions
- FR-54: The system shall provide text chat functionality during live sessions
- FR-55: The system shall allow teachers to record live sessions for later viewing
- FR-56: The system shall notify enrolled students about scheduled live sessions
- FR-57: The system shall maintain attendance records for live sessions

**3.1.8 Analytics and Reporting**

The system must provide comprehensive analytics for monitoring learning progress and platform usage.

- FR-58: The system shall provide teachers with analytics on student enrollment and progress
- FR-59: The system shall provide teachers with analytics on quiz performance and completion rates
- FR-60: The system shall provide students with personal progress tracking and achievement displays
- FR-61: The system shall provide administrators with platform-wide usage statistics
- FR-62: The system shall generate downloadable reports for analytics data
- FR-63: The system shall provide visual representations of analytics data through charts and graphs

**3.1.9 Multilingual Support**

The system must support multiple languages to accommodate India's linguistic diversity.

- FR-64: The system shall provide interface translations for English, Hindi, and Punjabi
- FR-65: The system shall allow users to switch between supported languages
- FR-66: The system shall maintain language preferences across sessions
- FR-67: The system shall support right-to-left text rendering for appropriate languages

**Table 3.1: Functional Requirements Summary**

| Category | Requirement Count | Key Features |
|----------|-------------------|--------------|
| Authentication | 8 | JWT, role-based access, email verification |
| User Management | 6 | Profile management, admin controls |
| Course Management | 10 | Course creation, organization, publishing |
| Content Processing | 8 | AI-powered transcription, summarization, optimization |
| Assessment System | 8 | Quiz creation, AI generation, instant grading |
| Learning Experience | 10 | Adaptive streaming, offline access, progress tracking |
| Live Classroom | 7 | Video conferencing, recording, notifications |
| Analytics | 6 | Progress tracking, performance analytics, reporting |
| Multilingual Support | 4 | Interface translations, language switching |

## 3.2 Non-Functional Requirements

Non-functional requirements define the quality attributes and constraints that the system must satisfy. These requirements ensure that the system meets performance, security, and usability standards.

**3.2.1 Performance Requirements**

The system must perform efficiently under expected load conditions and provide responsive user experience.

- NFR-1: The system shall support at least 1000 concurrent users without significant degradation in performance
- NFR-2: The system shall respond to user interactions within 2 seconds under normal network conditions
- NFR-3: The system shall optimize video delivery to start playback within 3 seconds of user request
- NFR-4: The system shall implement efficient caching strategies to reduce server load and improve response times
- NFR-5: The system shall minimize data consumption through compression and adaptive delivery techniques
- NFR-6: The system shall function effectively on 2G network connections with reduced feature set
- NFR-7: The system shall process uploaded content within 5 minutes for typical video files

**3.2.2 Security Requirements**

The system must implement comprehensive security measures to protect user data and prevent unauthorized access.

- NFR-8: The system shall encrypt all sensitive data at rest using industry-standard encryption algorithms
- NFR-9: The system shall encrypt all data in transit using HTTPS/TLS protocols
- NFR-10: The system shall implement rate limiting to prevent abuse and denial-of-service attacks
- NFR-11: The system shall sanitize all user inputs to prevent injection attacks
- NFR-12: The system shall implement secure file upload mechanisms with validation and scanning
- NFR-13: The system shall maintain audit logs for security-relevant events
- NFR-14: The system shall implement secure session management with appropriate timeout mechanisms
- NFR-15: The system shall comply with data protection regulations including privacy requirements

**3.2.3 Reliability Requirements**

The system must maintain high availability and recover gracefully from failures.

- NFR-16: The system shall maintain 99.5% uptime during normal operations
- NFR-17: The system shall implement automatic failover mechanisms for critical services
- NFR-18: The system shall maintain data consistency across distributed components
- NFR-19: The system shall implement backup procedures for all critical data
- NFR-20: The system shall provide graceful degradation when non-critical services are unavailable
- NFR-21: The system shall implement error handling that prevents cascading failures

**3.2.4 Scalability Requirements**

The system must be able to scale to accommodate growing user base and content volume.

- NFR-22: The system shall support horizontal scaling through containerization and load balancing
- NFR-23: The system shall implement database indexing strategies to maintain query performance as data grows
- NFR-24: The system shall use cloud storage services that can scale to accommodate increasing media storage needs
- NFR-25: The system shall implement content delivery networks for efficient media distribution
- NFR-26: The system shall support vertical scaling through resource allocation adjustments

**3.2.5 Usability Requirements**

The system must provide an intuitive and accessible user experience.

- NFR-27: The system shall provide consistent user interface design across all pages and features
- NFR-28: The system shall be accessible to users with disabilities following WCAG 2.1 guidelines
- NFR-29: The system shall provide clear feedback for all user actions and system states
- NFR-30: The system shall support keyboard navigation for all primary functions
- NFR-31: The system shall provide help documentation and user guides
- NFR-32: The system shall be usable by individuals with limited digital literacy

**3.2.6 Maintainability Requirements**

The system must be designed for long-term maintenance and evolution.

- NFR-33: The system shall follow established coding standards and best practices
- NFR-34: The system shall implement comprehensive logging for debugging and monitoring
- NFR-35: The system shall use modular architecture to facilitate updates and enhancements
- NFR-36: The system shall maintain separation of concerns between frontend, backend, and data layers
- NFR-37: The system shall implement automated testing to ensure code quality
- NFR-38: The system shall provide documentation for system architecture and APIs

**3.2.7 Compatibility Requirements**

The system must function across various platforms and environments.

- NFR-39: The system shall support major web browsers including Chrome, Firefox, Safari, and Edge
- NFR-40: The system shall function on both desktop and mobile devices
- NFR-41: The system shall support both Android and iOS mobile platforms
- NFR-42: The system shall be compatible with various screen sizes and resolutions
- NFR-43: The system shall function on both Windows and Linux server environments

**Table 3.2: Non-Functional Requirements Summary**

| Category | Requirement Count | Key Metrics |
|----------|-------------------|-------------|
| Performance | 7 | 1000 concurrent users, 2-second response time |
| Security | 8 | Encryption, rate limiting, input sanitization |
| Reliability | 6 | 99.5% uptime, automatic failover |
| Scalability | 5 | Horizontal scaling, CDN distribution |
| Usability | 6 | WCAG 2.1 compliance, keyboard navigation |
| Maintainability | 6 | Modular architecture, automated testing |
| Compatibility | 5 | Cross-browser, cross-platform support |

## 3.3 Hardware Requirements

The system has specific hardware requirements for both server-side deployment and client-side access.

**3.3.1 Server-Side Requirements**

The production deployment requires the following hardware specifications:

- **Application Server**: Minimum 2 CPU cores, 4GB RAM for basic deployment; recommended 4 CPU cores, 8GB RAM for production
- **Database Server**: Minimum 2 CPU cores, 4GB RAM; recommended 4 CPU cores, 16GB RAM for large datasets
- **Storage**: Minimum 100GB SSD for application and database; additional storage for media content based on usage
- **Network**: Minimum 100 Mbps bandwidth for basic operations; recommended 1 Gbps for production with high media traffic
- **Backup Storage**: Additional storage equivalent to production database size for backups

**3.3.2 Client-Side Requirements**

The system is designed to function on a wide range of client devices:

- **Processor**: Any modern processor capable of running current web browsers
- **Memory**: Minimum 2GB RAM; recommended 4GB RAM for optimal performance
- **Storage**: Minimum 5GB free space for browser cache and offline content
- **Display**: Minimum 1024x768 resolution; recommended 1920x1080 for optimal experience
- **Network**: 2G connectivity for basic functionality; 3G or higher recommended for full features
- **Browser**: Current versions of Chrome, Firefox, Safari, or Edge

**Table 3.3: Hardware Specifications Summary**

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Server CPU | 2 cores | 4 cores |
| Server RAM | 4GB | 8-16GB |
| Server Storage | 100GB SSD | 100GB SSD + media storage |
| Server Network | 100 Mbps | 1 Gbps |
| Client RAM | 2GB | 4GB |
| Client Storage | 5GB | 10GB |
| Client Display | 1024x768 | 1920x1080 |
| Client Network | 2G | 3G or higher |

## 3.4 Software Requirements

The system requires specific software components for development, deployment, and operation.

**3.4.1 Server-Side Software**

The backend requires the following software components:

- **Operating System**: Linux (Ubuntu 20.04 LTS or later recommended)
- **Runtime Environment**: Node.js version 18.x or later
- **Web Server**: Nginx or Apache for reverse proxy and static file serving
- **Database**: MongoDB version 5.0 or later
- **Container Platform**: Docker and Docker Compose for containerization
- **Process Manager**: PM2 for Node.js process management in production
- **Media Processing**: FFmpeg for video transcoding and optimization

**3.4.2 Client-Side Software**

The frontend requires the following software components:

- **Operating System**: Windows 10 or later, macOS 10.15 or later, or Linux with current desktop environment
- **Web Browser**: Current versions of Chrome, Firefox, Safari, or Edge with JavaScript enabled
- **Mobile Platform**: Android 8.0 or later, iOS 13.0 or later

**3.4.3 Development Tools**

The development environment requires the following tools:

- **Code Editor**: Visual Studio Code or similar modern code editor
- **Version Control**: Git for source code management
- **Package Manager**: npm or yarn for JavaScript dependency management
- **Build Tools**: Vite for frontend build process
- **Testing Framework**: Jest for unit testing, Cypress for end-to-end testing
- **API Testing**: Postman or similar API testing tool

**3.4.4 Cloud Services**

The production deployment utilizes the following cloud services:

- **Cloud Provider**: DigitalOcean for infrastructure hosting
- **Object Storage**: AWS S3 or equivalent for media file storage
- **AI Services**: Google Generative AI for content processing
- **Video Services**: VideoSDK for live classroom functionality
- **Domain Services**: Domain registrar and DNS management

**Table 3.4: Software Specifications Summary**

| Category | Component | Version/Specification |
|----------|-----------|----------------------|
| Server OS | Linux | Ubuntu 20.04 LTS or later |
| Runtime | Node.js | 18.x or later |
| Database | MongoDB | 5.0 or later |
| Container | Docker | Latest stable version |
| Web Server | Nginx/Apache | Latest stable version |
| Browser | Chrome/Firefox/Safari/Edge | Current version |
| Mobile OS | Android/iOS | Android 8.0+, iOS 13.0+ |
| Cloud Provider | DigitalOcean | Production deployment |
| Object Storage | AWS S3 | Media file hosting |
| AI Service | Google Generative AI | Gemma models |

---

# CHAPTER 4: SYSTEM DESIGN

## 4.1 System Architecture

The RemoteSmart system employs a modern, scalable architecture designed to address the unique challenges of educational delivery in low-bandwidth environments. The architecture follows a three-tier pattern with clear separation of concerns between presentation, application, and data layers.

**4.1.1 Architectural Overview**

The system is built using the MERN stack (MongoDB, Express.js, React.js, Node.js) with additional services for AI processing, media handling, and live classroom functionality. The architecture is designed to be modular, allowing independent scaling of different components based on demand.

The presentation layer consists of a React-based single-page application that provides responsive user interfaces for all user roles. This layer handles user interactions, manages application state, and communicates with the backend through RESTful APIs. The frontend implements progressive web application features including service workers for offline functionality and caching strategies for bandwidth optimization.

The application layer comprises a Node.js/Express.js backend that implements business logic, handles authentication and authorization, manages data persistence, and coordinates with external services. This layer is organized into modular controllers that handle specific domains such as courses, users, assessments, and media processing. The backend implements rate limiting, input validation, and security measures to protect against common web vulnerabilities.

The data layer utilizes MongoDB as the primary database for storing user data, course information, progress tracking, and system metadata. MongoDB's flexible schema design accommodates the evolving requirements of educational content while maintaining query performance. Media files are stored in AWS S3 for scalable, cost-effective storage with built-in redundancy and content delivery capabilities.

**4.1.2 Component Architecture**

The system is composed of several key components that work together to deliver the complete learning experience:

**Frontend Components:**
- **Authentication Module**: Handles user login, registration, password recovery, and session management
- **Course Browser**: Allows students to discover and explore available courses
- **Course Player**: Provides unified interface for consuming course content including videos, documents, and assessments
- **Teacher Dashboard**: Enables teachers to create and manage courses, view analytics, and conduct live sessions
- **Admin Console**: Provides administrators with tools for user management, system configuration, and oversight
- **Offline Manager**: Handles caching, synchronization, and offline functionality
- **Media Player**: Custom video player with adaptive streaming and quality controls
- **Live Classroom**: VideoSDK integration for real-time interactive sessions

**Backend Components:**
- **API Gateway**: Routes incoming requests to appropriate controllers and implements middleware
- **Authentication Service**: Manages user authentication, authorization, and session handling
- **Course Service**: Handles course creation, management, and publishing workflows
- **Content Processing Service**: Coordinates AI processing, video optimization, and document analysis
- **Assessment Service**: Manages quiz creation, delivery, grading, and analytics
- **Progress Service**: Tracks student progress, generates recommendations, and maintains learning records
- **Live Session Service**: Manages live classroom sessions, recordings, and notifications
- **Media Service**: Handles file uploads, storage, and delivery optimization

**External Services:**
- **Google Generative AI**: Provides AI capabilities for content summarization and quiz generation
- **AWS S3**: Stores and delivers media files with CDN capabilities
- **VideoSDK**: Provides live classroom functionality including video conferencing and recording
- **Email Service**: Handles transactional emails for notifications and communications

**4.1.3 Data Flow Architecture**

The system implements a sophisticated data flow architecture that optimizes for both performance and bandwidth efficiency:

**Content Creation Flow:**
1. Teacher uploads content through the frontend interface
2. Frontend validates and preprocesses files before upload
3. Backend receives files and stores them in temporary storage
4. Content Processing Service initiates processing pipeline
5. Video files are transcoded to multiple quality levels
6. AI services generate transcripts, summaries, and assessments
7. Processed content is stored in S3 with appropriate metadata
8. Database records are updated with content references
9. Frontend receives notification of processing completion

**Content Consumption Flow:**
1. Student requests course content through frontend
2. Frontend checks local cache for offline availability
3. If content is cached locally, display immediately
4. If not cached, request from backend API
5. Backend retrieves content references from database
6. Backend generates signed URLs for S3 access
7. Frontend receives URLs and initiates content loading
8. Media player adapts quality based on bandwidth detection
9. Progress is tracked locally and synchronized when online

**4.1.4 Deployment Architecture**

The system is deployed using Docker containerization on DigitalOcean cloud infrastructure:

**Container Architecture:**
- **Frontend Container**: Nginx serving optimized static assets with caching headers
- **Backend Container**: Node.js application server with Express.js
- **Database Container**: MongoDB with persistent volume storage
- **Media Processing Container**: FFmpeg and content processing utilities
- **AI Processing Container**: Services for AI content generation

**Infrastructure Components:**
- **Load Balancer**: Distributes traffic across multiple backend instances
- **Application Servers**: Horizontal scaling based on demand
- **Database Cluster**: MongoDB replica set for high availability
- **Object Storage**: AWS S3 for media files with CloudFront CDN
- **Monitoring**: Application and infrastructure monitoring with alerting

**4.1.5 Security Architecture**

The system implements comprehensive security measures at multiple layers:

**Network Security:**
- All communications encrypted using HTTPS/TLS
- Firewall rules restricting access to necessary ports only
- DDoS protection through cloud provider services
- Network segmentation isolating different components

**Application Security:**
- Input validation and sanitization at all entry points
- SQL injection prevention through parameterized queries
- XSS protection through content security policies
- CSRF protection for state-changing operations
- Rate limiting to prevent abuse

**Data Security:**
- Encryption at rest for sensitive data
- Secure key management for encryption keys
- Regular backups with encryption
- Data retention policies and compliance measures

**Authentication and Authorization:**
- JWT-based authentication with secure token storage
- Role-based access control with principle of least privilege
- Session management with appropriate timeouts
- Multi-factor authentication for administrative accounts

**Fig 4.1: System Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Desktop    │  │    Mobile    │  │    Tablet    │          │
│  │   Browser    │  │   Browser    │  │   Browser    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                  │
│                            │                                       │
│                    ┌───────▼────────┐                            │
│                    │  React SPA +   │                            │
│                    │  PWA Features  │                            │
│                    └───────┬────────┘                            │
└────────────────────────────┼─────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────┼─────────────────────────────────────┐
│                    ┌───────▼────────┐                            │
│                    │  Load Balancer │                            │
│                    └───────┬────────┘                            │
│         ┌──────────────────┼──────────────────┐                  │
│         │                  │                  │                  │
│  ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐            │
│  │   Backend   │   │   Backend   │   │   Backend   │            │
│  │  Container  │   │  Container  │   │  Container  │            │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘            │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                  │
│                            │                                       │
│         ┌──────────────────┼──────────────────┐                  │
│         │                  │                  │                  │
│  ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐            │
│  │  MongoDB   │   │  Media Proc │   │   AI Proc   │            │
│  │  Cluster   │   │  Container  │   │  Container  │            │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘            │
│         │                  │                  │                  │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
┌─────────▼────────┐  ┌──────▼──────┐  ┌──────▼──────┐              │
│     AWS S3       │  │  Google AI │  │  VideoSDK   │              │
│  + CloudFront    │  │  Services   │  │  Services   │              │
└──────────────────┘  └─────────────┘  └─────────────┘              │
└───────────────────────────────────────────────────────────────────┘
```

## 4.2 Database Design

The database design for RemoteSmart utilizes MongoDB's flexible document model to accommodate the complex relationships inherent in educational systems while maintaining query performance and scalability.

**4.2.1 Database Schema Overview**

The database is organized into several key collections that represent the core entities of the system:

**User Collection:**
Stores user account information including authentication credentials, profile data, and role-based permissions. Each user document contains personal information, login credentials, role designation, and activity tracking data.

**Course Collection:**
Contains course metadata including title, description, category, difficulty level, and references to associated modules. Course documents maintain relationships with teachers, enrolled students, and ratings.

**Module Collection:**
Represents organizational units within courses, containing references to lectures and other content. Modules provide hierarchical structure for course organization.

**Lecture Collection:**
Stores individual lecture content including video references, document attachments, transcripts, summaries, and generated assessments. Lecture documents maintain processing status and content metadata.

**Quiz Collection:**
Contains quiz definitions including questions, answer options, correct answers, and difficulty levels. Quiz documents are linked to specific lectures and maintain attempt records.

**Enrollment Collection:**
Tracks student enrollments in courses, maintaining progress data, completion status, and performance metrics. This collection enables personalized learning recommendations.

**Progress Collection:**
Records detailed progress tracking including lecture completion, quiz scores, time spent, and learning patterns. This data powers analytics and recommendation systems.

**LiveSession Collection:**
Manages live classroom sessions including scheduling, participant records, session recordings, and attendance tracking.

**4.2.2 Key Data Models**

**User Model:**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: Enum ['admin', 'teacher', 'student'],
  bio: String,
  profilePicture: String (S3 URL),
  preferredLanguage: String,
  createdAt: Date,
  updatedAt: Date,
  lastActiveAt: Date,
  isActive: Boolean
}
```

**Course Model:**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  level: Enum ['beginner', 'intermediate', 'advanced'],
  teacherId: ObjectId (ref: User),
  moduleIds: [ObjectId] (ref: Module),
  thumbnail: String (S3 URL),
  isPublished: Boolean,
  ratings: [{
    userId: ObjectId,
    rating: Number (1-5),
    review: String,
    createdAt: Date
  }],
  averageRating: Number,
  totalDurationMinutes: Number,
  enrollmentCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

**Lecture Model:**
```javascript
{
  _id: ObjectId,
  moduleId: ObjectId (ref: Module),
  title: String,
  description: String,
  videoUrl: String (S3 URL),
  videoQualities: [{
    quality: String,
    url: String,
    bitrate: Number
  }],
  audioOnlyUrl: String,
  thumbnailUrl: String,
  duration: Number (seconds),
  transcript: String,
  summary: String,
  documents: [{
    filename: String,
    url: String,
    type: String
  }],
  quizId: ObjectId (ref: Quiz),
  processingStatus: Enum ['pending', 'processing', 'completed', 'failed'],
  createdAt: Date,
  updatedAt: Date
}
```

**Quiz Model:**
```javascript
{
  _id: ObjectId,
  lectureId: ObjectId (ref: Lecture),
  title: String,
  questions: [{
    id: String,
    question: String,
    options: [String],
    correctAnswer: Number,
    difficulty: Enum ['easy', 'medium', 'hard'],
    explanation: String
  }],
  timeLimit: Number (minutes),
  passingScore: Number (percentage),
  isAIGenerated: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Enrollment Model:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  courseId: ObjectId (ref: Course),
  enrolledAt: Date,
  completedAt: Date,
  progress: Number (percentage),
  lastAccessedAt: Date,
  quizScores: [{
    quizId: ObjectId,
    score: Number,
    attempts: Number,
    completedAt: Date
  }]
}
```

**4.2.3 Indexing Strategy**

The database implements comprehensive indexing to ensure query performance:

- **User Collection**: Email (unique), role, lastActiveAt
- **Course Collection**: teacherId, category, level, isPublished, averageRating
- **Lecture Collection**: moduleId, processingStatus, createdAt
- **Quiz Collection**: lectureId, isAIGenerated
- **Enrollment Collection**: userId, courseId, enrolledAt
- **Progress Collection**: userId, lectureId, completedAt

**4.2.4 Data Relationships**

The database maintains relationships through document references and embedded arrays:

- **One-to-Many**: Teacher to Courses, Course to Modules, Module to Lectures
- **Many-to-Many**: Students to Courses (through Enrollment collection)
- **One-to-One**: Lecture to Quiz, User to Profile
- **Hierarchical**: Course → Module → Lecture structure

**Fig 4.2: Database Schema**

```
┌─────────────┐
│    User     │
├─────────────┤
│ _id         │───┐
│ name        │   │
│ email       │   │
│ password    │   │
│ role        │   │
│ ...         │   │
└─────────────┘   │
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌───────▼────────┐
│    Course      │  │   Enrollment   │
├───────────────┤  ├───────────────┤
│ _id           │  │ _id           │
│ title         │  │ userId        │───┘
│ description   │  │ courseId      │───┐
│ teacherId     │──┘│ enrolledAt    │   │
│ moduleIds     │───┐│ progress      │   │
│ ...           │   ││ ...          │   │
└───────┬───────┘   └───────────────┘   │
        │                               │
        │                               │
┌───────▼────────┐              ┌───────▼────────┐
│    Module      │              │    Progress    │
├───────────────┤              ├───────────────┤
│ _id           │              │ _id           │
│ courseId      │───┐          │ userId        │───┘
│ title         │   │          │ lectureId     │
│ lectureIds    │───┼──┐       │ completedAt   │
│ ...           │   │  │       │ ...           │
└───────────────┘   │  │       └───────────────┘
                    │  │
        ┌───────────┘  │
        │              │
┌───────▼────────┐    │
│    Lecture     │    │
├───────────────┤    │
│ _id           │    │
│ moduleId      │───┘
│ title         │
│ videoUrl      │
│ transcript    │
│ summary       │
│ quizId        │───┐
│ ...           │   │
└───────────────┘   │
                    │
            ┌───────▼────────┐
            │     Quiz       │
            ├───────────────┤
            │ _id           │
            │ lectureId     │
            │ questions     │
            │ difficulty    │
            │ ...           │
            └───────────────┘
```

## 4.3 ER Diagram

The Entity-Relationship diagram for RemoteSmart illustrates the relationships between the core entities in the system and the cardinality of these relationships.

**Entity Descriptions:**

**User Entity:**
- Attributes: UserID (Primary Key), Name, Email, PasswordHash, Role, Bio, ProfilePictureURL, PreferredLanguage, CreatedAt, UpdatedAt, LastActiveAt, IsActive
- Relationships: Creates (1:N) Courses, Teaches (1:N) Courses, Enrolls (M:N) Courses, Attempts (M:N) Quizzes, Views (M:N) Lectures, Attends (M:N) LiveSessions

**Course Entity:**
- Attributes: CourseID (Primary Key), Title, Description, Category, Level, ThumbnailURL, IsPublished, AverageRating, TotalDurationMinutes, EnrollmentCount, CreatedAt, UpdatedAt
- Relationships: CreatedBy (N:1) User, TaughtBy (N:1) User, Contains (1:N) Modules, Receives (M:N) Ratings, Has (M:N) Enrollments

**Module Entity:**
- Attributes: ModuleID (Primary Key), CourseID (Foreign Key), Title, Description, OrderIndex, CreatedAt, UpdatedAt
- Relationships: BelongsTo (N:1) Course, Contains (1:N) Lectures

**Lecture Entity:**
- Attributes: LectureID (Primary Key), ModuleID (Foreign Key), Title, Description, VideoURL, VideoQualities, AudioOnlyURL, ThumbnailURL, Duration, Transcript, Summary, ProcessingStatus, CreatedAt, UpdatedAt
- Relationships: BelongsTo (N:1) Module, Has (1:1) Quiz, ViewedBy (M:N) Users

**Quiz Entity:**
- Attributes: QuizID (Primary Key), LectureID (Foreign Key), Title, Questions, TimeLimit, PassingScore, IsAIGenerated, CreatedAt, UpdatedAt
- Relationships: BelongsTo (1:1) Lecture, AttemptedBy (M:N) Users

**Enrollment Entity:**
- Attributes: EnrollmentID (Primary Key), UserID (Foreign Key), CourseID (Foreign Key), EnrolledAt, CompletedAt, Progress, LastAccessedAt
- Relationships: BelongsTo (N:1) User, BelongsTo (N:1) Course

**Progress Entity:**
- Attributes: ProgressID (Primary Key), UserID (Foreign Key), LectureID (Foreign Key), CompletedAt, TimeSpent, QuizScore
- Relationships: BelongsTo (N:1) User, BelongsTo (N:1) Lecture

**LiveSession Entity:**
- Attributes: SessionID (Primary Key), CourseID (Foreign Key), TeacherID (Foreign Key), Title, ScheduledAt, Duration, RecordingURL, CreatedAt
- Relationships: BelongsTo (N:1) Course, ConductedBy (N:1) User, AttendedBy (M:N) Users

**Relationship Cardinality:**

- User to Course: One-to-Many (A user can create/teach multiple courses)
- Course to Module: One-to-Many (A course contains multiple modules)
- Module to Lecture: One-to-Many (A module contains multiple lectures)
- Lecture to Quiz: One-to-One (Each lecture has one associated quiz)
- User to Course: Many-to-Many (Users can enroll in multiple courses, courses can have multiple students)
- User to Lecture: Many-to-Many (Users can view multiple lectures, lectures can be viewed by multiple users)
- User to Quiz: Many-to-Many (Users can attempt multiple quizzes, quizzes can be attempted by multiple users)
- User to LiveSession: Many-to-Many (Users can attend multiple sessions, sessions can have multiple attendees)

**Fig 4.3: ER Diagram**

```
                    ┌─────────────┐
                    │    User     │
                    ├─────────────┤
                    │ UserID (PK) │
                    │ Name        │
                    │ Email       │
                    │ PasswordHash│
                    │ Role        │
                    │ Bio         │
                    │ ProfilePic  │
                    │ PrefLang    │
                    │ CreatedAt   │
                    │ UpdatedAt   │
                    │ LastActive  │
                    │ IsActive    │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           │               │               │
    ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
    │   Course    │  │ Enrollment  │  │  Progress   │
    ├─────────────┤  ├─────────────┤  ├─────────────┤
    │ CourseID(PK)│  │EnrollmentID│  │ ProgressID  │
    │ Title       │  │ UserID (FK) │  │ UserID (FK) │
    │ Description │  │ CourseID(FK)│  │ LectureID   │
    │ Category    │  │ EnrolledAt  │  │ CompletedAt │
    │ Level       │  │ CompletedAt │  │ TimeSpent   │
    │ Thumbnail   │  │ Progress    │  │ QuizScore   │
    │ IsPublished │  │ LastAccess  │  └─────────────┘
    │ AvgRating   │  └─────────────┘
    │ Duration    │
    │ EnrollCount │
    │ CreatedAt   │
    │ UpdatedAt   │
    └──────┬──────┘
           │
           │
    ┌──────▼──────┐
    │   Module    │
    ├─────────────┤
    │ ModuleID(PK)│
    │ CourseID(FK)│
    │ Title       │
    │ Description │
    │ OrderIndex  │
    │ CreatedAt   │
    │ UpdatedAt   │
    └──────┬──────┘
           │
           │
    ┌──────▼──────┐
    │   Lecture   │
    ├─────────────┤
    │ LectureID(PK)│
    │ ModuleID(FK) │
    │ Title       │
    │ Description │
    │ VideoURL    │
    │ Qualities   │
    │ AudioURL    │
    │ Thumbnail   │
    │ Duration    │
    │ Transcript  │
    │ Summary     │
    │ ProcStatus  │
    │ CreatedAt   │
    │ UpdatedAt   │
    └──────┬──────┘
           │
           │
    ┌──────▼──────┐
    │    Quiz     │
    ├─────────────┤
    │ QuizID (PK) │
    │ LectureID   │
    │ Title       │
    │ Questions   │
    │ TimeLimit   │
    │ PassScore   │
    │ IsAIGen     │
    │ CreatedAt   │
    │ UpdatedAt   │
    └─────────────┘
```

## 4.4 Data Flow Diagrams

Data Flow Diagrams (DFDs) illustrate how data moves through the RemoteSmart system, showing the inputs, processes, outputs, and data stores involved in various system operations.

**4.4.1 Context Level DFD (Level 0)**

The context level DFD shows the system as a single process interacting with external entities:

**External Entities:**
- **Student**: Interacts with the system for course browsing, enrollment, content consumption, and assessment
- **Teacher**: Interacts with the system for course creation, content management, analytics viewing, and live session conducting
- **Administrator**: Interacts with the system for user management, system configuration, and oversight
- **AI Service**: External service that processes content for summarization and quiz generation
- **Storage Service**: External service that stores and delivers media files

**Data Flows:**
- Student → System: Course requests, enrollment requests, progress data, quiz submissions
- System → Student: Course listings, content delivery, progress updates, quiz results
- Teacher → System: Course data, content uploads, session scheduling
- System → Teacher: Analytics data, student progress, system notifications
- Administrator → System: User management commands, system configuration
- System → Administrator: System status, user reports, usage statistics
- System ↔ AI Service: Content for processing, processed results
- System ↔ Storage Service: File uploads, file retrievals

**Fig 4.4: Context Level DFD**

```
    ┌──────────┐
    │ Student  │◄──────────────┐
    └─────┬────┘               │
          │                   │
          │                   │
    ┌─────▼───────────────────▼─────┐
    │                                 │
    │        RemoteSmart System       │
    │                                 │
    └─────┬───────────────────┬─────┘
          │                   │
          │                   │
    ┌─────▼────┐        ┌─────▼────┐
    │  Teacher │        │  Admin   │
    └──────────┘        └──────────┘

          │                   │
          ▼                   ▼
    ┌──────────┐        ┌──────────┐
    │ AI Service│        │  Storage │
    └──────────┘        └──────────┘
```

**4.4.2 Level 1 DFD**

The Level 1 DFD breaks down the main system process into major subprocesses:

**Major Processes:**
- **Process 1.0: Authentication & Authorization**: Handles user login, registration, and access control
- **Process 2.0: Course Management**: Manages course creation, editing, and publishing
- **Process 3.0: Content Processing**: Handles media optimization and AI content generation
- **Process 4.0: Learning Delivery**: Delivers content to students and tracks progress
- **Process 5.0: Assessment Management**: Creates, delivers, and grades assessments
- **Process 6.0: Live Session Management**: Manages live classroom sessions
- **Process 7.0: Analytics & Reporting**: Generates reports and insights

**Data Stores:**
- **D1: User Database**: Stores user accounts and authentication data
- **D2: Course Database**: Stores course information and structure
- **D3: Content Database**: Stores lecture content and metadata
- **D4: Assessment Database**: Stores quiz definitions and results
- **D5: Progress Database**: Stores student progress and performance data
- **D6: Media Storage**: Stores video and document files

**Fig 4.5: Level 1 DFD**

```
                    ┌──────────┐
                    │ Student  │
                    └─────┬────┘
                          │
                          │
    ┌─────────────────────┼─────────────────────┐
    │                     │                     │
    │  ┌──────────────────▼──────────────────┐  │
    │  │         Authentication (1.0)         │  │
    │  └──────────────────┬──────────────────┘  │
    │                     │                     │
    │  ┌──────────────────▼──────────────────┐  │
    │  │         Learning Delivery (4.0)      │  │
    │  └──────────────────┬──────────────────┘  │
    │                     │                     │
    │  ┌──────────────────▼──────────────────┐  │
    │  │       Assessment Management (5.0)   │  │
    │  └──────────────────┬──────────────────┘  │
    │                     │                     │
    └─────────────────────┼─────────────────────┘
                          │
                    ┌─────▼────┐
                    │  Teacher │
                    └─────┬────┘
                          │
                          │
    ┌─────────────────────┼─────────────────────┐
    │                     │                     │
    │  ┌──────────────────▼──────────────────┐  │
    │  │        Course Management (2.0)      │  │
    │  └──────────────────┬──────────────────┘  │
    │                     │                     │
    │  ┌──────────────────▼──────────────────┐  │
    │  │        Content Processing (3.0)      │  │
    │  └──────────────────┬──────────────────┘  │
    │                     │                     │
    │  ┌──────────────────▼──────────────────┐  │
    │  │      Live Session Management (6.0)  │  │
    │  └──────────────────┬──────────────────┘  │
    │                     │                     │
    │  ┌──────────────────▼──────────────────┐  │
    │  │       Analytics & Reporting (7.0)     │  │
    │  └──────────────────┬──────────────────┘  │
    │                     │                     │
    └─────────────────────┼─────────────────────┘
                          │
                    ┌─────▼────┐
                    │  Admin   │
                    └──────────┘
```

**4.4.3 Level 2 DFD - Content Processing**

The Level 2 DFD for Content Processing shows detailed data flow for media optimization and AI content generation:

**Processes:**
- **Process 3.1: File Upload**: Receives and validates uploaded files
- **Process 3.2: Video Transcoding**: Converts videos to multiple quality levels
- **Process 3.3: Audio Extraction**: Extracts audio-only streams
- **Process 3.4: Thumbnail Generation**: Creates preview images
- **Process 3.5: Document Processing**: Extracts text from documents
- **Process 3.6: AI Transcription**: Generates video transcripts
- **Process 3.7: AI Summarization**: Creates content summaries
- **Process 3.8: Quiz Generation**: Creates assessment questions
- **Process 3.9: Metadata Update**: Updates database with processing results

**Fig 4.6: Level 2 DFD - Content Processing**

```
    ┌──────────┐
    │  Teacher │
    └─────┬────┘
          │
          │ Upload Content
          ▼
    ┌──────────────────┐
    │  File Upload     │
    │     (3.1)        │
    └────────┬─────────┘
             │
             │
    ┌────────┴─────────┐
    │                  │
    ▼                  ▼
┌──────────┐      ┌──────────┐
│  Video   │      │ Document │
│Transcoding│     │Processing│
│   (3.2)  │      │   (3.5)  │
└────┬─────┘      └────┬─────┘
     │                 │
     │                 │
     ▼                 ▼
┌──────────┐      ┌──────────┐
│  Audio   │      │  Text    │
│Extraction│     │  Output  │
│   (3.3)  │      └────┬─────┘
└────┬─────┘           │
     │                 │
     │                 │
     ▼                 ▼
┌──────────┐      ┌──────────┐
│Thumbnail │      │  AI      │
│Generation│      │Transcript│
│   (3.4)  │      │   (3.6)  │
└────┬─────┘      └────┬─────┘
     │                 │
     │                 │
     └────────┬────────┘
              │
              ▼
        ┌──────────┐
        │   AI     │
        │Summarize │
        │   (3.7)  │
        └────┬─────┘
             │
             │
        ┌────┴─────┐
        │          │
        ▼          ▼
  ┌──────────┐ ┌──────────┐
  │   AI     │ │ Metadata │
  │  Quiz    │ │  Update  │
  │Generate  │ │   (3.9)  │
  │   (3.8)  │ └────┬─────┘
  └────┬─────┘      │
       │           │
       └─────┬─────┘
             │
             ▼
       ┌──────────┐
       │  Content │
       │  Database│
       └──────────┘
```

## 4.5 UML Diagrams

Unified Modeling Language (UML) diagrams provide standardized visual representations of the system's structure and behavior.

**4.5.1 Use Case Diagram**

The use case diagram shows the interactions between different user roles and the system's functional requirements:

**Actors:**
- **Student**: Primary user who consumes educational content
- **Teacher**: Content creator who manages courses and conducts sessions
- **Administrator**: System manager who oversees platform operations

**Use Cases:**

**Student Use Cases:**
- Register for account
- Login to system
- Browse courses
- Enroll in course
- View course content
- Download content for offline access
- Take quizzes
- View progress
- Attend live sessions
- Provide course ratings
- Update profile

**Teacher Use Cases:**
- Register for account
- Login to system
- Create course
- Upload content
- Manage course structure
- Publish course
- View analytics
- Conduct live sessions
- Manage enrollments
- Update profile

**Administrator Use Cases:**
- Login to system
- Manage users
- View system statistics
- Configure system settings
- Monitor platform health
- Generate reports

**Fig 4.7: Use Case Diagram**

```
                    ┌──────────────┐
                    │  Student     │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
  ┌──────────┐      ┌──────────┐      ┌──────────┐
  │ Register │      │  Browse   │      │  Enroll  │
  └──────────┘      └──────────┘      └──────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
  ┌──────────┐      ┌──────────┐      ┌──────────┐
  │  Login   │      │  View    │      │ Download │
  └──────────┘      │  Content │      │  Offline │
                    └──────────┘      └──────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
  ┌──────────┐      ┌──────────┐      ┌──────────┐
  │  Take    │      │  View    │      │  Attend  │
  │  Quiz    │      │ Progress │      │  Live    │
  └──────────┘      └──────────┘      │  Session │
                                       └──────────┘

                    ┌──────────────┐
                    │  Teacher     │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
  ┌──────────┐      ┌──────────┐      ┌──────────┐
  │ Register │      │  Create  │      │  Upload  │
  └──────────┘      │  Course  │      │  Content │
                    └──────────┘      └──────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
  ┌──────────┐      ┌──────────┐      ┌──────────┐
  │  Login   │      │  Manage  │      │  View    │
  └──────────┘      │  Course  │      │ Analytics│
                    └──────────┘      └──────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
  ┌──────────┐      ┌──────────┐      ┌──────────┐
  │ Publish  │      │ Conduct │      │  Manage  │
  │  Course  │      │  Live    │      │Enrollment│
  └──────────┘      │  Session │      └──────────┘
                    └──────────┘

                    ┌──────────────┐
                    │ Administrator │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
  ┌──────────┐      ┌──────────┐      ┌──────────┐
  │  Login   │      │  Manage  │      │  View    │
  └──────────┘      │  Users   │      │  Stats   │
                    └──────────┘      └──────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
  ┌──────────┐      ┌──────────┐      ┌──────────┐
  │ Configure│      │  Monitor │      │ Generate │
  │  System  │      │ Platform │      │  Reports │
  └──────────┘      └──────────┘      └──────────┘
```

**4.5.2 Class Diagram**

The class diagram shows the static structure of the system's classes and their relationships:

**Key Classes:**

**User Class:**
- Attributes: id, name, email, password, role, bio, profilePicture, preferredLanguage, createdAt, updatedAt, lastActiveAt, isActive
- Methods: register(), login(), logout(), updateProfile(), changePassword()

**Course Class:**
- Attributes: id, title, description, category, level, teacherId, moduleIds, thumbnail, isPublished, ratings, averageRating, totalDuration, enrollmentCount, createdAt, updatedAt
- Methods: create(), update(), publish(), unpublish(), addRating(), calculateAverageRating()

**Module Class:**
- Attributes: id, courseId, title, description, orderIndex, lectureIds, createdAt, updatedAt
- Methods: create(), update(), reorder(), addLecture(), removeLecture()

**Lecture Class:**
- Attributes: id, moduleId, title, description, videoUrl, videoQualities, audioOnlyUrl, thumbnailUrl, duration, transcript, summary, documents, quizId, processingStatus, createdAt, updatedAt
- Methods: create(), update(), processContent(), generateQuiz(), getTranscript(), getSummary()

**Quiz Class:**
- Attributes: id, lectureId, title, questions, timeLimit, passingScore, isAIGenerated, createdAt, updatedAt
- Methods: create(), generateQuestions(), gradeAttempt(), calculateScore()

**Enrollment Class:**
- Attributes: id, userId, courseId, enrolledAt, completedAt, progress, lastAccessedAt, quizScores
- Methods: enroll(), updateProgress(), completeCourse(), addQuizScore()

**Progress Class:**
- Attributes: id, userId, lectureId, completedAt, timeSpent, quizScore
- Methods: markComplete(), recordTimeSpent(), updateQuizScore()

**LiveSession Class:**
- Attributes: id, courseId, teacherId, title, scheduledAt, duration, recordingUrl, attendees, createdAt
- Methods: schedule(), start(), end(), record(), addAttendee()

**Fig 4.8: Class Diagram**

```
┌─────────────────┐
│     User        │
├─────────────────┤
│ -id: String     │
│ -name: String   │
│ -email: String  │
│ -password: String│
│ -role: Enum     │
│ -bio: String    │
│ -profilePic: URL│
│ -prefLang: String│
│ -createdAt: Date│
│ -updatedAt: Date│
│ -lastActive: Date│
│ -isActive: Bool │
├─────────────────┤
│ +register()      │
│ +login()         │
│ +logout()        │
│ +updateProfile() │
│ +changePassword()│
└────────┬─────────┘
         │
         │ 1
         │
         │ *
┌────────▼─────────┐
│     Course       │
├─────────────────┤
│ -id: String     │
│ -title: String  │
│ -description:   │
│   String        │
│ -category: String│
│ -level: Enum    │
│ -teacherId: Ref │
│ -moduleIds: []  │
│ -thumbnail: URL │
│ -isPublished:   │
│   Bool          │
│ -ratings: []    │
│ -avgRating: Num │
│ -duration: Num  │
│ -enrollCount:   │
│   Num           │
│ -createdAt: Date│
│ -updatedAt: Date│
├─────────────────┤
│ +create()       │
│ +update()       │
│ +publish()      │
│ +unpublish()    │
│ +addRating()    │
│ +calcAvgRating()│
└────────┬─────────┘
         │
         │ 1
         │
         │ *
┌────────▼─────────┐
│     Module       │
├─────────────────┤
│ -id: String     │
│ -courseId: Ref  │
│ -title: String  │
│ -description:   │
│   String        │
│ -orderIndex: Num│
│ -lectureIds: [] │
│ -createdAt: Date│
│ -updatedAt: Date│
├─────────────────┤
│ +create()       │
│ +update()       │
│ +reorder()      │
│ +addLecture()   │
│ +removeLecture()│
└────────┬─────────┘
         │
         │ 1
         │
         │ *
┌────────▼─────────┐
│     Lecture      │
├─────────────────┤
│ -id: String     │
│ -moduleId: Ref  │
│ -title: String  │
│ -description:   │
│   String        │
│ -videoUrl: URL  │
│ -qualities: []  │
│ -audioUrl: URL  │
│ -thumbnail: URL │
│ -duration: Num  │
│ -transcript:   │
│   String        │
│ -summary: String│
│ -documents: []  │
│ -quizId: Ref    │
│ -procStatus:    │
│   Enum          │
│ -createdAt: Date│
│ -updatedAt: Date│
├─────────────────┤
│ +create()       │
│ +update()       │
│ +processContent()│
│ +generateQuiz() │
│ +getTranscript()│
│ +getSummary()   │
└────────┬─────────┘
         │
         │ 1
         │
         │ 1
┌────────▼─────────┐
│      Quiz        │
├─────────────────┤
│ -id: String     │
│ -lectureId: Ref │
│ -title: String  │
│ -questions: []  │
│ -timeLimit: Num │
│ -passScore: Num │
│ -isAIGen: Bool  │
│ -createdAt: Date│
│ -updatedAt: Date│
├─────────────────┤
│ +create()       │
│ +generateQuestions()│
│ +gradeAttempt() │
│ +calcScore()    │
└─────────────────┘

┌─────────────────┐
│   Enrollment     │
├─────────────────┤
│ -id: String     │
│ -userId: Ref    │
│ -courseId: Ref  │
│ -enrolledAt:    │
│   Date          │
│ -completedAt:   │
│   Date          │
│ -progress: Num  │
│ -lastAccessed:  │
│   Date          │
│ -quizScores: [] │
├─────────────────┤
│ +enroll()       │
│ +updateProgress()│
│ +completeCourse()│
│ +addQuizScore() │
└─────────────────┘

┌─────────────────┐
│    Progress     │
├─────────────────┤
│ -id: String     │
│ -userId: Ref    │
│ -lectureId: Ref │
│ -completedAt:   │
│   Date          │
│ -timeSpent: Num │
│ -quizScore: Num │
├─────────────────┤
│ +markComplete() │
│ +recordTimeSpent()│
│ +updateQuizScore()│
└─────────────────┘

┌─────────────────┐
│  LiveSession    │
├─────────────────┤
│ -id: String     │
│ -courseId: Ref  │
│ -teacherId: Ref │
│ -title: String  │
│ -scheduledAt:   │
│   Date          │
│ -duration: Num  │
│ -recordingUrl:  │
│   URL           │
│ -attendees: []  │
│ -createdAt: Date│
├─────────────────┤
│ +schedule()     │
│ +start()        │
│ +end()          │
│ +record()       │
│ +addAttendee()  │
└─────────────────┘
```

**4.5.3 Sequence Diagram**

The sequence diagram shows the interaction between objects in a specific scenario, such as a student enrolling in a course and viewing content:

**Scenario: Student Enrolls in Course and Views Lecture**

**Participants:**
- Student: The user initiating the action
- Frontend: React application handling user interface
- Backend: Node.js server processing requests
- Database: MongoDB storing data
- Storage: AWS S3 storing media files

**Sequence of Events:**
1. Student clicks "Enroll" button on course page
2. Frontend sends enrollment request to backend
3. Backend validates user authentication and course availability
4. Backend creates enrollment record in database
5. Backend updates course enrollment count
6. Backend returns success response to frontend
7. Frontend updates UI to show enrolled status
8. Student clicks on first lecture
9. Frontend requests lecture data from backend
10. Backend retrieves lecture information from database
11. Backend generates signed URLs for media files
12. Backend returns lecture data and URLs to frontend
13. Frontend initializes video player with URLs
14. Video player requests video from storage
15. Storage delivers video content
16. Frontend tracks viewing progress
17. Frontend periodically syncs progress to backend

**Fig 4.9: Sequence Diagram**

```
Student    Frontend    Backend    Database    Storage
  │           │          │          │          │
  │──Enroll───>│          │          │          │
  │           │──Request─>│          │          │
  │           │          │──Validate─>│          │
  │           │          │<──User───│          │
  │           │          │──Check───>│          │
  │           │          │<──Course──│          │
  │           │          │──Create──>│          │
  │           │          │<──Enroll──│          │
  │           │          │──Update──>│          │
  │           │          │<──Count───│          │
  │           │<──Success─│          │          │
  │<──Update──│          │          │          │
  │           │          │          │          │
  │──View────>│          │          │          │
  │           │──Request─>│          │          │
  │           │          │──Get─────>│          │
  │           │          │<──Lecture─│          │
  │           │          │──GenURL──>│          │
  │           │          │<──Signed──│          │
  │           │<──Data───│          │          │
  │<──Player──│          │          │          │
  │           │          │          │          │
  │           │──Request──>│          │          │
  │           │          │          │          │
  │           │          │          │          │
  │           │          │          │<──Video──│
  │           │          │          │          │
  │           │<──Stream──│          │          │
  │<──Content─│          │          │          │
  │           │          │          │          │
  │           │──Progress─>│          │          │
  │           │          │──Update──>│          │
  │           │          │<──Confirm─│          │
  │           │<──Sync───│          │          │
```

---









