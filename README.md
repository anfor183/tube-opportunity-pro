# TubeOpportunity PRO — YouTube Evergreen Keyword & Virality Opportunity Intelligence Platform

> **"What YouTube video should I create now that has a strong probability of receiving sustained search, browse, suggested, and evergreen traffic for months or years, while facing relatively weak competition?"**

TubeOpportunity PRO is a production-grade YouTube intelligence and quantitative decision-support system built for serious content creators, digital media agencies, and quantitative video strategists. It goes substantially beyond raw search-volume tools to pinpoint **hidden gems**, **content vacuums**, and **small-channel outlier opportunities**.

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    React + TypeScript Client (Vite + Tailwind)               │
│  - Dashboard & Discovery Feed       - "Find Me a Video to Make" Wizard      │
│  - 10 Search Modes (Section 3)      - Interactive Opportunity Matrix (48/49)│
│  - Hidden Gems (6 Badges)           - Competitor Beatability Engine (19/20) │
│  - Outlier Explorer (10x to 500x+)  - AI Video Blueprint Generator (21)     │
│  - Evergreen Longevity Engine       - Live Quota Indicator & Scoring Admin  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ REST API (JSON)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    Express.js Backend & Quantitative Engine                 │
│  ├── Multi-Factor Opportunity Scoring (Configurable Weights & 6 Modes)      │
│  ├── Historical Snapshot Engine (Observed vs Model-Estimated Data)          │
│  ├── Small Channel & Outlier Detector (Views >> Subscriber Multiples)       │
│  ├── Content Vacuum & Gap Detector ("No one is making this")                │
│  ├── Beatability & Requirements Checklist Generator                         │
│  ├── Production Blueprint Generator (Titles, Hooks, Thumbnails, Chapters)   │
│  ├── Live YouTube Autocomplete Client (Zero Quota Cost)                     │
│  └── Official YouTube Data API v3 Integration with Quota Manager            │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ SQL (WAL Mode, Parameterized Queries)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    SQLite Relational Database (WAL Mode)                    │
│  keywords, topics, keyword_clusters, videos, channels, video_snapshots,      │
│  keyword_snapshots, content_gaps, outliers, watchlists, alerts, quota_logs  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Capabilities & Feature Breakdown

### 2.1. Section 75: "🔥 FIND ME A VIDEO TO MAKE" Wizard
The cornerstone decision engine of the platform:
- Filters by **Channel Size** (New `<1K`, Small `<10K`, Medium `10K–100K`, Any), **Goal** (Evergreen, Viral, Both), **Min Score**, and **Max Competition**.
- Automatically evaluates the entire intelligence corpus and returns the **Top 20 Videos You Should Consider Making**.
- Runs the **Section 76 "Before You Make It" Checklist**:
  - `✓ Evidence of viewer search demand`
  - `✓ Demand is persistent & sustainable`
  - `✓ Topic is structurally evergreen`
  - `✓ Manageable competitive supply`
  - `✓ Outdated or beatable top competitor`
  - `✓ Small channel proof validated`
  - `✓ Clear content gap identified`
- Emits a specific **Recommended Attack Strategy** (e.g. mobile walkthrough, beginner setup, error fixing).

### 2.2. Multi-Factor Opportunity Score (0–100)
A transparent, non-linear weighted opportunity scoring model:

| Component Factor | Weight | Purpose |
|---|---|---|
| **Demand Score** | **20%** | Sustained search volume and viewer intent signals |
| **Competition Advantage** | **15%** | Inverted SERP barrier (low competition = high advantage) |
| **Supply Gap** | **15%** | Quality-adjusted deficit of competing videos |
| **Content Quality Gap** | **15%** | Degree to which existing videos miss crucial details |
| **Evergreen Potential** | **10%** | Multi-year search persistence and low decay risk |
| **Small Channel Proof** | **8%** | Evidence that small creators have won in this niche |
| **Outlier Evidence** | **7%** | Presence of high view-to-subscriber breakout videos |
| **Trend Stability** | **5%** | Consistency over 12 months, 2 years, and 5 years |
| **Freshness Opportunity** | **3%** | Average age of incumbents (>2 years = high opportunity) |
| **Search Intent Clarity** | **2%** | Clear actionable title satisfaction |

**Score Brackets:**
- **90–100**: Exceptional opportunity
- **80–89**: Very strong opportunity
- **70–79**: Strong opportunity
- **60–69**: Moderate opportunity
- **50–59**: Weak opportunity
- **< 50**: Poor opportunity / Avoid

**Scoring Modes Supported:**
- `Balanced Mode` (Default)
- `Evergreen Mode` (Prioritizes multi-year stability and low decay)
- `Viral & Outlier Mode` (Prioritizes velocity and outlier multiples)
- `Low Competition Mode` (Prioritizes weak incumbents and low barriers)
- `New / Small Channel Mode` (Prioritizes small creator proof and long-tail topics)
- `Monetization Mode` (Prioritizes commercial and high-CPM advertiser queries)

### 2.3. Section 31: "No One Is Making This" Content Vacuum Detector
Flags topics exhibiting:
- High estimated search interest (`>= 70`)
- Low number of relevant competing videos (`<= 30`)
- Near zero high-quality or recent videos (`<= 2`)
- Automatically badges opportunity as: `🟢 POSSIBLE CONTENT VACUUM`.

### 2.4. Section 9 & 33: Small Channel Outlier Detector
Identifies videos where `Video Views >> Channel Subscribers`:
- **Outlier Ratio** = `Video Views / Channel Subscribers`
- Tiers: `10x`, `25x`, `50x`, `100x`, `250x`, `500x+`
- Marked with: `🔥 MASSIVE OUTLIER` when ratio `>= 100x`.

### 2.5. Section 19 & 20: "Can I Beat This Video?" Engine
Analyzes any competing video:
- Calculates **Beatability Score** (0–100) based on age, authority, content depth, thumbnail quality, and viewer engagement.
- Pinpoints **Their Strengths** vs **Their Vulnerabilities**.
- Generates **Section 20 Requirements to Beat**:
  - Optimal duration range (e.g. 10–14 mins)
  - Thumbnail visual promise & what to avoid
  - Crucial missing information to include
  - Exact hook script for first 15 seconds
  - Suggested timeline chapters.

### 2.6. Section 21: Video Production Blueprint Generator
Instantly generates:
- 5–10 Clickable, High-CTR Titles
- Primary & Secondary Keywords
- Hook Script (First 15 seconds)
- Thumbnail Visual Architecture (Visual layout, text overlay, color palette)
- Video Structure & Chapters
- Section 55 Topical Authority Cluster Strategy (Pillar + Supporting videos)
- Pre-formatted YouTube Description & Tags.

### 2.7. Section 40 & 41: YouTube Data API v3 & Quota Manager
- Official YouTube v3 API client for search, video stats, and channel metrics.
- Built-in **Quota Manager** tracking daily consumption against the 10,000 units limit.
- **Zero-Quota Autocomplete Client**: Queries YouTube's live public autocomplete endpoint without consuming API quota units.
- Explicit data provenance badges on every entity:
  - `[OFFICIAL YOUTUBE API]`
  - `[OBSERVED SNAPSHOT]`
  - `[MODEL ESTIMATE]`
  - `[LOCAL CORPUS]`

---

## 3. Database Schema

The platform runs on SQLite in Write-Ahead Logging (`WAL`) mode with foreign key constraints enabled:
- `keywords`: Term, category, search intent, lifecycle status, evergreen classification, demand score, supply score, competition score, quality_adjusted_supply, opportunity_score, data_source, confidence, why_analysis, recommended_angle.
- `topics`: Primary niche taxonomy and cluster opportunity sums.
- `keyword_clusters`: Parent-child topic relationships, cluster roles (pillar, subtopic, long_tail, question, problem, tutorial).
- `channels`: Channel metadata, subscriber count, total views, channel age, authority score.
- `videos`: Video metadata, published date, view counts, calculated velocities, outlier ratios, beatability scores, content depth, engagement rates.
- `video_snapshots`: Time-series view/like/comment history distinguishing `is_observed` (real) from `is_observed=0` (estimated).
- `keyword_snapshots`: 12-month and multi-year historical search interest curves.
- `content_gaps`: Missing subtopics, mobile omissions, beginner setup gaps, and opportunity lift percentages.
- `outliers`: Detected videos with view-to-sub ratios from 10x to 500x+.
- `watchlists` & `alerts`: Saved user watchlist with automated score acceleration alerts.
- `api_quota_logs`: Live quota ledger recording endpoint, units consumed, remaining daily quota, and reset timestamp.
- `scoring_weights_config`: Dynamic weights configuration.

---

## 4. How to Run the Application

### Prerequisites
- Node.js v18+ (tested on Node v22.14.0)
- npm 9+

### Quick Start (Single Command)

From the project root:
```bash
# 1. Install dependencies (if not already installed)
npm --prefix server install
npm --prefix client install

# 2. Build client assets
npm run build:client

# 3. Start production server (serves API and UI on port 5000)
npm run server
```

Open your browser at:
```
http://localhost:5000
```

### Development Mode (Concurrent Live Reload)

To run backend and frontend independently with Hot Module Replacement (HMR):

Terminal 1 (Backend API):
```bash
npm run dev:server
# Runs on http://localhost:5000 with --watch
```

Terminal 2 (Frontend Vite Dev Server):
```bash
npm run dev:client
# Runs on http://localhost:5173 with proxy to backend
```

---

## 5. Running Automated Unit Tests

A comprehensive unit test suite verifies scoring accuracy, outlier ratio mathematics, snapshot calculations, and logarithmic normalization:

```bash
npm test
```

Expected output:
```
✔ Outlier Ratio correctly identifies 100x+ massive outlier
✔ Outlier tier mapping matches designated thresholds
✔ Small channel success analysis calculates evidence correctly
✔ Opportunity Score correctly identifies very strong opportunity
✔ Opportunity Score correctly identifies exceptional opportunity
✔ Opportunity Score correctly scores weak saturated opportunity
✔ Logarithmic normalization functions within 0-100 bounds
✔ Demand/Supply ratio scales correctly
✔ Video velocity calculation handles lifetime and daily velocities

tests 9 | pass 9 | fail 0
```

---

## 6. Environment Variables

Create a `.env` file in `server/` (or configure via the Settings UI):

```env
# Server Port
PORT=5000

# Optional: Official YouTube Data API v3 Key
# If omitted, system seamlessly runs in Standalone Mode using the rich SQLite observed corpus
# and live YouTube public autocomplete suggestions (0 API quota cost).
YOUTUBE_API_KEY=
```

---

## 7. Metrics: Real vs Estimated vs Observed

To uphold Section 41 and 66 Anti-Hallucination standards:

| Metric | Source Type | Description |
|---|---|---|
| **Video Views, Likes, Comments** | `Official / Observed` | Verified from YouTube Data API v3 or local snapshot database |
| **Channel Subscribers** | `Official / Observed` | Channel subscriber counts from API / database |
| **Outlier Ratio** | `Real Calculated` | Exact mathematical formula: `Views / Channel Subscribers` |
| **Search Autocomplete Suggestions** | `Real Live` | Direct from YouTube's public suggest endpoint |
| **Views / Day & Velocity** | `Real Calculated` | Exact formula: `Lifetime Views / Age Days` |
| **Historical View Intervals** | `Observed vs Estimated` | Multi-month snapshots tagged with `is_observed = 1` vs `0` |
| **Demand / Supply Index** | `Quantitative Model` | Multi-signal normalized index (0–100) |
| **Evergreen & Beatability Score** | `Algorithmic Model` | Transparent multi-factor heuristic (0–100) |
| **Search Volume** | `Explicitly Labeled` | Estimated interest signals (YouTube official API does not provide exact raw monthly search numbers to third parties) |

---

## 8. License & Integrity

Built for high-performance YouTube quantitative market intelligence. Preserves data integrity, transparent heuristics, and actionable production clarity.
