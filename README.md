# 🗳️ VoteIt

A tiny polling app: create a poll with a question and a few options, share the link, vote, and
watch the results update with live percentages.

Built as a ~1-hour take-home. The app itself is intentionally small — the interesting part is how
it's structured: a **Clean Architecture / DDD backend**, **test-driven**, with a thin Next.js UI on
top and **CI running on every push/PR**.

> **Heads-up:** votes are stored **in memory** (see [Technical decisions](#technical-decisions)),
> so data resets when the serverless instance goes cold. This is a deliberate trade-off for the
> time box, not an oversight — the persistence layer is behind an interface and swappable.

---

## Quick start

```bash
yarn install
yarn dev            # http://localhost:3000
```

Other scripts:

```bash
yarn test           # Jest — domain, application, infra unit tests
yarn test:coverage  # with coverage
yarn typecheck      # tsc --noEmit
yarn lint           # eslint
yarn build          # next production build
```

---

## What's included

- **Create / vote / results** flow over a small REST API (`/api/polls`).
- **Clean Architecture backend** split into `domain` → `application` → `infra`, with the UI as a
  thin adapter on top.
- **Domain model** with an aggregate (`Poll`), an entity (`PollOption`), and a value object
  (`PollQuestion`) that enforce the invariants (valid question, 2–10 options, votes only via the
  aggregate).
- **Use cases** (`CreatePoll`, `CastVote`, `GetPoll`, `ListPolls`) holding the application logic,
  each with constructor **dependency injection** of a repository interface and a co-located test.
- **Repository behind a port** (`IPollRepo`) with an in-memory implementation — swappable for a real
  database without touching the domain or use cases.
- **Jest unit tests** (TDD) covering the shared kernel, domain, use cases, and the repository.
- **GitHub Actions CI** running typecheck → lint → test → build on every push and PR.
- **Shadcn UI** components (Tailwind v4) for the frontend.

## What's deliberately left out (given the time box)

| Cut | Why / what I'd add with more time |
| --- | --- |
| **Durable database** | In-memory store keeps setup at zero. A real repo (Postgres/Prisma, Redis) drops in behind `IPollRepo`. |
| **Auth & one-vote-per-user** | No accounts. Real dedup needs identity or at least a signed cookie/fingerprint; the UI's "hide buttons after voting" is cosmetic only. |
| **Poll editing / closing / expiry** | Only create + vote + read. |
| **Domain events / event bus** | The kernel has room for it (`AggregateRoot`) but it's unused here. |
| **UI component / e2e tests** | Jest is scoped to the backend logic — the highest-value coverage for the time. Would add React Testing Library + Playwright. |
| **Real-time updates** | Results refresh on action/reload, not via websockets/polling. |

## Technical decisions

- **Next.js 16 (App Router) + TypeScript.** One framework for API + UI, first-class Vercel deploy,
  strict typing end-to-end. React 19, Tailwind v4.
- **Clean Architecture / DDD**, mirroring a pattern I use in production:
  - `domain/` — entities, value objects, and the repository **interface**. Pure; depends on nothing
    but the shared kernel.
  - `application/` — one folder per use case (`CreatePollUseCase`, its typed errors, a factory, and
    its test). Use cases return an `Either<Error, Result<T>>` and never throw across the boundary.
  - `infra/` — the concrete `InMemoryPollRepo` and a `PollMapper` (domain ↔ persistence record).
  - `shared/` — a mini kernel (`Result`, `Either`, `UseCase`, `Entity`, `AggregateRoot`,
    `ValueObject`, `Guard`, `AppError`) so the app doesn't depend on a framework for its core types.
- **Dependency injection, no container.** Repositories are injected via constructors; a small
  per-use-case `*Factory` is the composition root that wires the concrete repo. The Next.js route
  handler is the controller/adapter: it validates input and maps the `Either` to HTTP status codes.
- **TDD.** Domain and use-case tests were written alongside (often before) the implementation, using
  in-memory fakes and an Object Mother (`PollMother`) — no mocking framework for repositories.
- **In-memory persistence** as a module-level store hidden behind `IPollRepo`. The clean boundary is
  exactly what makes this an honest one-line swap later.
- **CI/CD.** GitHub Actions runs the full gate (typecheck, lint, test, build) on push/PR. Deployment
  is handled by Vercel's native Git integration (connected after the first merge) — no secrets in the
  repo.

## Project structure

```
src/
├── shared/                      # framework-agnostic kernel
│   ├── core/                    # Result, Either, UseCase, Guard, AppError, UseCaseError
│   └── domain/                  # Entity, AggregateRoot, ValueObject, UniqueEntityID
├── contexts/polls/              # the "polls" bounded context
│   ├── domain/                  # Poll, PollOption, PollQuestion, IPollRepo
│   ├── application/             # one folder per use case (UseCase + Errors + Factory + test)
│   ├── infra/                   # InMemoryPollRepo, PollMapper
│   └── tests/                   # PollMother test-data builder
└── app/                         # Next.js App Router (thin adapters)
    ├── api/polls/…              # route handlers → use-case factories
    ├── components/              # CreatePollForm, PollResults
    ├── lib/pollsClient.ts       # browser API client
    ├── page.tsx                 # home: create + list
    └── polls/[id]/page.tsx      # vote + results
```

## How I used AI

Built with Claude, working the way I actually do:

- **Scoped first, coded second.** I had Claude explore a reference DDD codebase and produce a plan
  (stack, structure, what to cut) that I reviewed and adjusted before any code was written.
- **Acceleration:** scaffolding, the repetitive use-case/test/factory slices, and the shadcn UI.
- **Where I overrode it:** simplifying the `Result` error type to a plain message string after the
  generic version fought the type system; typing route `params` explicitly instead of relying on
  Next 16's build-time-generated `RouteContext` (so `tsc` stands alone in CI); keeping the
  `namespace`-based typed errors and scoping the lint exception rather than dropping the pattern.

---

Bootstrapped with `create-next-app`.
