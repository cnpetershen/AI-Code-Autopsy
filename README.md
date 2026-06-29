<p align="center">
  <img src="https://img.shields.io/badge/ai--code--autopsy-v1.0.0-blue?style=flat-square" alt="version" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="license" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs" />
</p>

<h1 align="center">🔍 AI Code Autopsy</h1>

<p align="center">
  <strong>We autopsy AI-generated code and expose its structural risks.</strong>
  <br />
  <em>A viral forensic devtool that detects, roasts, and fixes AI-generated code patterns.</em>
</p>

<br />

<p align="center">
  <img src="https://img.shields.io/badge/scan-forensic%20report-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/roast-viral%20mode-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/explain-technical%20analysis-purple?style=for-the-badge" />
  <img src="https://img.shields.io/badge/ci-machine%20ready-black?style=for-the-badge" />
</p>

***

## 🤖 The Problem

AI-generated code **looks correct** but **fails in production**.

Traditional linters and code reviewers cannot detect AI patterns:

- Cookie-cutter template structures
- Over-engineered class names
- Excessive symmetry and repetition
- Hollow semantic meaning

**AI Code Autopsy** is the first tool that treats AI-generated code as a **forensic investigation**.

```bash
# One command. Instant diagnosis.
npx ai-code-autopsy scan src/components/HeroSection.tsx
```

***

## 🚀 Quick Start

```bash
# Run a full forensic scan
npx ai-code-autopsy scan path/to/file.tsx

# Get roasted (viral mode)
npx ai-code-autopsy roast path/to/file.tsx

# Technical deep dive
npx ai-code-autopsy explain path/to/file.tsx

# CI-ready machine output
npx ai-code-autopsy ci path/to/file.tsx --threshold 0.5
```

***

## 📸 See It In Action

### Scan Mode — Professional Forensic Report

```
  ╔══════════════════════════════════════════════════════════╗
  ║           AI CODE AUTOPSY — FORENSIC REPORT              ║
  ╚══════════════════════════════════════════════════════════╝

  Target:       LandingPage.tsx

  ┌────────────────────────────────────────────────────────┐
  │                  EXECUTIVE SUMMARY                     │
  └────────────────────────────────────────────────────────┘

    AI Score:      84/100
    Classification: Mostly AI
    Verdict:       Strong AI generation patterns detected.

    ❝ This code was definitely written by ChatGPT
      after 3 coffees on a Monday. ❞

  ┌────────────────────────────────────────────────────────┐
  │                    FINDINGS                            │
  └────────────────────────────────────────────────────────┘

    🔴 CRITICAL  AI-typical hero section: heading + paragraph + buttons
           AI generates hero sections with identical structure

    🟠 HIGH      AI-typical pricing cards: Basic / Pro / Enterprise trio
           Three pricing cards is the most recognizable AI pattern

    🟡 MEDIUM    AI-typical testimonial card: avatar + quote + name
           Testimonial sections with identical cards are AI templates
```

### Roast Mode — Viral & Shareable

```
  😬  AI CODE AUTOPSY - ROAST REPORT
  ──────────────────────────────────────────────

  " Your AI thinks it is a designer. It is not. "

  AI Score:      84/100
  Verdict:       AI-GENERATED
  Findings:      12
  Critical:      3
  High:          5

  💀  AI-typical pricing cards: Basic / Pro / Enterprise trio
  🔥  AI-typical hero section: heading + paragraph + buttons
  ⚠️  AI-typical feature section: icon + h3 + p grid

  ╔══════════════════════════════════════════════╗
  ║     🔍 AI CODE AUTOPSY - AUTOPSY RESULT      ║
  ║  File: LandingPage.tsx                       ║
  ║  Score: 84/100                               ║
  ║  "Your AI thinks it is a designer."          ║
  ║  🔗 https://ai-code-autopsy.dev              ║
  ╚══════════════════════════════════════════════╝
```

### CI Mode — Machine Ready

```bash
$ npx ai-code-autopsy ci src/ --threshold 0.5
```

```json
{
  "tool": "ai-code-autopsy",
  "mode": "ci",
  "result": {
    "score": 84,
    "verdict": "ai-generated",
    "passed": false,
    "totalFindings": 12,
    "threshold": 50,
    "severityBreakdown": {
      "critical": 3,
      "high": 5,
      "medium": 3,
      "low": 1
    }
  },
  "summary": "FAILED: AI score 84/100 exceeds threshold 50/100"
}
```

Exit code `1` on failure — perfect for CI pipelines.

***

## 🧠 How It Works

```
  ┌─────────┐    ┌──────────┐    ┌──────────┐    ┌─────────┐
  │  Parse  │ →  │  Detect  │ →  │  Score   │ →  │  Report │
  │  (AST)  │    │  (4 Engines)│  │ (Weighted)│   │(4 Modes)│
  └─────────┘    └──────────┘    └──────────┘    └─────────┘
```

4 detection engines work together to identify AI-generated code:

| Engine                 | What It Finds                                           |
| ---------------------- | ------------------------------------------------------- |
| 🏗️ Layout Detector    | Symmetrical grids, container soup, card farms           |
| 🎯 AI Pattern Detector | Hero sections, feature grids, pricing trios, footers    |
| 🎨 Tailwind Detector   | AI-class token density, over-engineered class names     |
| 🧠 Heuristic Engine    | Repetitive content, icon-every-card, semantic emptiness |

***

## 🎭 Personality System

Choose your mode. Own your output.

| Mode       | Command   | Personality                  | Best For                    |
| ---------- | --------- | ---------------------------- | --------------------------- |
| 🔍 Scan    | `scan`    | Professional forensic report | Code review, documentation  |
| 🔥 Roast   | `roast`   | Viral, humorous, shareable   | Twitter, memes, team banter |
| 📊 Explain | `explain` | Technical deep dive          | Debugging, learning         |
| 🤖 CI      | `ci`      | Strict machine output        | GitHub Actions, CI/CD       |

***

## 🔗 CI Integration

Add to your `package.json`:

```json
{
  "scripts": {
    "autopsy": "ai-code-autopsy ci src/ --threshold 0.5"
  }
}
```

Or use the GitHub Action:

```yaml
- name: AI Code Autopsy
  run: npx ai-code-autopsy ci src/ --threshold 0.5
```

The CI command:

- Returns structured JSON
- Exits with code `1` if threshold is exceeded
- Supports PR comments via GitHub Actions
- Is ready for any CI/CD pipeline

***

## 🛠️ Commands

### `scan <file>`

Full forensic report. Professional output with executive summary, metrics breakdown, findings, and recommendations.

### `roast <file>`

Viral mode. Generates a humorous roast with a shareable ASCII art block. Perfect for screenshots.

### `explain <file>`

Technical breakdown. Shows location-level findings, AI signature indicators, and detailed explanations.

### `fix <file>`

Auto-fix mode. Attempts to transform AI-generated patterns into human-like code.

### `ci <file> --threshold 0.5`

CI mode. Machine-readable JSON output. Exit code `1` on failure.

***

## 📦 Installation

```bash
# Run directly (no install needed)
npx ai-code-autopsy scan <file>

# Install globally
npm install -g ai-code-autopsy

# Add to project
npm install --save-dev ai-code-autopsy
```

***

## 🌟 Why This Exists

AI writes code. A lot of it. But AI-generated code has a **structural signature**:

- It is **too symmetrical**
- It is **too repetitive**
- It is **too generic**
- It **looks right** but **feels wrong**

Existing tools ignore this. **AI Code Autopsy** does not.

We turn code review into a **forensic investigation** — and make it **fun** to share.

***

## 📊 Roadmap

- [x] AST-based code analysis engine
- [x] AI-generated code risk scoring
- [x] CLI with 4 personality modes
- [x] CI integration with exit codes
- [ ] VS Code extension with inline annotations
- [ ] Web playground (try it in the browser)
- [ ] GitHub app (auto-autopsy PRs)
- [ ] SaaS dashboard (team-wide autopsies)

***

## 👥 Contributing

PRs welcome! Read the code, file an issue, or send a roast.

```bash
git clone https://github.com/yourusername/ai-code-autopsy
cd ai-code-autopsy
npm install
npm run build
npm run cli scan examples/ai-generated-ui.tsx
```

***

<p align="center">
  <strong>
    <a href="#-ai-code-autopsy">↑ Back to top</a>
  </strong>
  <br /><br />
  Made with 🔍 by developers who have seen too much AI code.
  <br />
  <em>We autopsy AI-generated code so you do not have to.</em>
</p>

***

<p align="center">
  <a href="https://github.com/yourusername/ai-code-autopsy/stargazers">
    <img src="https://img.shields.io/github/stars/yourusername/ai-code-autopsy?style=social" alt="stars" />
  </a>
  <a href="https://github.com/yourusername/ai-code-autopsy/issues">
    <img src="https://img.shields.io/github/issues/yourusername/ai-code-autopsy?style=social" alt="issues" />
  </a>
</p>
