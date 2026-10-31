# Conference Notes — Power Planner Discussion

Date: 2026-10-31 · Context: notes taken at a conference, to be discussed with Power Planner.

---

## 1. Signals & Guides (give it the research first)

- Signals and guides **for agents**.
- Especially consider **backpressure** and guides such as **validation scripts and arch tests**.
- Keeper will provide **curated links** to research/opinions to seed the conversation.
- Open question: how different agent tasks (**backend vs frontend vs planning**, etc.) need different guides and signals.

## 2. Deterministic Code vs Inference Skills

- Put pressure on BeeHarness to prefer **deterministic** tools — scripts, tests, linters — wherever possible.
- Rely on **inference only where nondeterministic judgment is genuinely needed** (e.g. "is this code clear and concise").

## 3. Architecture Tests

- Consider adding arch tests to our projects: **Roslyn analyzers for C#**; still need to find an option for our **TypeScript** projects.
- Discuss with Power Planner: right for **all projects, some, or none**?
- Consider pros/cons of making arch tests a **preferred default in the harness**.

## 4. API Contract Tests

- Mostly a reminder: we want **OpenAPI spec-first** for backend and API development tasks → adding contract tests follows naturally.
- Ensure backends **offer what their contract says** (or fix the contract if *it* has drifted from plans).
- Ensure **frontends use contracts correctly**.

## 5. StackQL

*(original note "stack all" was a typo)*

- Do some personal research first.
- Investigate whether StackQL has utility for **signals and guides in BeeHarness**.

## 6. AXI Principles — AI-Ready CLI

*(original note "toon and aix top ten" — "aix" = AXI: Agent eXperience Interface, https://axi.md/)*

- Ensure BeeHarness follows the **10 AXI Principles**: https://axi.md/
- Get Power Planner to consider them.
- Possibly **incorporate them into BeeHarness's SOUL**.
- TOON (token-oriented notation for LLM context) from the original note retained here.

## 7. Arazzo — API Business-Logic Specs

- Write **OpenAPI / API-contract-first development rules and tools** into BeeHarness.
- Consider adding use of **Arazzo specs** to our guidance.
- Evaluate whether Arazzo specs make sense in **BeeHarness's own development** too.

## 8. Auto PR, Human Audit Before Deploying

- Possible **"preferred flow"** for BeeHarness's automated workflow.
- Bees do their work and **merge PRs** automatically.
- We produce a **report of what changed between prod deployments**.
- A **human reviews that change log** / stands in the gate between real deployments.
