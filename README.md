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

---

## 📦 Benchmark Versions

| Version | Description                                              |
| ------- | -------------------------------------------------------- |
| v1      | Standardized specification prompt for testing all models |

Future versions may introduce new challenges or scoring refinements.

---

## 📊 Current Leaderboard

| Model         | Score | One-Shot Attempts (fewer = better) | Date |
| ------------- | ----- | --------------------------------- | ---- |
| *Coming soon* | –     | –                                 | –    |

> Scores are **curated by hand**, not automated. Leaderboard updates after each SlopOps video.  
> Full leaderboard and detailed breakdowns will be available at: [https://gironimo.ai/bench](https://gironimo.ai/bench) (coming soon)

---

## 🧠 Scoring Rubric — 10 Categories, Total 100 Points

Each category is scored **0–10 points**, and the **total adds to 100 points**. This keeps the leaderboard simple and easy to understand.

| Category                      | Description                                                | Max Points |
| ----------------------------- | ---------------------------------------------------------- | ---------- |
| **Gironimo Bench Completion** | Did the model run through the full evaluation?             | 10         |
| **One-Shot Attempts**         | How many retries were needed to succeed (fewer = higher)   | 10         |
| **Design**                    | Beauty, creativity, and structure of the solution          | 10         |
| **Architecture**              | Engineering decisions, maintainability, system design      | 10         |
| **Code Quality**              | Readability, comments, modularity, error handling          | 10         |
| **Feature Complete**          | Implements all requested features correctly                | 10         |
| **Performance**               | Lighthouse performance metrics                             | 10         |
| **Accessibility**             | Lighthouse accessibility metrics                           | 10         |
| **Best Practices & Security** | Lighthouse: best practices, secure coding, maintainability | 10         |
| **Tech Value & Trade-offs**   | Appropriate technology choices, cost/value balance         | 10         |

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

## 📊 How Scoring Works

### **One-Shot Attempts (10 pts)**

| Attempts to Deploy (Phase 1 only) | Score |
| --------------------------------- | ----- |
| 1                                 | 10    |
| 2                                 | 8     |
| 3                                 | 6     |
| 4                                 | 4     |
| Failed within limit               | 0     |

---

### **Gironimo Bench Completion (10 pts)**

| Outcome                      | Score |
| ---------------------------- | ----- |
| Fully deploys within Phase 1 | 10    |
| Deploys only after Phase 2   | 6     |
| Never deploys                | 0     |

---

### **Quality-Based Categories**

All remaining categories (Design, Architecture, Code Quality, etc.) are evaluated based on the **final working version**, even if achieved during Phase 2.

This separates:

* **Efficiency** (how quickly the model succeeds)
* **Capability** (how good the final result is)

---

## ⚖️ Subjective Scoring Guidelines

Some categories involve human judgment. To ensure consistency, the following scoring anchors are used:

### **Design (0–10)**

* **0–3:** Broken, unusable, or visually chaotic
* **4–6:** Functional but basic, minimal polish
* **7–8:** Clean, consistent, professional
* **9–10:** Exceptional polish, cohesive, memorable

---

### **Architecture (0–10)**

* **0–3:** Disorganized, unclear structure, poor separation of concerns
* **4–6:** Basic structure, some organization, limited maintainability
* **7–8:** Well-structured, maintainable, clear separation of concerns
* **9–10:** Thoughtful design, scalable, strong engineering decisions

---

### **Code Quality (0–10)**

* **0–3:** Hard to read, fragile, or error-prone
* **4–6:** Functional but inconsistent or minimally documented
* **7–8:** Clean, readable, reasonably well-structured
* **9–10:** Highly readable, robust, and well-organized

---

### **Tech Value & Trade-offs (0–10)**

* **0–3:** Poor practices or inappropriate tech choices
* **4–6:** Acceptable but not well-justified
* **7–8:** Good balance of simplicity and capability
* **9–10:** Excellent trade-offs and strong real-world value

---

## 🧠 Scoring Philosophy

Gironimo Bench evaluates two distinct dimensions:

* **Efficiency:** How quickly a model reaches a working result
* **Capability:** The quality of the final system it produces

A model that succeeds immediately but produces a basic result will score differently than one that requires multiple attempts but delivers a stronger system.

---

## 📌 Transparency

Each run includes:

* Number of attempts used in Phase 1
* Whether Phase 2 was required
* Any manual intervention performed

This ensures results are **interpretable, reproducible, and fair**.

---

## 🗂 Repository Structure

```
gironimo-bench/
│
├── spec/               # Benchmark specifications
│   └── v1.md           # Long spec prompt for all runs
│
├── results/            # Official benchmark runs
│   ├── claude/
│   ├── gpt/
│   ├── qwen/
│   └── deepseek/
│
├── evaluations/        # Scoring methodology
│   ├── rubric.md
│   └── scoring-notes/
│
├── scripts/            # Automation
│   └── generate-leaderboard.py
│
└── website/            # GitHub Pages site (future)
```

Typical run structure:

```
run-001/
│
├── prompt.md            # Full spec used
├── architecture.md      # Generated architecture
├── code/                # Generated source code
├── metrics.json         # Scoring breakdown
└── notes.md             # Human evaluation notes
```

---

## 🎥 In the Videos

Every SlopOps episode evaluates a single model on the Gironimo Bench.

Episodes include:

* **Live model runs on the spec prompt**  
* **Architecture and code review**  
* **Score breakdowns per category**  
* **Lessons learned and leaderboard update**  

📺 [Watch on YouTube](https://youtube.com/@SlopOps)

---

## 🌐 Website

Benchmark results and leaderboard:

👉 [https://gironimo.ai/bench](https://gironimo.ai/bench)

Website is generated from this repository via GitHub Pages and updated after each video.

---

## 🔬 Why Curated?

Each run:

* Follows the same evaluation methodology  
* Is scored against the same rubric  
* Reviewed by a human engineer  
* Includes documented reasoning  

This ensures results are **consistent, comparable, and trustworthy**.

---

## 🔎 Reproducibility

All runs include:

* Original specification prompt  
* Generated architecture  
* Produced code  
* Human evaluation notes  

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
