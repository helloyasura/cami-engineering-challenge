# Decisions

## Prioritisation

I focused first on the core issues that most directly affected product correctness and performance: moving the classification flow into the service layer, fixing the N+1-style request list query, and making the web UI refresh immediately after mutations. I then implemented the thin history slice so the existing history page became useful without over-scoping the work.

## Assumptions

- The seeded data volume is large enough that a joined query is materially better than fetching notes per request.
- The classifier provider remains a lightweight keyword-based implementation for now, with a clear provider token so an LLM-backed implementation could be swapped in later.
- The local environment uses PostgreSQL with the existing migration runner and seed script.

## Trade-offs

- I kept the history implementation minimal by persisting classification events in a single table and exposing a filtered list endpoint, rather than adding richer sequencing, audit metadata, or provider failure handling.
- I used the existing request entity and a simple history entity rather than introducing a separate repository/port abstraction, since the current codebase is small enough that the service layer remains readable.
- I left deeper UI polish and richer filtering for a later pass so the submission stays focused on the challenge’s core requirements.

## Classification history scope

The history feature now persists each classification event, stores the category/confidence, and exposes a filtered endpoint at GET /requests/history. The web history page displays the persisted rows and allows filtering by category. I did not add a full event-sourcing model, retry policy, or real LLM provider integration.

## Stretch (if any)

If I had more time, I would add more robust history filtering, pagination, and better error handling for future provider swaps.

## What you would do with more time

I would introduce repository abstractions for persistence, add stronger tests around the history flow and request-list query, and refine the history screen UI. I would also structure the codebase around a clean-architecture style with separate layers for business logic, use cases, controllers, and presentation to improve scalability, maintainability, and reusability.
