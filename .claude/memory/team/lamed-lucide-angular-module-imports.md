---
name: lucide-angular ModuleWithProviders ban in standalone imports
description: LucideAngularModule.pick(...) returns ModuleWithProviders and is FORBIDDEN in standalone component `imports` — must use bare LucideAngularModule instead
type: project
---

In `frontend/src/app/**` standalone components, do NOT write `imports: [..., LucideAngularModule.pick({ X, Y })]`. `pick()` returns `ModuleWithProviders<LucideAngularModule>`, triggering NG2012 + TS2322 at build time and breaking `build-and-deploy` CI.

**Why:** Caused a 2026-06-21 production build failure on `team-modal.component.ts:18` ("Component imports contains a ModuleWithProviders value"). The fix landed in the same commit and the convention used in `sobre.ts:36` (`imports: [CommonModule, LucideAngularModule]`) is the established project pattern.

**How to apply:** When wiring icons in any new standalone component, import the full `LucideAngularModule` and let tree-shaking handle it. Never reach for `.pick()` — even though the API exists. If you see `.pick({...})` in a PR, flag it pre-merge.
