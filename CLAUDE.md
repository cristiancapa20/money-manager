# CLAUDE.md

## Response rules

- Respond in Spanish
- No sycophancy, no preamble, no closing fluff
- Concise output. No restating the question
- ASCII only in code: no em dashes, smart quotes, or Unicode symbols
- User instructions override everything in this file

## Workflow

- Read relevant files before writing code
- Read each file once unless it changed
- Prefer targeted edits over full file rewrites
- No over-engineering: favor the simplest solution that works
- Run `npx expo lint` before declaring done

## Stack

- Expo SDK 54 + React Native 0.81 + TypeScript
- Expo Router (file-based routing in `app/`)
- Turso/LibSQL via `@libsql/client`
- react-native-gifted-charts for charts
- react-native-reanimated for animations
- No test suite exists — do not create test files unless asked

## Project structure

- `app/` — screens and routing (tabs, auth, profile)
- `components/` — reusable UI components
- `contexts/` — global state (auth, theme, data)
- `database/` — Turso connection, queries, finance API
- `types/`, `constants/`, `utils/` — shared code
- `scripts/` — dev utilities (seeding, etc.)

## Constraints

- DB schema is managed by Prisma in the web app (FinlyCR). This app only reads/writes data — never generate migrations here
- Environment vars use `EXPO_PUBLIC_` prefix
- Never commit `.env*` files
