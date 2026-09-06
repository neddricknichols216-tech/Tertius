# Tertius — Stage One

**Your digital ministry scribe.**

This is the first runnable scaffold for the Tertius Sermon Builder MVP.

## What works now

- Branded Tertius dashboard
- New Sermon workflow
- Sermon title / primary passage / series / date / audience / raw notes
- Local Master Sermon generation for UX testing
- Browser-local sermon persistence
- Interactive outline workspace
- Editable big idea and desired response
- Editable/reorderable sermon movements
- Movement locking
- Must Say / Normal / Optional priorities
- Stubbed Scripture Suite, Weekly Devotional, and YouTube Suite panels

## Why generation is mocked in this first drop

The goal of this build is to prove the product workflow before adding paid APIs. The `buildMockMasterSermon()` function is deliberately isolated so it can be replaced by a server-side AI action without rewriting the UI.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Environment variables reserved for the next build

Copy `.env.example` to `.env.local` and add credentials when we connect services:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6-terra
```

## Stage One architecture

```text
Pastor notes
   ↓
Master Sermon
   ├── Outline editor
   ├── Scripture Suite
   ├── Weekly Devotional
   └── YouTube Suite
```

The Master Sermon is the source of truth. Downstream generators should never independently reinterpret the pastor's raw notes.

## Next implementation steps

1. Add Supabase Auth and Postgres persistence.
2. Add ministry + theology profiles.
3. Replace mock generation with a server-side structured-output AI endpoint.
4. Add Scripture verification/data provider.
5. Build the Scripture Suite UI.
6. Generate devotional + YouTube assets from the approved Master Sermon.
7. Add version history.

## Product principle

Tertius should assist the preacher, not silently become the preacher. Original notes are preserved, pastor edits remain authoritative, and locked sections should never be regenerated without an explicit action.
