# MVP 2 — TODO

## Quick Notes / One-off Tasks
- Add a "Quick Note" input (floating or sidebar) that saves free-text notes as tasks
- Notes are stored in a tasks table (title, body, due_date?, priority?, resolved?)
- Before each AI generation, unresolved notes are injected into the prompt context
- AI treats them as one-off scheduling requests alongside routines
- Example: "Dentist appointment Thursday afternoon" → AI slots it in
- Notes can be dismissed/resolved after generation or manually

## Scheduled Auto-Generation
- Background scheduler (APScheduler or similar) runs generation on a configurable interval (default: hourly)
- Uses all active routines + unresolved quick notes as input
- Auto-generation only proposes — still requires user confirmation (or auto-confirm toggle)
- Designed for always-on ThinkPad server deployment
- Config: interval, enabled/disabled, auto-confirm toggle, quiet hours

## Google Calendar Sync
- Google Calendar API integration (OAuth 2.0)
- Read external events into unified calendar
- Push generated events to Google Calendar
- Two-way sync like Apple Calendar ICS but read-write

## Future Ideas (unscoped)
- Task/to-do system (beyond quick notes)
- Habit tracking and streaks
- AI learns from historical patterns
- iPhone app (React Native)
- Remote access (Tailscale/tunnel)
- Push notifications
