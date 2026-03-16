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
| **SEO & Value**               | Lighthouse: SEO + cost/value tradeoffs                     | 10         |

> **Overall Gironimo Score** = sum of all 10 categories → **maximum 100 points**.  
> Visual leaderboard is designed for easy comparison, perfect for **Doug DeMuro-style scoring** in videos.

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
