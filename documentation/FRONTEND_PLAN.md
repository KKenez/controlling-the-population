# Frontend Plan — PC Management UI

## Tech Stack

- **Framework:** React 18+ with TypeScript
- **Build tool:** Vite
- **Routing:** react-router-dom
- **Data fetching:** TanStack Query (react-query)
- **Styling:** Tailwind CSS
- **Date handling:** date-fns
- **Icons:** lucide-react
- **HTTP:** Native fetch (wrapper in api/client.ts)

---

## Folder Structure

```
frontend/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example                    # API_URL=http://localhost:8000
├── tailwind.config.ts
├── postcss.config.js
│
├── public/
│   └── favicon.svg
│
├── src/
│   ├── main.tsx                    # App entry, React root
│   ├── App.tsx                     # Router setup, layout shell
│   ├── vite-env.d.ts
│   │
│   ├── api/                        # Backend communication layer
│   │   ├── client.ts              # Fetch wrapper, base URL config
│   │   ├── calendar.ts            # getEvents(), createEvent(), syncCalendars()
│   │   ├── routines.ts            # CRUD: getRoutines(), createRoutine(), etc.
│   │   ├── generation.ts          # generateWeek(), confirmWeek(), rejectWeek()
│   │   └── ai.ts                  # sendMessage(), getConversation()
│   │
│   ├── types/                      # Shared TypeScript types
│   │   ├── event.ts               # Event, RecurringEvent, CalendarSource
│   │   ├── routine.ts             # Routine, Constraint, LifeArea, PriorityLevel
│   │   ├── generation.ts          # GeneratedWeek, ProposedEvent, GenerationStatus
│   │   └── ai.ts                  # ChatMessage, ConversationState
│   │
│   ├── pages/                      # Top-level route pages
│   │   ├── CalendarPage.tsx       # Main unified calendar view
│   │   ├── RoutinesPage.tsx       # List of all routines + create new
│   │   ├── RoutineEditorPage.tsx  # Edit single routine
│   │   ├── GenerateWeekPage.tsx   # The "generate my week" flow
│   │   └── SettingsPage.tsx       # AI config, calendar connections
│   │
│   ├── components/                 # Reusable UI components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   │   ├── Header.tsx         # Top bar
│   │   │   └── PageLayout.tsx     # Wrapper: sidebar + content area
│   │   │
│   │   ├── calendar/
│   │   │   ├── WeekView.tsx       # 7-day calendar grid
│   │   │   ├── DayColumn.tsx      # Single day with time slots
│   │   │   ├── EventCard.tsx      # Single event in the grid
│   │   │   └── CalendarToolbar.tsx # Week nav, view controls
│   │   │
│   │   ├── routines/
│   │   │   ├── RoutineCard.tsx    # Summary card in the list
│   │   │   ├── RoutineForm.tsx    # Form: name, life area, constraints
│   │   │   └── ConstraintEditor.tsx # Time/day constraint UI
│   │   │
│   │   ├── generation/
│   │   │   ├── RoutineSelector.tsx # Pick routines to run
│   │   │   ├── AiChat.tsx         # Chat for conversational refinement
│   │   │   ├── ProposedWeekView.tsx # Preview AI-generated events
│   │   │   └── ConfirmBar.tsx     # Accept / Reject / Edit actions
│   │   │
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       ├── Badge.tsx          # Life area / priority tags
│   │       └── LoadingSpinner.tsx
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useEvents.ts          # Fetch & cache calendar events
│   │   ├── useRoutines.ts        # Fetch & cache routines
│   │   └── useGeneration.ts      # Manage generate-week flow state
│   │
│   ├── store/                      # Global state (lightweight)
│   │   └── index.ts              # React context or Zustand
│   │
│   └── utils/
│       ├── dates.ts               # Date helpers (week boundaries, formatting)
│       └── colors.ts              # Calendar source → color mapping
│
└── README.md
```

---

## Pages Detail

### CalendarPage
- Default: current week, 7 columns, hourly rows
- Events color-coded by source (Work 1 = blue, Work 2 = teal, Personal = green, AI-generated = purple)
- Toolbar: navigate weeks, "Generate this week" button
- Click event → detail popover (read-only in MVP)

### RoutinesPage
- Grid/list of routine cards (name, life area badge, frequency)
- "New Routine" button → RoutineEditorPage
- Click card → RoutineEditorPage

### RoutineEditorPage
- Form: name, life area (dropdown), description
- Constraints: time windows, day preferences, exclusion rules
- Parameters: frequency (times/week), duration, flexibility
- Save / Delete

### GenerateWeekPage
- **Step 1:** RoutineSelector — checkboxes for routines to include
- **Step 2:** AiChat — optional conversational refinement
- **Step 3:** ProposedWeekView — calendar preview, editable
- **Step 4:** ConfirmBar — "Push to Calendars" / "Regenerate" / "Cancel"

### SettingsPage
- Calendar connections: OAuth status, re-auth buttons
- AI config: local vs remote, model selection, API key
- Preferences: working hours, priority ordering

---

## Key Libraries

| Purpose | Library | License |
|---------|---------|---------|
| Routing | react-router-dom | MIT |
| Data fetching | @tanstack/react-query | MIT |
| Styling | tailwindcss | MIT |
| Dates | date-fns | MIT |
| Icons | lucide-react | ISC |
| Calendar grid | Custom build (or @schedule-x/react) | MIT |
