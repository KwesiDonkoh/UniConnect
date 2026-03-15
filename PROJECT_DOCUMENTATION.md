# UniConnect Project Documentation

Executive Summary
- UniConnect is a unified mobile academic platform for students and lecturers, integrating dashboards, notifications, materials, study tools, voice notes, and an AI-enhanced lecturer suite. It features full dark mode, responsive UI, Firebase backend, and modular components. This consolidated document merges all prior documentation versions, adds labeled diagrams and appendices, and is prepared for print and submission.

Table of Contents
1. Chapter 1: Introduction
2. Chapter 2: Review of Related Works and Proposed System
3. Chapter 3: Methodology
4. Chapter 4: Implementation and Results
5. Chapter 5: Findings and Conclusion
6. Appendix A: UML Diagrams (ASCII)
7. Appendix B: Screenshots
8. Appendix C: Screenshot Capture Guide
9. Appendix D: Screenshot Capture Script (ADB)
10. Appendix E: Consolidated Change Log

## Chapter 1: Introduction

### Problem Statement
UniConnect addresses fragmented academic workflows for students and lecturers in tertiary institutions. Current tools split core activities—course management, study planning, notifications, materials sharing, grading, and progress tracking—across multiple disjoint apps and manual processes. This causes missed deadlines, poor engagement, duplicated work, limited visibility into progress, and inefficient communication. The lack of a unified, mobile-first, intelligent platform with offline-friendly UI/UX and dark-mode support leads to frustration and reduced academic outcomes.

### Aim of the Project
To design and implement a unified, mobile-first academic platform that streamlines learning and teaching workflows for students and lecturers, integrating smart assistance (AI-enabled features), seamless communication, structured study tools, and robust progress analytics, with consistent theming (light/dark), responsiveness, and accessibility.

### Specific Objectives
- Provide students with a modern home dashboard consolidating credentials, quick actions, study tools, and progress.
- Offer lecturers an optimized dashboard for class management, analytics, and AI-driven teaching tools.
- Implement reliable notifications with creation, filtering, and quick-access actions.
- Enable voice notes, materials sharing, smart notes, mind maps, AR learning, and study aids.
- Ensure full dark mode across both student and lecturer sections.
- Integrate Firebase (Auth, Firestore, Storage) for authentication, data, and media.
- Achieve responsive layouts and smooth animated interactions across devices.
- Incorporate robust error handling with `ErrorBoundary` and graceful fallbacks.

### Justification of Project
- Consolidates scattered academic workflows into one mobile app.
- Reduces context switching, improves engagement and learning outcomes.
- Empowers lecturers with analytics and AI-driven tools for efficiency.
- Introduces consistent design language, theme support, and accessible UI.
- Leverages scalable cloud backend (Firebase) and cross-platform stack (React Native/Expo).

### Motivation
- Student need for an intuitive single place to organize studies and track progress.
- Lecturer need for efficient tools to communicate, manage materials, and assess students.
- Institutional goals for digital transformation, better outcomes, and analytics.

### Scope
- Mobile app (Android/iOS) using React Native with Expo.
- Two main personas: Student and Lecturer, with tailored dashboards and tools.
- Core modules: Authentication, Home Dashboard, Quick Actions, Notifications, Study Tools (Smart Notes, Mind Maps, AR), Progress, Materials Upload/View, Class Schedule, Profile, Voice Notes, Lecturer AI Suite.
- Theming: Light and dark modes; responsive layouts; basic accessibility support.

### Limitations
- Offline support is limited to cached screens; full offline-first not implemented.
- Advanced AI features rely on future backend services/stubs in some components.
- AR features are simulated; production AR SDK integration is future work.
- Some quick actions open modals that are simplified MVPs.

### Beneficiaries
- Students: streamlined study workflows, reminders, progress visibility.
- Lecturers: efficient content sharing, analytics, AI-assisted tools.
- Institutions: improved engagement, standardized digital experience.

### Academic and Practical Relevance
- Demonstrates application of modern mobile development, cloud services, and UI/UX best practices to education technology.
- Provides a real-world, extensible foundation for research in learning analytics and intelligent tutoring systems.

### Project Activity Planning and Schedules (High-Level)
- Phase 1: Requirements and wireframes.
- Phase 2: Architecture, theming, navigation setup.
- Phase 3: Student dashboard and quick actions.
- Phase 4: Lecturer dashboard and AI tools.
- Phase 5: Notifications, materials, schedule, profile, voice notes.
- Phase 6: Dark mode and polishing.
- Phase 7: Testing, documentation.

### Structure of Report
- Chapter 1: Introduction
- Chapter 2: Related Works and Proposed System
- Chapter 3: Methodology
- Chapter 4: Implementation and Results
- Chapter 5: Findings and Conclusion
- References

### Project Deliverables
- Source code (React Native/Expo app) with student and lecturer modules.
- Configured Firebase integration (Auth, Firestore, Storage).
- Documentation: This report (multi-chapter) and inline code comments.
- UI assets and theme configuration.
- Build/run instructions and environment configuration.

## Chapter 2: Review of Related Works and Proposed System

### Review of Related Works / Similar Systems
Modern academic platforms include LMSs (e.g., Moodle, Canvas), messaging tools (WhatsApp/Telegram groups), calendar apps (Google Calendar), and cloud drives (Google Drive). While mature, they are fragmented, desktop-centric, and lack mobile-first, unified workflows with smart study aids. Third-party study apps (Notion, Quizlet) offer note-taking and flashcards but lack institutional context and lecturer integration. Existing voice-note/chat tools lack academic structuring and analytics.

- Pros of existing systems:
  - Rich features for course management (LMS), robust messaging (chat apps), reliable notifications (calendar/email), and scalable storage (cloud drives).
  - Established ecosystems and integrations.
- Cons:
  - Fragmentation across tools, inconsistent UX, poor mobile cohesion.
  - Limited smart assistance tailored to study flows and lecturer analytics in one app.
  - Theming and accessibility variance; dark mode often inconsistent.

### The Proposed System
UniConnect unifies study and teaching workflows in a single mobile-first app with tailored dashboards for students and lecturers, integrated notifications, materials, study aids (Smart Notes, Mind Maps, AR learning), progress tracking, voice notes, and an AI-enhanced lecturer toolset. Firebase backs authentication, data, and media; React Navigation orchestrates screen flows; a custom Theme Provider ensures consistent light/dark modes.

### Conceptual Design
At a high level, the system consists of:
- Presentation Layer: React Native screens and reusable components, theme-aware UI.
- Application Layer: Context providers (`AppContext`, `ThemeContext`), feature controllers (modals, handlers), navigation (stack/tabs).
- Data Layer: Firebase Auth, Firestore (documents/collections), Storage (media uploads), local async storage for theme/preferences.

### Architecture of the Proposed System
- Client-only mobile app with Firebase backend services.
- Navigation: Root navigator → role-based tabs (`StudentTabs`, `LecturerTabs`) → feature stacks.
- State Management: React Context for global user/session/theme; component state for feature modals.
- Data Access: Firestore listeners for notifications, CRUD for materials/notes; Storage for media; Auth for session.
- Theming: `ThemeProvider` with `useTheme`, `Appearance`, and `AsyncStorage` persistence.

### Component Designs and Descriptions
- `ModernHomeDashboard` (Student):
  - Credentials strip with aligned items; quick actions grid; progress stats; modals for Smart Notes, Mind Map, AR, Progress, Modules, Game Center, Focus Mode, Weekend.
  - Dark mode applied to containers, text, borders, gradients, and status bar.
- `LecturerDashboard`:
  - Greeting header; Teaching Impact section; modern AI tools grid; modals for AI features; profile removed from home per requirements; dark mode fully applied.
- `NotificationsScreen`:
  - Three-column header actions (mark read, quick actions center, create/filter); notification list with item cards; create notification modal for both roles; dark mode styles.
- `ProfileScreen`:
  - Profile card with editable fields; status indicators; course lists; improved dark mode; syntax fixes.
- `ClassScheduleScreen` and `UploadNotesScreen`:
  - Themed headers; tabbed materials view; upload and browse flows; dark mode.
- Study Tools Components:
  - `SmartNotes`: CRUD notes with AI tags/categories, search/filter, enhancement stubs.
  - `MindMap`: simple graph templates and map management.
  - `ARLearning`: category-based AR experiences (simulated), scanning controls.
  - `ProgressTracker`, `SemesterModules`, `GameCenter`, `FocusMode`, `WeekendActivities`: lightweight MVPs for respective flows.
- Voice and Sharing:
  - `VoiceRecorder`: record/stop/send flow with UI; integrates with Storage in future.
  - `EnhancedFileShareModal`, `DocumentUploadModal`: materials sharing and uploads.
- Error Handling:
  - `ErrorBoundary` wraps critical trees to catch runtime errors and display fallback UI.

Illustrative diagrams to include:
- High-level architecture diagram showing layers and Firebase services.
- Component interaction diagram for dashboard + modals.
- Navigation map for student and lecturer tab structures.

### Proposed System/Software Features
- Student: credentials overview, quick actions (Progress, Schedule AI, Register, Result, Weekend, Module, Smart Notes, Mind Map, AR, Focus Mode, Game Center, etc.), notifications, materials, schedule, profile, voice notes.
- Lecturer: greetings, Teaching Impact, AI tools (Lecture Assistant, Smart Grading, Analytics Dashboard, Virtual Classroom, Content Generator, Lecture Recorder, Plagiarism Detector, Performance Prediction), notifications, materials, schedule.
- Cross-cutting: full dark mode; responsive layouts; animated UI; error boundaries; Firebase integration.

### Development Tools and Environment (Brief)
- React Native with Expo (mobile framework and dev tooling).
- React Navigation (stack/tab navigation).
- Firebase (Auth, Firestore, Storage).
- Expo modules: `expo-image-picker`, `expo-image-manipulator`, likely `expo-av` for audio.
- JavaScript/JSX, Context API, AsyncStorage, Appearance API.
- Design: Linear gradients, shadows, icons, and responsive styles.

### Benefits of Implementing the Proposed System
- Unified, mobile-first experience improves productivity and engagement.
- Reduced context switching for both students and lecturers.
- Consistent theming and accessibility increase usability and satisfaction.
- Extensible architecture with clear components and Firebase services.
- Provides a foundation for advanced AI and analytics features.

## Chapter 3: Methodology

### Chapter Overview
This chapter presents the methodology used to engineer UniConnect: stakeholders, requirements (functional/non-functional), security concepts, process model, and logical designs (UI wireframes and DB design). It also details how the development tools were applied in practice.

### Requirement Specification

#### Stakeholders of the System
- Students: consume learning materials, manage study, track progress, communicate.
- Lecturers: publish materials, manage classes, analyze performance, communicate.
- Administrators (future scope): manage users, policies, and institutional integrations.

#### Requirement Gathering Process
- Review of similar systems (LMS, study tools) to identify gaps.
- Iterative user-driven feedback (from change requests) informing UI and feature refinements.
- Code-first prototypes for dashboards and study tools validated via runtime testing.

#### Functional Requirements
- Authentication: sign-in/out, role-based navigation (student, lecturer).
- Student Home: display credentials, progress stats, quick actions (Progress, Schedule AI, Register, Result, Weekend, Module, Smart Notes, Mind Maps, AR, Focus Mode, Game Center, etc.).
- Lecturer Home: greetings, Teaching Impact, AI tools (Lecture Assistant, Smart Grading, Analytics, Virtual Classroom, Content Generator, Lecture Recorder, Plagiarism Detector, Performance Prediction).
- Notifications: list, filter, mark all read, create (both roles), quick actions in header.
- Materials: upload documents/media, browse/download, manage categories.
- Schedule: view class schedules; per-role views.
- Profile: view/edit profile details, course lists, preferences.
- Voice Notes: record, stop, send voice notes.
- Theming: persistent light/dark mode, applied app-wide.

#### UML Diagrams (Outlines)
- Use Case (Front-end models):
  - Student actor: View Dashboard, Open Quick Action, View Notifications, Create Notification, Upload/View Materials, View Schedule, Edit Profile, Record Voice Note.
  - Lecturer actor: View Dashboard, Open AI Tool, View Notifications, Create Notification, Upload/View Materials, View Schedule, Edit Profile, Record Voice Note.
- Use Case (Back-end models via Firebase):
  - Auth Service: SignIn, SignOut, GetUser.
  - Firestore: Create/Read/Update/Delete Document (notifications, materials, notes), Subscribe to changes.
  - Storage: Upload/Download media.
- Activity Diagrams: Notification creation flow; Materials upload flow; Voice note recording and upload.
- Sequence Diagrams: Student taps Quick Action → Modal opens → Firestore query; Lecturer triggers AI tool → select course → open modal; Create Notification → validate → write to Firestore → UI updates listener.
- Class Diagram (logical components): Screens (Dashboard, Notifications, Profile, Schedule, UploadNotes), Components (SmartNotes, MindMap, ARLearning, ProgressTracker, SemesterModules, GameCenter, FocusMode, WeekendActivities, VoiceRecorder), Contexts (AppContext, ThemeContext), Services (Firebase wrappers).

USE CASE DESCRIPTIONS (selected):
- View Dashboard (Student): Actor opens app, system reads role, loads `ModernHomeDashboard`, shows credentials, stats, quick actions, with dark mode styles.
- Open AI Tool (Lecturer): Actor selects a tool; system sets `selectedCourse`, opens corresponding modal with `user` context.
- Create Notification (Both): Actor taps Create, fills form; system validates, writes to Firestore; all clients receive updates via listeners.
- Upload Material (Lecturer): Actor selects file; system uploads to Storage, writes metadata to Firestore; students can browse/download.

#### Non-Functional Requirements
- Usability: consistent design, clear typography, accessible contrasts, dark mode.
- Performance: responsive navigation; Firestore listeners for real-time updates; efficient lists.
- Reliability: error boundaries; graceful fallbacks on network errors.
- Security: Firebase Auth, rules-based access for Firestore/Storage.
- Portability: Android/iOS support via React Native/Expo.
- Maintainability: modular components, contexts, and screens; named imports.
- Observability (basic): console logging during development; structured error capture via `ErrorBoundary`.

#### Security Concepts
- Authentication via Firebase Auth ensures verified user sessions.
- Authorization via Firestore security rules (conceptual):
  - Users can read public course materials and their role-specific data.
  - Only creators/lecturers can create/edit certain documents (e.g., materials, announcements).
- Storage Rules (conceptual): restrict uploads to authenticated users; path-based object ownership.
- Data protection: avoid storing secrets client-side; use secure HTTPS endpoints (Firebase default).

### Project Methods

#### Software Process Models (Brief)
- Waterfall: linear phases; low flexibility after requirements.
- V-Model: verification/validation paired with each stage.
- Iterative/Incremental: repeated cycles adding features.
- Agile (Scrum/Kanban): short iterations, continuous feedback, adaptive planning.

#### Chosen Model and Justification
- Agile-Incremental approach with iterative UI/feature refinement based on user feedback. Justified by evolving requirements (quick actions layout, dark mode, lecturer tools), rapid prototyping needs, and frequent validation in a mobile app context.

### Project Design Considerations (Logical Designs)

#### UI Design (Wireframe Descriptions)
- Student Dashboard: header → credentials row → quick actions grid (3-column) → progress stats cards → modals for tools.
- Lecturer Dashboard: greeting → Teaching Impact → modern AI tools grid → modals per tool.
- Notifications: three-column header actions (mark all read, quick actions center, create/filter) → list of notification cards.
- Materials: header → tabs (upload, browse) → lists/cards with actions.
- Profile: profile card → editable fields → course list → preferences and theme toggle.

#### DB Design (E-R and Schema)
Backend uses Firebase; logical entities map to collections/documents:
- Collections:
  - users: { uid, role, name, email, department, level, profilePhotoUrl, preferences }
  - notifications: { id, title, body, createdAt, createdBy, targets: [role/course], readBy: [uid] }
  - materials: { id, title, description, courseCode, fileUrl, fileType, uploadedBy, createdAt }
  - notes: { id, ownerUid, title, content, tags: [], createdAt, updatedAt }
  - voiceNotes: { id, ownerUid, fileUrl, duration, createdAt, transcript? }
  - schedules: { id, ownerUid or courseCode, entries: [...], week }
  - progress: { id, ownerUid, metrics: { goals, streak, achievements }, period }

Example Firestore schema (illustrative):
- users/{uid}
- notifications/{notificationId}
- materials/{materialId}
- notes/{noteId}
- voiceNotes/{voiceNoteId}
- schedules/{scheduleId}
- progress/{progressId}

Indexes (recommended):
- notifications by createdAt desc; materials by courseCode+createdAt; notes by ownerUid.

### Developmental Tools (Detailed Usage)
- React Native + Expo: rapid dev, device testing, OTA updates.
- React Navigation: `StudentTabs`, `LecturerTabs`, stacks for major screens.
- Firebase: Auth for session; Firestore for notifications/materials/notes; Storage for uploads and voice notes.
- Expo modules: `expo-image-picker` and `expo-image-manipulator` for image flows; `expo-av` (or similar) for audio in `VoiceRecorder`.
- Context API: `ThemeProvider` stores theme state (with `Appearance`, `AsyncStorage`); `AppContext` manages user/session and shared state.
- UI Libraries/Patterns: gradients, shadows, iconography; responsive styles using dimensions and flex; dark-mode variants per style sheet.

## Chapter 4: Implementation and Results

### Chapter Overview
This chapter maps the logical designs to concrete implementation, outlines key algorithms and flows, presents representative code snippets, describes the testing strategy, and summarizes results.

### Mapping Logical Design onto Physical Platform
- Platform: React Native with Expo (iOS/Android). Navigation via React Navigation.
- Backend: Firebase (Auth, Firestore, Storage). AsyncStorage for client preferences (theme).
- Theming: `ThemeProvider` + `useTheme`, `Appearance` listener, and persisted preference.
- Screens/Components: Modularized per feature with dark-mode style variants and responsive layouts.

#### UI Implementation Algorithm (General)
1. Initialize theme and user context providers at app root.
2. On app start, resolve auth state; route to role-based tabs.
3. For each screen, render header, content sections, and modals; bind `onPress` handlers.
4. Apply dark-mode variants by checking `isDark` from `useTheme` for containers, text, and borders.
5. For dynamic content (notifications/materials), subscribe to Firestore listeners and update lists.

Pseudo-flowchart (textual):
- App start → Load theme → Observe auth → If user → Load tabs (Student/Lecturer) → Render dashboards → On interactions → Open modals → Fetch/submit to Firestore/Storage → Update UI via state/listeners.

#### Database Development Algorithm (Firestore/Storage)
1. Validate input (title, description, file) for materials/notifications.
2. For media uploads, push file to Storage; obtain `downloadURL`.
3. Write metadata to Firestore collection with `createdAt` and `owner` fields.
4. Attach listeners in consumer screens to reflect real-time changes.

### Construction (Representative Code Snippets)

Student Dashboard quick actions (simplified structure):
```jsx
// screens/ModernHomeDashboard.js (excerpt)
<View style={[styles.quickActionsGrid, isDark && styles.darkSection]}>
  {quickActions.map((item) => (
    <TouchableOpacity key={item.key} style={[styles.quickActionCard, isDark && styles.darkCard]} onPress={item.onPress}>
      <View style={styles.quickActionIcon}>{item.icon}</View>
      <Text style={[styles.quickActionTitle, isDark && styles.darkText]}>{item.title}</Text>
      <Text style={[styles.quickActionSubtext, isDark && styles.darkText]}>{item.subtext}</Text>
    </TouchableOpacity>
  ))}
</View>
```

Notifications header layout (simplified):
```jsx
// screens/NotificationsScreen.js (excerpt)
<View style={[styles.headerActions, isDark && styles.darkHeader]}>
  <TouchableOpacity onPress={markAllRead}><Text style={[styles.headerBtn, isDark && styles.darkHeaderTitle]}>Mark all read</Text></TouchableOpacity>
  <View style={styles.quickActionsCenter}>{/* Materials, Schedule quick buttons */}</View>
  <View style={styles.rightActions}>
    <TouchableOpacity onPress={openCreate}><Text style={styles.createButtonText}>Create</Text></TouchableOpacity>
    <TouchableOpacity onPress={openFilter}><Text style={styles.headerBtn}>Filter</Text></TouchableOpacity>
  </View>
</View>
```

Theme provider pattern:
```jsx
// App.js (excerpt)
<ThemeProvider>
  <AppProvider>
    <AppContent />
  </AppProvider>
</ThemeProvider>
```

Voice recorder flow (simplified):
```jsx
// components/VoiceRecorder.js (excerpt)
const [recording, setRecording] = useState(null);
const start = async () => { /* request perms, start recording */ };
const stop = async () => { /* stop, get file, prepare upload */ };
const send = async () => { /* upload to Storage, write Firestore metadata */ };
```

### Testing

#### Testing Plan
- Unit-level component checks for rendering under light/dark themes (manual + snapshot-ready).
- Integration tests: Firestore listeners update lists; Storage upload then Firestore metadata write.
- UI acceptance: quick action navigation/modals, notifications CRUD, materials upload/browse, profile editing, voice recording basics.
- Cross-role checks: student and lecturer tabs and dashboards.

#### Component Testing Algorithms
- UI Testing Algorithm:
  1. Render component in light theme; assert key elements exist.
  2. Switch to dark theme; assert dark variants applied.
  3. Simulate press/scroll; verify state changes and modal visibility.
- DB Testing Algorithm:
  1. Seed Firestore test document.
  2. Subscribe in screen; assert list updates.
  3. Update/delete document; assert UI reflects change.

#### System Testing Algorithms
- Verification Testing Algorithm:
  1. Validate flow conformity to requirements (navigation, actions).
  2. Validate input constraints and error messages.
  3. Validate Firestore/Storage interactions succeed under normal network.
- Validation Testing Algorithm:
  1. Review against stakeholder goals (unified workflows, dark mode consistency).
  2. End-to-end task execution (create notification → appears on other role).
  3. Performance sanity (no jank on scroll; responsive touch latency).

### Results
- All primary screens render consistently under light and dark modes.
- Student and lecturer dashboards meet layout and feature requirements (greetings, Teaching Impact, AI tools grid; quick actions with subtexts).
- Notifications creation and listing flows function; header layout restructured as requested.
- Materials upload/browse flows implemented with themed UI.
- Voice notes basic functionality implemented; extensible for production upload/transcription.
- ErrorBoundary catches runtime errors, preventing app crashes.


## Chapter 5: Findings and Conclusion

### Chapter Overview
We synthesize outcomes, reflect on challenges, and present recommendations and commercialization considerations.

### Findings
- A unified, mobile-first experience successfully reduces fragmentation for students and lecturers.
- Theming via a centralized provider ensures app-wide dark mode consistency with minimal duplication.
- Modular components (study tools, AI tools) enable rapid adjustments driven by feedback.
- Firebase services streamline auth, real-time updates, and media handling for MVP speed.

### Conclusions
- UniConnect demonstrates an effective approach for consolidating academic workflows with modern UX on mobile.
- The architecture is extensible for deeper AI integration (e.g., grading, analytics, content generation) and institutional APIs.

### Challenges / Limitations of the System
- Some advanced AI features are currently stubs and need robust backends.
- AR features are simulated; production-grade AR SDK integration is pending.
- Offline-first patterns are limited; more caching and sync needed for unreliable networks.
- Comprehensive automated testing (unit/integration) can be expanded.

### Lessons Learnt
- Early theme architecture prevents costly retrofits for dark mode.
- Named imports and consistent state patterns improve maintainability.
- Iterative user feedback is critical for layout and UX alignment.

### Recommendations for Future Works
- Implement robust AI backends for lecturer tools (NLP, grading, analytics).
- Integrate institutional systems (SIS, LMS) via secure APIs.
- Expand offline-first capabilities and background sync.
- Add end-to-end automated tests and performance monitoring.
- Productionize AR with platform SDKs and device capability checks.

### Recommendations for Project Commercialization
- Offer a SaaS model for institutions with role-based provisioning.
- Provide branded themes and custom integrations.
- Ensure compliance (FERPA/GDPR) and enterprise-grade security.
- Tiered plans: core features vs. advanced AI/analytics add-ons.

### References
- React Native and Expo documentation (`https://reactnative.dev`, `https://docs.expo.dev`).
- React Navigation (`https://reactnavigation.org`).
- Firebase (`https://firebase.google.com/docs`).
- Design patterns and theming best practices from community resources.
- Related LMS and EdTech platforms’ public docs for comparative analysis.

## Appendix E: Consolidated Change Log

This appendix consolidates major changes across iterations, including fixes, feature additions, and layout/theming updates.

E.1 General
- Full dark mode across student and lecturer sections (ThemeProvider, `useTheme`, Appearance, AsyncStorage persistence).
- Modularization of study tools (SmartNotes, MindMap, ARLearning, ProgressTracker, SemesterModules, GameCenter, FocusMode, WeekendActivities).
- Voice notes implemented via `VoiceRecorder` with recording/stop/send flow.
- Error handling via `ErrorBoundary` to prevent app crashes.

E.2 Student App
- `ModernHomeDashboard`: credentials layout aligned; quick actions restored with subtexts; 3-column grid; progress stats resized and titled; Discover section display fixes.
- Notifications: header reorganized into 3 columns; create notification enabled for students; dark-mode styles applied.
- Profile: dark-mode fixes; syntax errors resolved; improved readability.
- Class Schedule & Upload Notes: themed headers, loading states, and containers; dark variants.

E.3 Lecturer App
- `LecturerDashboard`: greetings restored; profile section removed; Teaching Impact positioned at top; AI tools modernized (gradient cards, named imports, `user` prop provided); button handlers set `selectedCourse` before opening modals.
- Notifications: layout consistent with student; create/filter/mark-all-read preserved.

E.4 Fixes and Quality
- Resolved missing/duplicate stylesheet keys, commas/colons; corrected `LinearGradient` missing `style` props; fixed mistaken onPress handlers.
- Addressed import/export mismatches (named vs default imports) in AI components.
- Created placeholder components where creation initially timed out; later expanded features.

## Appendix C: Screenshot Capture Guide

Follow these options to capture and add screenshots to `docs/images/`:

- Android device (ADB):
  - Enable Developer Options and USB debugging.
  - Connect device via USB and run: `adb exec-out screencap -p > docs/images/screen-YYYYMMDD-HHMMSS.png`.
  - For a specific activity/screen, navigate in the app before running the command.

- Android Emulator:
  - Use the emulator screenshot button or the same ADB command above.

- iOS Simulator:
  - Use Cmd+S to capture, then move files into `docs/images/`.

Naming convention examples:
- `student-dashboard-light.png`, `student-dashboard-dark.png`
- `lecturer-dashboard.png`, `notifications.png`, `upload-materials.png`, `voice-notes.png`

Once captured, the images will appear in Appendix B automatically via the relative paths already included.

## Appendix D: Screenshot Capture Script (ADB)

Create a helper script `scripts/capture_screenshot.sh` with execute permission:
```
#!/usr/bin/env bash
set -euo pipefail
mkdir -p docs/images
timestamp=$(date +"%Y%m%d-%H%M%S")
file="docs/images/screen-${timestamp}.png"
adb exec-out screencap -p > "$file"
echo "Saved $file"
```
Usage: `bash scripts/capture_screenshot.sh`

## Appendix A: UML Diagrams (ASCII)

### Figure A1: Use Case Diagram (High-Level)
```
      +----------------+                  +----------------+
      |    Student     |                  |    Lecturer    |
      +--------+-------+                  +--------+-------+
               |                                   |
      [View Dashboard]                     [View Dashboard]
               |                                   |
      [Open Quick Action]                  [Open AI Tool]
               |                                   |
      [Create Notification] <--------> [Create Notification]
               |                                   |
      [Upload/View Materials]           [Upload/View Materials]
               |                                   |
      [View Schedule]                   [View Schedule]
               |                                   |
      [Edit Profile]                    [Edit Profile]
```

### Figure A2: Activity Diagram (Create Notification)
```
(Start)
  |
  v
[Open Create Modal]
  |
  v
[Enter Title/Body]
  |
  v
{Validate?} -- No --> [Show Errors] --> (Back to Enter)
  |
 Yes
  v
[Write to Firestore]
  |
  v
[Close Modal]
  |
  v
[Listeners Update List]
  |
  v
(End)
```

### Figure A3: Sequence Diagram (Open AI Tool)
```
Lecturer -> Dashboard : Tap AI Tool
Dashboard -> State : setSelectedCourse(default)
Dashboard -> Modal : setVisible(true)
Modal -> Firebase : (optional) query contextual data
Firebase --> Modal : data
Modal -> Lecturer : render tool UI
```

### Figure A4: Class Diagram (Logical Components)
```
+-------------------+       +------------------+
| ThemeProvider     |<>-----| useTheme         |
+-------------------+       +------------------+
| themeState        |       | isDark:boolean   |
+-------------------+       +------------------+

+-------------------+       +------------------+
| AppContext        |<>-----| Screens/Components|
+-------------------+       +------------------+
| user, role        |       | props/state      |
+-------------------+       +------------------+

+-------------------+       +------------------+
| Firebase Services |<>-----| Notifications    |
+-------------------+       +------------------+
| Auth/FS/Storage   |       | Materials/Notes  |
+-------------------+       +------------------+
```

## Appendix B: Screenshots

Add screenshots to `docs/images/` and they will render here.

- Figure B1: Student Dashboard (Light):
  - ![Student Dashboard Light](docs/images/student-dashboard-light.png)
- Figure B2: Student Dashboard (Dark):
  - ![Student Dashboard Dark](docs/images/student-dashboard-dark.png)
- Figure B3: Lecturer Dashboard (AI Tools):
  - ![Lecturer Dashboard](docs/images/lecturer-dashboard.png)
- Figure B4: Notifications (Header + List):
  - ![Notifications](docs/images/notifications.png)
- Figure B5: Upload Materials:
  - ![Upload Materials](docs/images/upload-materials.png)
- Figure B6: Voice Notes:
  - ![Voice Notes](docs/images/voice-notes.png)
