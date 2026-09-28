# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People of any age (children under 13, teenagers, adults) who find it hard to speak up: in class, with friends, or in front of a group. Many have speaking anxiety, panic, sweating or blushing, ADHD, shyness, a stutter, or trouble forming longer sentences, and most fear being judged. They practise alone and privately, on a phone or a laptop (equal priority; school Chromebooks count), often just before the moment they dread. One person, one device; no teacher or parent mode in v1.

## Product Purpose

A free, private practice space that helps people take small, brave speaking steps and see themselves getting braver. Success is a real-life moment: answering in class, joining a chat, giving a short talk. Practice, not therapy; it never claims to treat any condition.

## Positioning

Rewards courage, not performance. It never scores fluency, fillers, pauses or stutters, never punishes (no broken streaks, no losing, no leaderboards), costs nothing, needs no account, and keeps everything on the device. It combines speaking practice, calm-down tools, stuttering-friendly design and ADHD-friendly pacing in one place, where people otherwise need several paid apps.

## Operating Context

- Courage ladder per situation: think it, type or whisper it, say it alone, say it to the coach, a little pressure (optional), try it for real.
- Rooms in v1: Class, Friends, Presenting. Tools reachable from every screen: Need a pause, body kit, rescue phrases, sentence builder.
- Game layer: courage map, a companion creature the user picks (firefly, hedgehog, paper fox) that grows braver, courage points, weekly brave days, badges, daily quests, mini-games.
- Sessions are short (about 60 seconds is enough). Voice on device (Kokoro); "Type instead" everywhere.

## Capabilities and Constraints

- Next.js 16, Tailwind v4, Cloudflare Workers free plan. Core logic exists in `src/lib/` (ladder, points, badges, quests, companion, crisis check, on-device state).
- Age band on first visit; skipped means under 13. Under 13 gets no generative AI and no server speech to text.
- Free forever: no paid services, analytics, trackers or ads. No accounts.
- Crisis check runs on the device; a calm support screen with regional helplines replaces AI when triggered.
- Undecided: final companion artwork, extra voices, mini-game details.

## Brand Commitments

- Name: Rehearse Courage. Line under the logo: "a Rehearse project, by Sayam Ajmal".
- A sister project to Rehearse (https://rehearse.sayamdev.workers.dev): related in feel but visibly different. Binding visual constraints from the maker: keep Atkinson Hyperlegible Next for body text, Bricolage Grotesque for display, and die-cut sticker style for badges; the world is "Paper Lantern Map" (papercraft map at dusk moving towards dawn, one warm lantern-amber accent). Cobi, the Rehearse coach, may cameo as the tips coach.
- Maker's mark: "Sayam Ajmal" signature on footer and About; small "S" charm on each companion. Footer "© 2026 Sayam Ajmal. All rights reserved."
- Voice: plain, kind, short. No em or en dashes, no "Oops", no exclamation marks in success messages, never "calm down", never shaming.

## Evidence on Hand

Pre-written situations, rescue phrases, sentence frames, badges and quests in `src/lib/content/`, `src/lib/achievements.ts`, `src/lib/quests.ts`. No testimonials, user numbers, clinical claims or press exist; never fabricate them.

## Product Principles

1. Courage, not performance.
2. Never punish; always welcome back.
3. One small step at a time; one thing on screen.
4. Private by default; nothing leaves the device unless needed and allowed.
5. Point back to real life; the biggest wins happen outside the app.

## Accessibility & Inclusion

WCAG 2.2 AA in both themes. Readable for children and dyslexic readers (Atkinson Hyperlegible, text-size setting). Reduce-motion setting that turns all motion into still frames; sounds optional; no timers by default. Keyboard and screen reader complete; captions on spoken lines; touch targets at least 44px; works offline and on low-end phones. Stuttering-friendly: no fluency judgement anywhere.
