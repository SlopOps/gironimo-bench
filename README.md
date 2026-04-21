# Gironimo Bench

Benchmarking LLMs on **real-world software development workflows** — see how AI performs at building complete systems from a single specification prompt.

Part of the SlopOps YouTube series, Gironimo Bench evaluates modern language models on a **full engineering workflow**:

**specification → architecture → implementation → human review**

All runs follow the same methodology and are **curated and verified by hand** for consistent, trustworthy scoring.

---

## 🎯 What Is This?

The Gironimo Bench tests how well LLMs can turn a **long, detailed prompt** into a working engineering result.

This is not multiple-choice reasoning or toy coding tasks. The benchmark evaluates whether a model can produce a **realistic, maintainable codebase** with:

* coherent system architecture  
* functional source code  
* automated or manual tests  
* realistic engineering structure  
* production-oriented design decisions  

Each run answers questions such as:

* Can the model correctly interpret a specification?  
* Can it design a coherent architecture?  
* Can it generate maintainable code?  
* Can it follow a structured development workflow?  
* Does it demonstrate engineering judgment beyond instruction-following?

> **One-Shot Attempts:** Each model gets a few retries to succeed. Fewer retries = higher score.

---

## 📏 Benchmark Philosophy

Most LLM benchmarks measure:

* reasoning questions  
* short code snippets  
* academic tasks  

Gironimo Bench evaluates something different:

**Can a model implement a real engineering system from a specification prompt?**

Pipeline for every run:

1. Specification (long, detailed prompt)  
2. Architecture interpretation  
3. Implementation (code generation)  
4. Human review and scoring  

This mirrors how professional engineering teams build software, while giving models a **fair chance with retries**.

### What We Actually Test

Gironimo Bench evaluates **end-to-end engineering capability in real-world chat interfaces**:

| Layer | What We Test |
|-------|--------------|
| **Model Capability** | Can it understand complex requirements and generate working code? |
| **Output Handling** | Can it produce complete, multi-file implementations within output limits? |
| **Continuation Support** | Does it work with our 3-continuation policy to overcome truncation? |
| **Asset Management** | Can it provide self-contained, deployable assets (not just file references)? |
| **Deployment Awareness** | Does it produce code that actually works on GitHub Pages? |

A model's score reflects not just code quality, but its ability to deliver a complete, working system within the constraints of chat-based interaction.

### Creative Freedom Over Rigid Compliance

The v1 specification defines **what** to build, not **how**. Models have creative freedom to:

- Choose visual style and implementation approach
- Design interactive elements with personality
- Organize content meaningfully
- Make thoughtful engineering trade-offs

**Boring but correct implementations score lower.** The benchmark rewards creativity, cohesion, and engineering judgment—not just instruction-following.

---

## 🧪 How the Specification Tests Real Engineering

The v1 specification is intentionally designed to evaluate **attention to detail, interpretation, and judgment**. It contains subtle signals that separate careful readers from skimmers:

| Technique | Example in Spec | What It Tests |
|-----------|-----------------|---------------|
| **Contradiction** | "Not a cartoon" but "still friendly and approachable" | Balance, nuance, avoiding extremes |
| **Hidden Requirement** | "The giraffe should not be the only animated element" | Attention to detail, thorough reading |
| **Misleading Example** | Grouping by category shown but "not required" | Independent thinking, avoiding mimicry |
| **Underspecified Intent** | "Purposeful, not decorative" animation | Interpretation, documentation of choices |
| **Negative Constraints** | "External image files are not acceptable" | Following prohibitions, constraint awareness |
| **Red Herring** | Favicon mentioned as optional | Prioritization, avoiding distractions |
| **Output Structure** | First response must include file list + HTML | Communication discipline, planning |

These are not "trick questions." They mirror real engineering: specifications have nuance, trade-offs, and unstated expectations. The best engineers read carefully, interpret thoughtfully, and document their reasoning.

---

## 📊 Benchmark Difficulty

Gironimo Bench is designed to be **genuinely challenging** — not a toy problem or a simple UI exercise. It tests whether an LLM can build a **real, integrated system** under the same constraints a human engineer would face.

### Why This Is Hard

| Challenge | What It Requires |
|-----------|------------------|
| **Five integrated features** | No feature can work in isolation. All must share state and react to each other. |
| **Single source of truth** | Models must design a centralized state architecture. Violations cause visible desync bugs. |
| **Derived state discipline** | Computed values cannot be stored. Weak models cache results, causing stale UI. |
| **Atomic updates** | Multiple state changes in one tick must batch to a single render. Failure = flicker. |
| **Real CSV data** | Runtime fetch, parsing, error handling. No hardcoding allowed. |
| **Cross-feature integration** | Philosophy selection affects leaderboard, workflow, and mascot. All must stay in sync. |
| **GitHub Pages deployment** | Must work in a real static hosting environment. No server-side tricks. |

### Common Failure Modes (What "Hard" Looks Like)

| Failure | Visual Symptom | Root Cause |
|---------|---------------|------------|
| **State Desync** | Giraffe jumps between positions randomly; leaderboard and philosophy selections don't match | No single source of truth; multiple state stores |
| **Flicker** | UI flashes during rapid clicks or state changes | Non-atomic updates; intermediate states rendered |
| **CSV Crash** | Leaderboard blank or site errors on load | No error handling for fetch failures; hardcoded data |
| **Philosophy Drift** | Selected philosophy highlights wrong models or inconsistent behavior | Derived state stored instead of recomputed |
| **Notification Chaos** | Toasts appear multiple times or on wrong actions | Feature-to-feature direct communication bypassing state |
| **Giraffe Glitch** | Mascot reacts to wrong elements or doesn't react at all | Direct DOM querying instead of store-driven behavior |

### What Separates Strong Models from Weak Ones

| Model Tier | Typical Outcome | What Viewers Will See |
|------------|-----------------|----------------------|
| **Quantized/Small** | Deploys with visible bugs | State desync, giraffe glitches, flicker, CSV fails |
| **Mid-Tier** | Mostly correct with minor issues | Occasional flicker, highlight race conditions, notification lag |
| **Strong** | Clean, integrated, polished | Smooth updates, correct integration, edge case handling |
| **SOTA** | Exceptional, with delightful extras | Perfect state management, thoughtful UX, surprising elegance |

### Why This Matters

Most LLM benchmarks test:
- Multiple choice reasoning
- Short code snippets
- Isolated function completion

Gironimo Bench tests something different:

**Can a model build a complete, integrated system from a specification?**

This is the difference between:
- Writing a function → **engineering a system**
- Following instructions → **making architectural judgments**
- Producing code that "looks right" → **code that actually works when deployed**

The difficulty is intentional. It creates **real separation** between models and produces **watchable content** — from entertaining failures to impressive showcases.

---

## 📦 Benchmark Versions

| Version | Description |
| ------- | ----------- |
| **v1** | Build a complete, deployable Gironimo brand website with five integrated features. Creative freedom emphasized. GitHub Pages deployment required. Self-contained assets required. |

[View the v1 specification →](/spec/v1.md)

Future versions may introduce new challenges or scoring refinements.

---

## 📊 Current Leaderboard

| Model | Score | One-Shot Attempts (fewer = better) | Date | Live Demo |
| ----- | ----- | --------------------------------- | ---- | --------- |
| *Coming soon* | – | – | – | – |

> Scores are **curated by hand**, not automated. Leaderboard updates after each SlopOps video.  
> Full leaderboard and detailed breakdowns is available at: [https://gironimo.ai](https://gironimo.ai)

---

## 🧠 Scoring Rubric — 10 Categories, Total 100 Points

Each category is scored **0–10 points**, and the **total adds to 100 points**. This keeps the leaderboard simple and easy to understand.

| Category | Description | Max Points |
| -------- | ----------- | ---------- |
| **Speed** | How fast does the model run and iterate? | 10 |
| **One-Shot Attempts** | How many retries were needed to succeed (fewer = higher) | 10 |
| **Design** | Beauty, creativity, personality, cohesion | 10 |
| **Architecture** | Engineering decisions, maintainability, system design | 10 |
| **Code Quality** | Readability, comments, modularity, error handling | 10 |
| **Feature Complete** | Implements all requested features with integrity | 10 |
| **Performance** | Lighthouse performance metrics | 10 |
| **Accessibility** | Lighthouse accessibility metrics | 10 |
| **Best Practices & Security** | Lighthouse: best practices, secure coding, maintainability | 10 |
| **Value** | What is the price to quality ratio | 10 |

> **Overall Gironimo Score** = sum of all 10 categories → **maximum 100 points**.  
> Visual leaderboard is designed for easy comparison, perfect for **Doug DeMuro-style scoring** in videos.

---

## 🔁 Retry Policy & Scoring Clarification

### Evaluation Phases

Each model run is evaluated in two phases:

---

### **Phase 1 — Benchmark Attempts (Scored)**

Models are given a limited number of attempts (typically **3–4**) to produce a working, deployable result.

* **Attempt 1:** True one-shot (no feedback)
* **Attempts 2–N:** Minimal feedback only

**Allowed feedback:**

* “Build failed”
* “Site does not deploy”
* “Feature X is not functioning”
* “Missing asset: [file] not provided”

**Not allowed:**

* Code suggestions or fixes
* Debugging guidance
* Architectural recommendations
* Line-level issue identification

These attempts determine the **One-Shot Attempts score** and represent the model’s **true benchmark performance**.

---

### **Phase 2 — Completion Mode (Unscored)**

If the model fails to deploy within the attempt limit:

* Additional iterations are allowed to reach a working result
* More detailed feedback or intervention may be used if necessary
* Manual fixes may be applied (must be documented)

**Important:**
This phase exists to produce a working result for evaluation and demonstration (e.g., videos), but does **not** affect the One-Shot Attempts score. Phase 2 results are used for demonstration in videos, but Phase 1 scores are what appear on the leaderboard.

---

### Continuation Policy (v1 Specific)

The v1 specification requires multiple files. To account for output limits, each model receives **up to 3 continuation prompts** to complete their implementation:

1. **Initial response:** Model outputs implementation
2. **Continuation 1:** If incomplete, evaluator prompts "Continue. Provide remaining files."
3. **Continuation 2:** Same
4. **Continuation 3:** Same

**If the implementation is complete and deploys within 3 continuations:**
- Counts as **1 attempt** in Phase 1
- Continuation scaffolding does not count against attempts

**If still incomplete after 3 continuations:**
- Moves to Phase 2 (completion mode)

---

### Asset Completeness (v1 Specific)

The v1 specification requires **self-contained assets**. Submissions that reference external files without providing their contents are considered incomplete.

**Acceptable:**
- Inline SVG in HTML
- SVG provided as a separate file with full markup
- Canvas with drawing code included
- CSS-based illustrations
- External images from free, public CDNs with attribution in README

**Not acceptable:**
- References to image files (`giraffe.svg`) without providing the file contents
- Placeholder comments like `<!-- add giraffe image here -->`
- External images without attribution or from restricted sources

Missing assets count as a failed attempt in Phase 1 and may be resolved in Phase 2.

---

## 📊 How Scoring Works


### **Speed (10 pts)**

| Amount of time to finish result | Score |
| --------------------------------- | ----- |
| <5s | 10 |
| 5s-10s | 9 |
| 10s-30s | 8 |
| 30s-1m | 7 |
| 1m-2m | 6 |
| 2m-4m | 5 |
| 4m-7m | 4 |
| 7m-10m | 3 |
| 10m-20m | 2 |
| 20m+ | 1 |

### **One-Shot Attempts (10 pts)**

| Amount of time to finish result | Score |
| --------------------------------- | ----- |
| 1 | 10 |
| 2 | 8 |
| 3 | 6 |
| 4 | 4 |
| 5 | 2 |
| 6+ | 1 |

---

### **Design (10 pts)**

Desktop and Mobile
* **9–10:** Exceptional polish, cohesive, memorable, surprising
* **7–8:** Clean, consistent, professional
* **4–6:** Functional but basic, minimal polish
* **1–3:** Broken, unusable, or visually chaotic

---

### **Architecture (10 pts)**

* **9–10:** Thoughtful design, scalable, strong engineering decisions
* **7–8:** Well-structured, maintainable, clear separation of concerns
* **4–6:** Basic structure, some organization, limited maintainability
* **1–3:** Disorganized, unclear structure, poor separation of concerns

---

### **Code Quality (10 pts)**

* **9–10:** Highly readable, robust, and well-organized
* **7–8:** Clean, readable, reasonably well-structured
* **4–6:** Functional but inconsistent or minimally documented
* **1–3:** Hard to read, fragile, or error-prone

---

### **Feature Completeness (10 pts)**

* **9–10:** All features work as required
* **7–8:** 4/5 features exist with minor errors
* **4–6:** 3/5 fratures exist with some buggs
* **1–3:** 2 or less features exist

---

### **Performance (10 pts)**

| Lighthouse Score | Score |
| --------------------------------- | ----- |
| 100 | 10 |
| 90-100 | 9 |
| 80-90 | 8 |
| 70-80 | 7 |
| 60-70 | 6 |
| 50-60 | 5 |
| 40-50 | 4 |
| 30-40 | 3 |
| 20-30 | 2 |
| <20 | 1 |

---

### **Accessibility (10 pts)**

| Lighthouse Score | Score |
| --------------------------------- | ----- |
| 100 | 10 |
| 90-100 | 9 |
| 80-90 | 8 |
| 70-80 | 7 |
| 60-70 | 6 |
| 50-60 | 5 |
| 40-50 | 4 |
| 30-40 | 3 |
| 20-30 | 2 |
| <20 | 1 |

---

### **Best Practices (10 pts)**

| Lighthouse Score | Score |
| --------------------------------- | ----- |
| 100 | 10 |
| 90-100 | 9 |
| 80-90 | 8 |
| 70-80 | 7 |
| 60-70 | 6 |
| 50-60 | 5 |
| 40-50 | 4 |
| 30-40 | 3 |
| 20-30 | 2 |
| <20 | 1 |

---

### **Value (10 pts)**

Cloud Models:
* **9–10:** Free and unlimited
* **7–8:** Free with limits
* **4–6:** Cost $ but unlimited
* **1–3:** Cost $$ and limited

Local Models: (model size + kv cache) - most instances 5-10GB kvcache
* **10:** <10GB VRAM
* **8-9:** 10GB - 24GB VRAM
* **6-7:** 24GB - 32GB VRAM
* **4-5:** 32GB - 64GB VRAM
* **2-3:** 64GB - 96GB VRAM
* **1:** 96+GB VRAM


---

### **Overall (100 pts)**
- Sum of all 10 categories. Max 100

---



## 🧠 Scoring Philosophy

Gironimo Bench evaluates two distinct dimensions:

* **Efficiency:** How quickly a model reaches a working result
* **Capability:** The quality of the final system it produces

A model that succeeds immediately but produces a basic result will score differently than one that requires multiple attempts but delivers a stronger system.

**For v1 specifically:** This benchmark rewards **engineering judgment**, not just instruction-following. Creative, cohesive, surprising implementations that meet all requirements will score higher than rigid, uninspired but correct implementations.

---

## 📌 Transparency

Each run includes:

* Number of attempts used in Phase 1
* Whether Phase 2 was required
* Any manual intervention performed
* For v1: whether continuation prompts were used
* For v1: any missing assets that required Phase 2 resolution
* For v1: notes on how the model handled subtle specification signals (contradictions, hidden requirements, etc.)

This ensures results are **interpretable, reproducible, and fair**.

---

## 🗂 Repository Structure

```
gironimo-bench/
│
├── docs/                         # GitHub Pages source (website)
│   ├── index.html                # Landing page with leaderboard and live demo links
│   ├── .nojekyll                 # Disables Jekyll processing
│   │
│   └── results/                  # Live demo sites
│       ├── claude-3.5-sonnet/    # Live demo at index.html
│       │   ├── index.html        # The model's deployed site
│       │   ├── prompt.md         # Full spec used
│       │   ├── architecture.md   # Model's architecture response
│       │   ├── metrics.json      # Score breakdown
│       │   └── notes.md          # Human evaluation notes
│       ├── gpt-4o/
│       ├── qwen-2.5-72b/
│       └── deepseek-v3/
│
├── spec/                         # Benchmark specifications (not deployed)
│   └── v1.md
│
├── evaluations/                  # Scoring methodology (not deployed)
│   ├── rubric.md
│   └── scoring-notes/
│
├── scripts/                      # Automation (not deployed)
│   └── generate-leaderboard.py
│
└── README.md                     # This file
```

**Live Demos:** Each model's site is deployed and accessible at `/results/{model-id}/`. Browse, inspect source, judge for yourself.

**GitHub Pages Setup:** This repository is configured to publish from the `/docs` folder. A `.nojekyll` file disables Jekyll processing, ensuring all files are served as-is.

Typical run structure:

```
docs/results/claude-3.5-sonnet/
│
├── index.html            # Live demo site
├── prompt.md             # Full spec used
├── architecture.md       # Generated architecture
├── metrics.json          # Score breakdown
└── notes.md              # Human evaluation notes (continuation, asset history, spec interpretation)
```

---

## 🎥 In the Videos

Every SlopOps episode evaluates a single model on the Gironimo Bench.

Episodes include:

* **Live model runs on the v1 spec prompt**  
* **Architecture and code review**  
* **Score breakdowns per category**  
* **Creativity and judgment assessment**  
* **Analysis of how the model handled subtle specification signals**  
* **Live demo walkthrough** of the model's deployed site  
* **Lessons learned and leaderboard update**  

📺 [Watch on YouTube](https://youtube.com/@SlopOps)

---

## 🌐 Website

Benchmark results and leaderboard:

👉 [https://gironimo.ai](https://gironimo.ai)

Website is generated from this repository via GitHub Pages and updated after each video.

---

## 🔬 Why Curated?

Each run:

* Follows the same evaluation methodology  
* Is scored against the same rubric  
* Reviewed by a human engineer  
* Includes documented reasoning  
* Evaluates creativity and judgment, not just feature count  
* Tracks continuation usage and asset completeness  
* Notes how the model interpreted subtle specification signals

This ensures results are **consistent, comparable, and trustworthy**.

---

## 🔎 Reproducibility

All runs include:

* Original specification prompt (v1)  
* Generated architecture  
* Produced code  
* Human evaluation notes  
* Deployment outcome and continuation history  
* Asset completeness documentation  
* Notes on specification interpretation (how the model handled contradictions, hidden requirements, etc.)

Allows **independent inspection and verification**.

---

## 📄 License

**Benchmark specification and methodology:** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)  
**Code (scripts, website):** [Apache 2.0](LICENSE)

Individual model outputs remain the property of their respective providers.

---

## 🏗 Built By

**SlopOps** — open-source tools and educational content for engineers building production systems with LLMs.

GitHub: [https://github.com/SlopOps](https://github.com/SlopOps)  
YouTube: [https://youtube.com/@SlopOps](https://youtube.com/@SlopOps)
