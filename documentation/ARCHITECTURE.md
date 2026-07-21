# ARCHITECTURE

## Overview

A personal life management system with two interfaces:
- **iPhone app** — Day-to-day view: check your schedule, get notifications, quick interactions
- **PC management interface** (Windows laptop) — The command center: edit routines, configure the AI agent, manage calendar details, define goals and parameters

An AI agent runs on the backend (locally on the laptop or via subscription LLM) and populates your calendar by executing **routines** — structured templates tied to areas of your life.

---

## Roadmap

### MVP 1 — Calendar + AI Week Generator

**Goal:** A unified calendar that pulls from all your real calendars, plus an AI that can generate a week's plan from your routines.

**Scope:**
- Aggregate and display three calendars:
  - Work Calendar 1 (MS Office / Outlook)
  - Work Calendar 2 (MS Office / Outlook)
  - Personal Calendar (Google Calendar — could migrate to Apple or other)
- Two-way sync: events created by the system push back to the source calendars
- PC management interface (web app served from the laptop) for:
  - Viewing the unified calendar
  - Defining and editing **routines** (see below)
  - Triggering "generate my week" for a target week
- AI week generation:
  - User selects which routines to run for a given week
  - AI reads routine parameters + existing calendar events (work meetings, etc.)
  - Optional short AI conversation to clarify preferences ("heavy gym week or recovery?")
  - AI outputs a proposed week → user reviews → confirm → events pushed to calendars
- iPhone app (read-heavy in MVP 1):
  - View the unified calendar
  - Receive push notifications / reminders
  - Quick confirm/snooze/reschedule actions
- LLM integration:
  - **Option A:** Local model on the Windows laptop (e.g., llama.cpp, Ollama)
  - **Option B:** Subscription API (OpenAI, Anthropic, etc.)
  - MVP 1 can start with either; architecture should support swapping

**Out of scope for MVP 1:** Task management, habit streaks, long-term goal tracking, advanced AI learning from history.

### MVP 2+ (Future — not yet scoped)
- Full task / to-do system
- Habit tracking and streaks
- Life planner: long-term goals, milestones, reviews
- AI learns from your patterns over time
- Richer iPhone interactions (edit events, manage routines on mobile)

---

## Core Concepts (Data Model — sketch)

> Full class design to come later. Capturing the key ideas now.

- **Event** — A single calendar entry (title, start, end, location, notes, source calendar)
- **Recurring Event** — An event with a recurrence rule (daily, weekly, custom)
- **Routine** — A named template tied to a life area (e.g., "Fitness", "Deep Work", "Social"). Contains:
  - Parameters / criteria the AI uses to generate events
  - Constraints (e.g., "gym only before 9am or after 6pm", "no runs on leg day + 1")
  - Default duration, frequency, flexibility level
- **Priority Level** — Determines what yields to what when scheduling conflicts arise
- **Life Area** — A category grouping routines (Fitness, Work, Personal, Social, etc.)
- **Generated Week** — A snapshot of AI-proposed events for a week, pending user approval

---

## High-Level Architecture (MVP 1)

```
┌──────────────────┐       ┌──────────────────────────┐
│   iPhone App     │       │   PC Management UI       │
│  (SwiftUI/RN)    │       │   (Web app, browser)     │
│  read-heavy,     │       │   full control:          │
│  notifications   │       │   routines, calendar,    │
│                  │       │   AI config, week gen    │
└───────┬──────────┘       └────────────┬─────────────┘
        │                               │
        │         REST / WebSocket      │
        └───────────┬───────────────────┘
                    ▼
        ┌───────────────────────┐
        │     Backend Server    │
        │  (runs on Win laptop) │
        │                       │
        │  ┌─────────────────┐  │
        │  │ Calendar Sync   │  │  ← MS Graph API (Outlook x2)
        │  │ Engine          │  │  ← Google Calendar API
        │  └────────┬────────┘  │
        │           │           │
        │  ┌────────▼────────┐  │
        │  │ Routine Engine  │  │  ← stores routine definitions
        │  │ + Scheduler     │  │  ← resolves conflicts & constraints
        │  └────────┬────────┘  │
        │           │           │
        │  ┌────────▼────────┐  │
        │  │  AI Agent       │  │  ← local LLM (Ollama/llama.cpp)
        │  │  (LLM interface)│  │     or remote API (OpenAI, etc.)
        │  └────────┬────────┘  │
        │           │           │
        │  ┌────────▼────────┐  │
        │  │   Database      │  │  ← SQLite or Postgres
        │  │   (local)       │  │
        │  └─────────────────┘  │
        └───────────────────────┘
```

## Components

### iPhone App
- View unified calendar (all three sources merged)
- Push notifications for upcoming events
- Quick actions: confirm, snooze, reschedule
- Lightweight in MVP 1 — most management happens on PC

### PC Management Interface
- Web app served locally from the laptop (accessible via browser)
- Full calendar view with source-color-coding
- Routine editor: create/edit routines, set parameters, constraints
- "Generate Week" flow: pick routines → optional AI chat → review proposed events → confirm
- AI configuration: choose model, set personality/preferences

### Backend Server (Windows Laptop)
- Runs locally — the laptop is the server
- Exposes API for both the iPhone app and the PC web UI

### Calendar Sync Engine
- Connects to MS Graph API for the two Outlook work calendars
- Connects to Google Calendar API for personal calendar
- Pulls events into unified store; pushes AI-generated events back out
- Handles conflict detection (don't double-book over work meetings)

### Routine Engine
- Stores routine definitions (parameters, constraints, defaults)
- When "generate week" is triggered, feeds routine data + existing events to the AI
- Validates AI output against constraints before presenting to user

### AI Agent
- Receives: routine parameters, existing calendar, user preferences
- Produces: a proposed set of events for the target week
- Can engage in short conversation to clarify ambiguity
- Swappable backend:
  - **Local:** Ollama running a model (e.g., Llama 3, Mistral) on the laptop
  - **Remote:** OpenAI / Anthropic API via subscription
- Prompt templates stored and versioned in the repo

### Database
- Local database on the laptop (SQLite for simplicity, Postgres if needed)
- Stores: unified events, routines, generated weeks, user preferences, AI conversation logs

---

## Calendar Integration Details

| Calendar       | Provider | API                    | Auth / Method         | Status |
|----------------|----------|------------------------|-----------------------|--------|
| Apple Home     | Apple    | ICS subscription URL   | Public ICS link       | ✅ Done |
| Apple Work     | Apple    | ICS subscription URL   | Public ICS link       | ✅ Done |
| Work 1         | Outlook  | Manual entry           | N/A (org blocks ICS)  | ✅ Manual |
| Work 2         | Outlook  | Manual entry           | N/A (org blocks ICS)  | ✅ Manual |
| Personal       | Google   | Google Calendar API    | OAuth 2.0 (Google)    | ⬜ Future |

**Notes:**
- Apple calendars sync via ICS subscription URLs (fetched + parsed with `icalendar` library)
- Work Outlook calendars cannot be synced automatically — org policy blocks ICS publishing and MS Graph registration is not feasible. Events are added manually via the UI.
- The system is the "source of truth" for AI-generated and manually-added events; Apple ICS feeds are the source of truth for Apple calendar events
- Google Calendar integration deferred to future scope

---

## AI / LLM Strategy

### Local-first approach (MVP 1 default)
- Run Ollama on the Windows laptop
- Download a capable model (Llama 3 8B, Mistral 7B, or similar)
- No subscription cost, full privacy, works offline
- Trade-off: limited by laptop hardware, smaller model capabilities

### Remote API fallback
- OpenAI (GPT-4o-mini for cost efficiency) or Anthropic (Claude)
- Better reasoning for complex scheduling
- Requires internet, has per-token cost

### Hybrid option
- Use local model for simple routine execution
- Escalate to remote API for complex planning or conversational flows

---

## Key Design Decisions

- [x] Two interfaces: iPhone (view/quick actions) + PC (full management)
- [x] Backend runs on local Windows laptop
- [x] LLM: local-first with remote fallback option
- [x] PC web UI framework: **React 18 + Vite + TypeScript + Tailwind CSS**
- [x] Backend language/framework: **Python 3.12+ / FastAPI / SQLAlchemy (async)**
- [x] Database: **SQLite** (via aiosqlite)
- [x] Calendar sync: **Apple ICS** (automated), **Outlook** (manual entry)
- [ ] iPhone framework: SwiftUI native vs React Native vs Flutter
- [ ] How to expose laptop server to iPhone (local network, tunnel, VPN?)
- [ ] Notification infrastructure for iPhone

## Open Questions

- Laptop-to-iPhone connectivity: Tailscale/VPN for always-on access, or sync to a cheap cloud relay?
- How much conversational AI in MVP 1 vs. just parameter-driven generation?
- Should generated weeks be editable event-by-event before confirming?
- Personal calendar: stay Google, switch Apple, or consolidate to Outlook?
