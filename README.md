# Gironimo Bench

Benchmarking how large language models perform on **real-world AI-assisted software development workflows**.

Part of the SlopOps YouTube series, Gironimo Bench evaluates whether modern language models can implement a real engineering system from a specification.

Unlike traditional benchmarks that focus on reasoning questions or short code snippets, Gironimo Bench evaluates a complete development pipeline:

**specification → architecture → implementation → review**

All runs follow the same methodology and are **verified by hand** to ensure consistent and transparent scoring.

---

## 🎯 What Is This?

The Gironimo Bench tests how well LLMs can implement the **Gironimo development system** from a specification.

This is not multiple-choice reasoning or toy coding tasks. The benchmark evaluates whether a model can produce a **real, working codebase** with:

- system architecture
- working source code
- tests
- realistic engineering structure
- production-oriented design decisions

Each run evaluates questions such as:

- Can the model correctly interpret a specification?
- Can it design a coherent architecture?
- Can it generate maintainable code?
- Can it follow a structured development workflow?

The goal is to measure how capable models are at performing **real engineering work**, not just solving isolated prompts.

---

## 📏 Benchmark Philosophy

Most existing LLM benchmarks measure:

- reasoning questions
- short code snippets
- academic tasks

Gironimo Bench evaluates something different:

**Can a model build a real engineering system from a specification?**

Each run follows the same pipeline:

1. Specification
2. Architecture design
3. Implementation
4. Human review

This mirrors how professional engineering teams actually build software.

---

## 📦 Benchmark Versions

| Version | Description |
|---------|-------------|
| v1 | Implement the Gironimo development system from specification |

Future benchmark updates will introduce additional challenges and evaluation criteria.

---

## 📊 Current Leaderboard

| Model | Score | Run | Date |
|-------|-------|-----|------|
| *Coming soon* | – | – | – |

Full leaderboard and detailed breakdowns will be available at:

👉 **https://gironimo.ai/bench** (coming soon)

---

## 🗂 Repository Structure

```
gironimo-bench/
│
├── spec/               # Benchmark specifications
│   └── v1.md           # Version 1 challenge: build Gironimo
│
├── results/            # Official benchmark runs
│   ├── claude/
│   │   └── run-001/
│   │
│   ├── gpt/
│   │   └── run-001/
│   │
│   ├── qwen/
│   │
│   └── deepseek/
│
├── evaluations/        # Scoring methodology
│   ├── rubric.md
│   └── scoring-notes/
│
├── scripts/            # Automation tools
│   └── generate-leaderboard.py
│
└── website/            # GitHub Pages site (future)
```

Each benchmark run contains the full materials needed for transparency and reproducibility.

Typical run structure:

```
run-001/
│
├── prompt.md
├── architecture.md
├── code/
├── metrics.json
└── notes.md
```

---

## 🧠 Scoring Rubric

Models are evaluated across multiple engineering criteria.

| Criteria | Weight | Description |
|----------|--------|-------------|
| **Spec compliance** | 25% | Correct interpretation of the specification |
| **Architecture** | 25% | System design quality and maintainability |
| **Code quality** | 20% | Readability, structure, and engineering practices |
| **Tests** | 15% | Presence and correctness of tests |
| **Workflow adherence** | 15% | Respect for the spec → architecture → implementation flow |

Every score includes **detailed evaluation notes** explaining how the result was determined.

---

## 🎥 In the Videos

Every SlopOps episode evaluates a model on the Gironimo Bench.

Episodes include:

- **Live model runs**
- **Architecture and code review**
- **Score breakdowns**
- **Lessons learned from each model**

📺 https://youtube.com/@SlopOps

---

## 🌐 Website

Benchmark results and leaderboards will also be available at:

👉 **https://gironimo.ai/bench**

The website will be generated from this repository using GitHub Pages.

---

## 🔬 Why Curated?

The benchmark is intentionally curated.

Each run:

- follows the same evaluation methodology
- is scored against the same rubric
- is reviewed by a human engineer
- includes documented reasoning for the score

This ensures results remain **consistent, comparable, and trustworthy**.

---

## 🔎 Reproducibility

All benchmark runs include the original prompt, generated architecture, produced code, and evaluation notes.  
This ensures every result can be independently inspected and verified.

---

## 📄 License

**Benchmark specification and methodology:** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)  
**Code (scripts, website):** [Apache 2.0](LICENSE)

Individual model outputs remain the property of their respective providers.

---

## 🏗 Built By

**SlopOps**

Open-source tools and educational content for engineers building production systems with LLMs.

GitHub: https://github.com/SlopOps  
YouTube: https://youtube.com/@SlopOps
