# Copilot Instructions — Controlling the Population

## Project Overview

This is a **personal life management system** with AI-powered calendar scheduling. It combines:
- A unified calendar aggregating multiple sources (2x Outlook work, 1x Google personal)
- A **routine engine** that defines life-area programs (Fitness, Deep Work, Social, etc.)
- An **AI agent** (local LLM via Ollama or remote API) that generates a full week's schedule from selected routines
- Two interfaces: **iPhone app** (read-heavy) and **PC web UI** (full management)

The system is **self-hosted on a Windows laptop** — the laptop IS the server.

---

## Architecture

```
iPhone App (React Native/Flutter)  ←→  Backend (Python/FastAPI)  ←→  PC Web UI (React/Vite)
                                              │
                                    ┌─────────┼─────────┐
                                    │         │         │
                              Calendar    Routine     AI Agent
                              Sync        Engine     (Ollama/API)
                              Engine        │
                                │           │
                              SQLite DB (local file)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12+, FastAPI, SQLAlchemy, SQLite |
| Frontend (PC) | React 18, Vite, TypeScript, Tailwind CSS, TanStack Query |
| Frontend (Mobile) | React Native or Flutter (TBD) |
| AI | Ollama (local), OpenAI/Anthropic (remote fallback) |
| Calendar APIs | MS Graph API (Outlook), Google Calendar API |
| Auth | OAuth 2.0 (calendar providers), simple token (app access) |

---

## Project Structure

```
/
├── backend/              # Python/FastAPI server
│   ├── app/
│   │   ├── main.py      # FastAPI app entry
│   │   ├── models/      # SQLAlchemy models (Event, Routine, etc.)
│   │   ├── routers/     # API route modules
│   │   ├── services/    # Business logic (calendar sync, routine engine, AI)
│   │   ├── schemas/     # Pydantic request/response schemas
│   │   └── config.py    # Settings and env vars
│   ├── requirements.txt
│   └── tests/
├── frontend/             # React + Vite PC web UI
│   ├── src/
│   │   ├── api/         # Backend API client layer
│   │   ├── types/       # TypeScript types (mirror backend models)
│   │   ├── pages/       # Route pages
│   │   ├── components/  # UI components (layout, calendar, routines, generation)
│   │   ├── hooks/       # Custom React hooks
│   │   ├── store/       # Global state
│   │   └── utils/       # Helpers (dates, colors)
│   └── package.json
├── documentation/        # Architecture docs, plans
└── .github/              # Copilot config
```

---

## Core Domain Concepts

- **Event**: A calendar entry (title, start, end, source, location, notes)
- **CalendarSource**: `work1` | `work2` | `personal` | `generated`
- **Routine**: A life-area template with constraints and parameters the AI uses to generate events
- **LifeArea**: `fitness` | `work` | `personal` | `social` | `learning` | `health`
- **PriorityLevel**: `critical` | `high` | `medium` | `low` | `flexible`
- **TimeConstraint**: Allowed time windows, preferred/excluded days
- **GeneratedWeek**: A set of AI-proposed events pending user approval

---

## Coding Conventions

### Python (Backend)
- Use **FastAPI** with async endpoints where possible
- Models in SQLAlchemy declarative style
- Pydantic v2 for all request/response schemas
- Type hints everywhere
- Business logic goes in `services/`, not in route handlers
- The LLM client should be abstract (interface pattern) so local/remote can be swapped
- Config via environment variables (python-dotenv or Pydantic Settings)

### TypeScript (Frontend)
- Strict TypeScript — no `any` types
- React functional components only
- TanStack Query for all server state (no manual fetch + useState)
- Tailwind CSS for styling — no CSS-in-JS
- Types in `src/types/` mirror backend Pydantic schemas
- API calls isolated in `src/api/` — components never call fetch directly

### General
- No over-engineering: build only what's needed for the current MVP
- Favor simplicity over abstraction
- Comments only where intent isn't obvious from the code
- Commit messages: imperative mood, concise

---

## Key Patterns

### Calendar Sync
- Pull events from MS Graph / Google Calendar APIs into local SQLite
- External events are read-only locally (source of truth is the provider)
- AI-generated events are created locally first, then pushed to the appropriate calendar
- Conflict detection: never overlap with existing provider events

### Routine Engine
- Routines define WHAT should happen (3x gym per week, 45min each, not before 7am)
- The AI decides WHEN, respecting constraints + existing events
- Validation layer checks AI output against routine constraints before presenting to user

### AI Integration
- Abstract `LLMClient` interface with `generate(prompt, context) -> str`
- `OllamaClient` and `RemoteAPIClient` implementations
- Prompt templates stored as strings/files in `backend/app/services/ai/prompts/`
- AI receives: routine params + existing calendar + user preferences → outputs JSON event list

### Week Generation Flow
1. User selects routines to include
2. (Optional) Short AI conversation to clarify preferences
3. AI generates proposed events as JSON
4. Backend validates against constraints
5. Frontend shows preview (editable)
6. User confirms → events pushed to external calendars

---

## MVP 1 Scope

**In scope:**
- Unified calendar view (3 sources merged)
- Routine CRUD (create, edit, delete routines)
- AI week generation (select routines → get a proposed week → confirm)
- Two-way calendar sync (read external, write generated)
- PC web UI as primary interface

**Out of scope (MVP 2+):**
- Task/to-do system
- Habit tracking and streaks
- AI learning from history
- Mobile app (iPhone)
- Remote access (Tailscale/tunnel)
- Push notifications
