# VoteIt — Clean Architecture Poll/Vote App (Next.js + TS + Jest)

## Context

Senior-engineer take-home: build a small, genuinely done app from a blank page in ~1 hour,
showing stack/structure/tooling judgment, delivery quality, and CI/CD wired up by default.
We're building **VoteIt** — a small multi-poll voting app: create a poll (question + options),
open it, cast a vote, and watch live results (bars + percentages).

The point isn't the app's size — it's demonstrating deliberate engineering choices under a time
box: **Clean Architecture / DDD backend** (mirroring the reference `@wildmetrics/reports`
package the user pointed to), **TDD with Jest**, **Dependency Injection via constructor + factories**,
a **Shadcn** frontend, and **GitHub Actions CI** that runs on push/PR with Vercel deploy on merge
(user connects Vercel after the first merge).

Workspace is an empty git worktree on branch `franco-fiorotto/vote-app-clean-arch`
(remote `github.com/franco-fiorotto/voteit`). Nothing to conflict with.

### Confirmed decisions
- **Persistence:** in-memory module-singleton repo behind `IPollRepo`. Zero infra; resets on
  serverless cold-start — called out as a deliberate cut in the README. Clean-arch means a real DB
  impl drops in behind the same interface later.
- **Scope:** multi-poll (create / open / vote / results).
- **DDD depth:** full mirror — mini shared kernel + entities + value objects.

## Architecture Overview

Reference pattern (Khalil-Stemmler DDD/TS) to mirror:
`Result<T>` + `Either`/`left`/`right`, `UseCase<Req,Res>` interface, `AggregateRoot`/`ValueObject`
base classes, `UniqueEntityID`, `Guard`, `AppError`/`UseCaseError`. Repo **interfaces in `domain/`**,
**impls in `infra/`**, **manual DI via `*Factory`** (no container), **`InMemory*Repo` + `*Mother`**
test doubles, **co-located `*.test.ts`**. UseCases wrap body in try/catch and return
`Either<ErrorUnion, Result<Success>>` — never throw to caller.

## Directory Structure

```
/ (repo root)
├── .github/workflows/ci.yml          # install → typecheck → lint → test → build
├── .gitignore                        # node_modules, .next, coverage, .env*, .vercel
├── README.md                         # what's in / what's out / decisions / how AI was used
├── package.json                      # next, react, ts, jest, ts-jest, shadcn deps + scripts
├── tsconfig.json                     # strict; path aliases @/src/*
├── jest.config.ts                    # ts-jest, node env for src/, jsdom optional (skip UI tests)
├── next.config.ts
├── components.json                   # shadcn config
├── tailwind + postcss config
└── src/
    ├── shared/                       # the mini kernel (mirrors @wildmetrics/shared)
    │   ├── core/
    │   │   ├── Result.ts
    │   │   ├── Either.ts             # Either, left, right
    │   │   ├── UseCase.ts
    │   │   ├── AppError.ts
    │   │   ├── UseCaseError.ts
    │   │   └── Guard.ts
    │   └── domain/
    │       ├── Entity.ts
    │       ├── AggregateRoot.ts
    │       ├── ValueObject.ts
    │       └── UniqueEntityID.ts
    ├── contexts/
    │   └── polls/                    # the one bounded context
    │       ├── domain/
    │       │   ├── Poll.ts           # AggregateRoot: question + options + total votes
    │       │   ├── PollOption.ts     # entity/VO: label + voteCount, castVote()
    │       │   ├── PollQuestion.ts   # ValueObject (non-empty, max length)
    │       │   └── IPollRepo.ts      # port: save / getById / getAll
    │       ├── application/
    │       │   ├── createPoll/
    │       │   │   ├── CreatePollUseCase.ts
    │       │   │   ├── CreatePollUseCase.test.ts
    │       │   │   ├── CreatePollErrors.ts
    │       │   │   └── CreatePollControllerFactory.ts
    │       │   ├── castVote/
    │       │   │   ├── CastVoteUseCase.ts
    │       │   │   ├── CastVoteUseCase.test.ts
    │       │   │   ├── CastVoteErrors.ts
    │       │   │   └── CastVoteControllerFactory.ts
    │       │   └── getPoll/
    │       │       ├── GetPollUseCase.ts
    │       │       ├── GetPollUseCase.test.ts
    │       │       └── GetPollControllerFactory.ts
    │       ├── infra/
    │       │   ├── repos/
    │       │   │   ├── InMemoryPollRepo.ts        # module-singleton store (prod impl)
    │       │   │   └── InMemoryPollRepo.test.ts
    │       │   └── mappers/PollMapper.ts          # domain <-> DTO
    │       └── tests/
    │           ├── PollMother.ts                  # Object Mother builder
    │           └── (spies reuse InMemoryPollRepo)
    └── app/                           # Next.js App Router (thin adapters only)
        ├── layout.tsx, globals.css
        ├── page.tsx                   # list polls + "create poll" form
        ├── polls/[id]/page.tsx        # vote + live results
        ├── components/                # shadcn-based: PollCard, CreatePollForm, ResultsBar
        └── api/polls/route.ts         # POST create, GET list  → calls *Factory.create().execute()
            api/polls/[id]/route.ts    # GET one
            api/polls/[id]/vote/route.ts # POST vote
```

The **singleton store** lives in `InMemoryPollRepo.ts` as a module-level `Map` so all serverless
invocations in a warm instance share it. Route handlers call the factory, which injects the repo
into the use case — the API layer owns wiring, domain/application stay pure.

## Implementation Plan (TDD order)

1. **Scaffold** — `create-next-app` (TS, App Router, Tailwind, ESLint) into the workspace root
   using **yarn** as the package manager (yarn used for all install/scripts; commit `yarn.lock`,
   no `package-lock.json`); add Jest + ts-jest (`jest.config.ts`, `test`/`test:coverage`/
   `typecheck`/`lint` scripts); `.gitignore`; init Shadcn (`components.json`) + add `button`,
   `card`, `input`, `label`, `progress`/custom bar. Verify `yarn test` and `yarn build` run green.
2. **Shared kernel** — port minimal `Result`, `Either`, `UseCase`, `Entity`, `AggregateRoot`,
   `ValueObject`, `UniqueEntityID`, `Guard`, `AppError`, `UseCaseError` from the reference
   conventions (trimmed). Small unit test for `Result`/`Either` happy+fail path.
3. **Domain (test-first)** — `PollQuestion` VO (validation), `PollOption`, `Poll` aggregate with
   `Poll.create()` factory + `castVote(optionId)` behavior + invariants (≥2 options, unknown option
   fails). Write entity tests first.
4. **Repo port + in-memory impl** — `IPollRepo` in domain; `InMemoryPollRepo` in infra with its
   own test; `PollMother` builder.
5. **UseCases (test-first)** — `CreatePollUseCase`, `CastVoteUseCase`, `GetPollUseCase`, each with
   `*Errors.ts`, injected `IPollRepo` (constructor DI), `Either<Errors, Result<DTO>>` return, and a
   co-located test using `InMemoryPollRepo` + `PollMother`, asserting via `isRight()`/`getValue()`.
   `*ControllerFactory.create()` wires the singleton repo into the use case.
6. **API routes** — thin App Router handlers: parse/guard input → `Factory.create().execute()` →
   map `Either` to HTTP (`left`→400/404/500 with message, `right`→200/201 with DTO).
7. **UI** — Shadcn components: home lists polls + create form; poll page casts vote + shows
   `ResultsBar` percentages. Client fetches the API routes. Keep UI logic minimal (no UI unit tests
   in the time box — noted as a cut).
8. **CI** — `.github/workflows/ci.yml` on `push` + `pull_request`: `yarn install --frozen-lockfile`
   → `yarn typecheck` → `yarn lint` → `yarn test` → `yarn build` (with yarn cache). Vercel deploy handled by
   Vercel's native Git integration (user connects after first merge) — noted in README, no secrets
   committed.
9. **README** — what's included, what's deliberately left out (real DB, auth, one-vote-per-user
   enforcement, UI tests, poll editing/closing), technical decisions (clean arch, DI, TDD, in-memory
   trade-off), how AI was used, run/test instructions.

## Files to Create (representative — pattern repeats)

- Kernel: `src/shared/core/{Result,Either,UseCase,AppError,UseCaseError,Guard}.ts`,
  `src/shared/domain/{Entity,AggregateRoot,ValueObject,UniqueEntityID}.ts`
- Domain: `src/contexts/polls/domain/{Poll,PollOption,PollQuestion,IPollRepo}.ts`
- Per use case (×3): `<Verb>UseCase.ts`, `<Verb>UseCase.test.ts`, `<Verb>Errors.ts`,
  `<Verb>ControllerFactory.ts`
- Infra: `src/contexts/polls/infra/repos/InMemoryPollRepo.ts` (+test),
  `src/contexts/polls/infra/mappers/PollMapper.ts`
- Tests support: `src/contexts/polls/tests/PollMother.ts`
- App: `src/app/{page,layout}.tsx`, `src/app/polls/[id]/page.tsx`, `src/app/api/polls/**/route.ts`,
  `src/app/components/*`
- Root config: `package.json`, `tsconfig.json`, `jest.config.ts`, `.gitignore`,
  `.github/workflows/ci.yml`, `README.md`, `components.json`

## Explicitly OUT of scope (deliberate cuts, noted in README)

- Real/durable database (in-memory only; resets on cold-start) — swappable behind `IPollRepo`.
- Auth / user accounts; robust "one vote per user" (maybe a soft cookie/localStorage guard, noted).
- Poll editing, closing, deleting, expiry.
- Domain events / event bus (kernel supports it; not wired for this scope).
- UI component/e2e tests (Jest covers domain + application + infra only).
- Rate limiting, i18n, accessibility audit, analytics.

## Verification

- `yarn test` — all domain, application, infra unit tests green (this is the core proof).
- `yarn typecheck` and `yarn lint` — clean.
- `yarn build` — Next production build succeeds.
- `yarn dev` — manually: create a poll → open it → vote → results bar updates and percentages
  sum to 100%; refresh keeps data within the warm process.
- Push branch → open PR → confirm GitHub Actions CI runs and passes on the PR.
```
```
