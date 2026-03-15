# UniConnect Project Proposal

## 1. Project Title
UniConnect: A Unified Mobile Platform for Student–Lecturer Academic Workflows

## 2. Background and Rationale
Academic activities are fragmented across multiple apps (LMS, chat, calendars, cloud drives), creating inefficiencies, missed deadlines, and limited visibility into progress. Institutions need a mobile-first, intelligent, and cohesive experience that supports both students and lecturers with consistent theming, accessibility, and real-time updates.

## 3. Problem Statement
Existing tools are disjointed, desktop-centric, and lack integrated study aids and lecturer analytics. Students struggle to organize studies and track progress; lecturers lack unified tools for content delivery, communication, and performance insights.

## 4. Aim
Design and implement a unified mobile platform that streamlines learning and teaching workflows with smart assistance, notifications, materials management, study tools, dark mode, and analytics, backed by Firebase services.

## 5. Objectives
- Build student and lecturer dashboards with role-specific quick actions and tools.
- Implement notifications (create, filter, mark-all-read) with real-time updates.
- Provide study tools: Smart Notes, Mind Maps, AR learning, Focus Mode, Game Center.
- Enable materials upload/view, class schedules, profile management, and voice notes.
- Ensure full dark mode and responsive, accessible UI across the app.
- Use Firebase Auth, Firestore, and Storage for secure backend services.

## 6. Scope
- Platforms: Android and iOS (React Native/Expo).
- Users: Students and Lecturers (role-based navigation and features).
- Modules: Dashboards, Notifications, Materials, Schedule, Profile, Voice Notes, AI tools (lecturer).
- Out of scope: Production-grade AR SDK integration and advanced AI backends (phase 2).

## 7. Proposed System Overview
- Mobile-first app with React Navigation for structured flows.
- Context-driven theming and state; Firebase for auth, data, and media.
- Modular components for ease of maintenance and scalability.

## 8. Methodology
- Process: Agile/Incremental with iterative UI/feature refinement via stakeholder feedback.
- Requirements: Elicited through comparative review and iterative prototyping.
- Design: Themed, accessible UI; component-based architecture; Firestore collections for core entities.
- Implementation: Feature modules with dark-mode styles, listeners for real-time lists, Storage uploads for media.
- Testing: Manual acceptance + integration checks (Firestore listeners, uploads), error boundary coverage.

## 9. High-Level Architecture
- Presentation: RN screens/components, role-based tabs.
- Application: `ThemeProvider`, `AppContext`, navigation stacks.
- Data: Firebase Auth, Firestore (notifications, materials, notes, progress), Storage (media), AsyncStorage (preferences).

## 10. Key Features and Deliverables
- Student Dashboard with credentials, quick actions, progress.
- Lecturer Dashboard with greetings, Teaching Impact, AI tools grid.
- Notifications module with creation, filtering, and header quick actions.
- Materials upload/browse, schedules, profile editing, voice notes.
- Full dark mode; responsive UI with gradients and shadows.
- Deliverables: Source code, configuration, documentation (report + proposal), and build instructions.

## 11. Project Plan and Timeline (Indicative)
- Weeks 1–2: Requirements, wireframes, navigation/theming setup.
- Weeks 3–5: Student and Lecturer dashboards, quick actions, AI tools modals.
- Weeks 6–7: Notifications, materials, schedule, profile.
- Week 8: Voice notes, polishing, dark mode pass.
- Week 9: Testing and documentation; handover.

## 12. Resources
- Team: 1–2 RN engineers; stakeholder reviewer (lecturer/student rep).
- Tools: React Native/Expo, Firebase, React Navigation, AsyncStorage, `expo-av`, `expo-image-picker`.
- Devices: Android/iOS devices or emulators.

## 13. Risks and Mitigations
- Backend limits (Firestore quotas): use indexes and efficient queries; paginate lists.
- Network variability: graceful error states, retries, basic caching.
- Evolving requirements: agile iterations, modular design.
- AR/AI complexity: simulate initially; phase-in production SDKs/services.

## 14. Success Criteria
- All modules functional on Android and iOS with consistent dark/light themes.
- Real-time notifications and materials flows verified.
- Usability feedback positive from student/lecturer testers.
- Documentation complete and builds reproducible.

## 15. Budget (Optional)
- Firebase (Spark/Blaze tiers depending on usage).
- Developer time; optional third-party services for AI/AR in phase 2.

## 16. References
- React Native/Expo, React Navigation, Firebase official docs.
- UX theming and accessibility best practices.

## 17. Appendices
- See full system report: `PROJECT_DOCUMENTATION.md` (Chapters 1–5, UML, screenshots, change log).
