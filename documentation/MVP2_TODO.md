# Roadmap

| Phase | Focus | Summary |
|-------|-------|---------|
| MVP 1 | Core platform | ✅ Calendar, routines, AI generation, PC web UI |
| MVP 2 | Intelligence & depth | Goals/quests/backlog rework, day review, auto-generation, quick notes, circulation dashboard |
| MVP 2.5 | Money | Budgeting module, spending tracker, category goals |
| MVP 3 | Mobile | iPhone app (barebones — read calendar, quick notes, day review) |
| MVP 4 | Polish | Major UI/UX design pass across all platforms |

---

# MVP 2 — Intelligence & Depth

The system gets smarter and the domain model gets richer.

---

## 1. Quick Notes / One-off Tasks
Free-text input for things that aren't routines but need scheduling.

- Floating "Quick Note" input on calendar page (or persistent sidebar widget)
- Stored in `notes` table: text, created_at, due_hint (optional), resolved, linked_event_id
- Before each AI generation, all unresolved notes are appended to the prompt
- AI treats them as one-off scheduling requests alongside routines
- After generation confirms, matched notes auto-link to the created event
- User can also manually resolve/dismiss notes
- Examples:
  - "Dentist appointment Thursday afternoon"
  - "Buy birthday gift for Mom before Saturday"
  - "30min call with Jake sometime this week"

---

## 2. Day Closing Review
End-of-day session where the system walks through today's events for reflection and feedback.

### Flow
1. Triggered manually (button) or via scheduled prompt (notification at e.g. 21:00)
2. System presents each event scheduled for today, one by one
3. For each event, user marks: **completed** / **skipped** / **partial** / **dismiss**
4. Optional free-text feedback per event (timing accuracy, what was learned, how it felt, blockers)
5. Summary saved as a `daily_review` record

### Data Model
- `daily_review`: date, completed_at, overall_notes
- `event_review`: event_id, daily_review_id, status (completed/skipped/partial/dismissed), feedback_text, actual_duration_minutes

### AI Feedback Loop
- Past event reviews are fed to the AI as historical context during generation
- Patterns the AI can learn from:
  - "User always skips 7am gym → suggest 8am instead"
  - "User says 45min is too short for deep work → increase to 60min"
  - "User consistently skips Friday social → deprioritize Fridays"
- Start simple: inject last 2 weeks of reviews into the prompt
- Later (MVP 3+): embeddings / summarization for longer history

### UI
- Dedicated "Day Review" modal or page, accessible from calendar view
- Card-per-event layout with status buttons + collapsible feedback textarea
- Summary view: completion rate, streaks, patterns over time

---

## 3. Scheduled Auto-Generation
Periodic background generation for the always-on ThinkPad server.

- APScheduler (or similar) cron trigger, default interval: hourly
- Inputs: all active routines + unresolved quick notes + recent event reviews
- Auto-generation only proposes — requires user confirmation (configurable auto-confirm toggle)
- Smart scheduling: only regenerate if calendar has changed or new notes exist since last run
- Config stored in settings: interval, enabled/disabled, auto-confirm, quiet hours (e.g. no generation 23:00-07:00)
- Generation log: track each auto-run (timestamp, trigger reason, # events proposed)

---

## 4. Google Calendar Sync
- Google Calendar API integration (OAuth 2.0)
- Read external events into unified calendar
- Push generated events to Google Calendar
- Two-way sync like Apple Calendar ICS but read-write

---

## MVP 2.5 — Budgeting Module
Daily spending tracker with categorization and goals.

### Core Concept
End-of-day (or anytime) input: "what did I spend today and on what?"
System tracks spending over time and provides weekly/monthly summaries.

### Data Model
- `expense`: amount, currency, category_id, description, date, created_at
- `expense_category`: name, icon, color, monthly_budget (optional)
- `budget_period`: month/week, category_id, budget_amount, actual_amount (computed)

### Categories (default set, user-customizable)
- Groceries, Eating Out, Transport, Entertainment, Subscriptions, Health, Shopping, Bills, Savings, Misc

### Features
- Quick expense entry (amount + category, optional description)
- Daily spending summary
- Weekly/monthly breakdown by category (bar chart or table)
- Budget goals per category with progress indicators
- Over-budget alerts
- Integration with day closing review: "Log today's spending" step

### UI
- Spending input: minimal form (amount, category dropdown, optional note)
- Dashboard: monthly overview, category breakdown, trend charts
- Could live as a tab in Settings or its own page

---

## 5. Goals, Quests & Backlog — Routine System Rework

Replace the flat "Life Areas → Routines" model with a richer hierarchy.

### Core Concepts

**Goal** — A long-term, ongoing objective requiring consistent effort.
- Has a name, description, life area, and contains **routines** (recurring scheduled sessions)
- Never "completes" — it's a direction, not a destination
- Examples: "Get fit", "Learn to bake", "Master Spanish", "Build a reading habit"
- A goal's routines define WHAT gets scheduled (3x gym/week, 2x baking practice/week)

**Quest** — A one-off objective with a clear completion criteria.
- Has a name, description, life area, estimated effort, and **done-when** criteria
- AI asks for the completion criteria when creating a quest
- Once criteria met (user confirms), quest is resolved and removed from circulation
- Can optionally generate scheduled sessions (like a mini-routine) until complete
- Examples: "Bake a cherry pie" (done when: "I've baked one and it tastes good"), "Set up home NAS" (done when: "NAS is running and accessible from all devices")

**Backlog** — The pool of goals/quests NOT currently being scheduled.
- Everything starts in the backlog by default
- User (or AI) moves items from backlog → active circulation
- Think of it as a "someday/maybe" list that feeds the scheduler
- User can tell the AI: "activate this" or "shelve this for now"

**Active / In Circulation** — Goals and quests the AI currently schedules from.
- The AI only generates events for active items
- Dashboard view showing everything currently in circulation
- Capacity awareness: AI can warn if too many things are active

### Data Model Evolution

```
Current (MVP 1):
  LifeArea → Routine

New (MVP 2):
  LifeArea → Goal → Routine(s)
             Quest (completable, has done_when criteria)
  
  Both Goal and Quest have: status = backlog | active | paused | completed (quest only)
```

- `goal`: id, name, description, life_area_id, status, created_at
- `quest`: id, name, description, life_area_id, status, done_when, estimated_sessions, created_at, completed_at
- `routine`: id, name, goal_id (nullable — can be standalone or under a goal), frequency, duration, constraints, ...
- Existing routines gain an optional `goal_id` FK — migration path: standalone routines still work

### Backlog UI
- Dedicated "Backlog" page or section in sidebar
- List of all goals/quests grouped by life area, filterable by status
- Drag or button to move items: backlog ↔ active ↔ paused
- "Activate" action tells AI to start scheduling it
- "Shelve" action moves back to backlog without deleting

### Circulation Dashboard
- "What's Active" view — everything the AI is currently scheduling from
- Grouped by life area, showing:
  - Active goals with their routines and weekly time commitment
  - Active quests with progress toward completion criteria
  - Quick notes awaiting scheduling
- Total weekly hours committed vs available — capacity meter
- AI can suggest: "You have 3 hours of free capacity, consider activating something from your backlog"

### Quest Lifecycle
1. User creates quest with description
2. AI asks: "What does 'done' look like for this?" → user provides criteria
3. Quest goes to backlog (or directly to active)
4. When active, AI schedules sessions for it (like a temporary routine)
5. During day review, user can mark quest as completed
6. Completed quests archive with their history and feedback

### Migration from MVP 1
- Existing `life_area` table stays
- Existing `routine` table gets optional `goal_id` FK
- Routines without a goal still work (backward compatible)
- New `goal` and `quest` tables added
- Frontend: Routines page becomes "Goals & Quests" page
- Generate page: shows active goals/quests/routines + quick notes

---

## 6. Circulation Dashboard
A single view of "what's currently active" — the cockpit for the whole system.

### Layout
- Top: **Capacity meter** — total committed hours/week vs available hours/week
  - Available = waking hours minus external calendar events (work meetings, etc.)
  - Committed = sum of all active routine frequencies × durations
  - Visual: progress bar or gauge, color shifts as you approach capacity
- Main content, grouped by life area:
  - **Active Goals** — name, routines underneath with frequency/duration, expand to see recent reviews
  - **Active Quests** — name, done-when criteria, # sessions completed so far, progress indicator
  - **Quick Notes** — unresolved notes awaiting next generation
- Bottom: **Backlog preview** — "3 goals and 5 quests shelved" with link to full backlog

### Actions from Dashboard
- Pause/shelve any active item → moves to backlog
- Pull from backlog → activate
- Edit routine params inline (frequency, duration)
- "Generate now" shortcut — triggers generation with current active set

---

## MVP 2 Build Order

Recommended sequence (each builds on the previous):

1. **Goals & Quests data model** — new tables, migration, backend CRUD APIs
2. **Backlog + activation flow** — backend status transitions, frontend backlog page
3. **Quick Notes** — simple table + UI + inject into prompt (quick win, immediately useful)
4. **Day Closing Review** — data model + UI + prompt injection of recent reviews
5. **Circulation Dashboard** — read-only aggregation view of active items + capacity
6. **Scheduled Auto-Generation** — APScheduler background task, settings config
7. **Google Calendar Sync** — OAuth flow, two-way sync (can be deferred further if not needed)

---
---

# MVP 2.5 — Budgeting & Money

Separate domain module, but integrated with the daily review flow.

---

## Core Concept
End-of-day (or anytime) input: "what did I spend today and on what?"
Track spending over time, categorize, set budget goals, surface weekly/monthly figures.

## Data Model
- `expense`: id, amount, currency, category_id, description, date, created_at
- `expense_category`: id, name, icon, color, monthly_budget (optional goal)
- `budget_period`: month, category_id, budget_amount, actual_amount (computed)

## Default Categories (user-customizable)
Groceries, Eating Out, Transport, Entertainment, Subscriptions, Health, Shopping, Bills, Savings, Misc

## Features
- Quick expense entry (amount + category, optional note)
- Daily spending summary
- Weekly/monthly breakdown by category (table or chart)
- Budget goals per category with progress indicators
- Over-budget warnings
- Integration with day closing review: "Log today's spending" as a step
- Monthly summary view: total in/out, category comparison, trends

## UI
- New "Budget" page in sidebar
- Expense input: minimal form (amount field, category dropdown, optional description, date defaults to today)
- Dashboard: current month overview, per-category bars showing spent vs budget
- History: scrollable list of past expenses with filters

## Possible Enhancements (later)
- Income tracking (salary, freelance, etc.)
- Savings goals with progress
- Recurring expenses (rent, subscriptions) auto-logged
- CSV/bank statement import
- AI insights: "You spent 40% more on eating out this month vs last"

---
---

# MVP 3 — iPhone App (Barebones)

The mobile companion for on-the-go use. Read-heavy, quick interactions only.

---

## Tech
- React Native (Expo) — shares TypeScript types with web frontend
- Connects to same backend API (via Tailscale or local network initially)
- Later: remote access via Tailscale/Cloudflare tunnel for anywhere access

## Scope (minimal)
- **View unified calendar** — day and week view, color-coded by source
- **Quick Note input** — single text field + submit, feeds into the notes system
- **Day Closing Review** — walk through today's events, mark status, write feedback
- **Expense logging** — quick entry from phone (most spending happens away from laptop)
- **Push notifications** — upcoming event reminders, day review prompt at 21:00
- **View circulation** — read-only view of active goals/quests

## Out of Scope for MVP 3
- Routine/goal/quest editing (use PC for that)
- Full generation flow (PC-only)
- Backlog management (PC-only)
- Settings configuration (PC-only)

## Key Design Decisions
- Offline-first for reads (cache calendar + active items locally)
- Quick Note and expense entry work offline, sync when connected
- Minimal navigation: 3-4 tabs max (Today, Calendar, Add, Review)

---
---

# MVP 4 — Design & Polish

Major UI/UX overhaul across all platforms. Make it look and feel premium.

---

## Goals
- Cohesive visual identity across PC web and iPhone app
- Smooth animations and transitions
- Delightful micro-interactions
- Information density done right (not cramped, not wasteful)
- Dark mode as primary (Kimbie Dark evolved), optional light mode

## PC Web UI
- Design system formalization: component library with consistent spacing, typography, elevation
- Calendar: smoother drag interactions, better event resize, richer event cards
- Circulation dashboard: data visualizations (charts, gauges, progress rings)
- Backlog: drag-and-drop reordering, kanban-style board option
- Day review: polished card-per-event flow with animations
- Budget: proper charts (recharts or similar), sparklines, trend indicators
- Transitions between pages (page-level animations)
- Toast notifications for actions (event created, generation complete, etc.)
- Keyboard shortcuts for power users

## iPhone App
- Native-feeling gestures and transitions
- Haptic feedback on key actions
- Widget support (iOS home screen widget showing today's schedule)
- Adaptive layouts for different iPhone sizes
- Pull-to-refresh, smooth scroll, skeleton loading states

## Cross-platform
- Shared design tokens (colors, spacing, typography) between web and mobile
- Consistent iconography (Lucide on web, SF Symbols on iOS, or unified icon set)
- Motion design language: what animates, how, and why

## Process
- Start with design mockups/wireframes (Figma or similar) before coding
- Component-by-component implementation
- User testing with real daily use before finalizing

---
---

# Future Ideas (MVP 5+, unscoped)
- Habit tracking and streaks (layer on goal routines)
- AI learns from long-term history (embeddings, vector search, pattern summarization)
- Quarterly reviews: AI summarizes goal progress, suggests reprioritization
- Remote access always-on (Tailscale/Cloudflare tunnel, proper auth)
- Multi-device sync (conflict resolution)
- Voice input for quick notes and expense logging
- Calendar sharing / collaborative scheduling
- Integration with other tools (Notion, Todoist, etc.)
