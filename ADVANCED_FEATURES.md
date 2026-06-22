# Business Digital Twin — Advanced Features Architecture

> Version 2.0 | Last Updated: February 2026

---

## Table of Contents

1. [Feature Architecture](#1-feature-architecture)
2. [Data Model Changes](#2-data-model-changes)
3. [Backend Services Required](#3-backend-services-required)
4. [AI Models Required](#4-ai-models-required)
5. [Job/Queue Design](#5-jobqueue-design)
6. [UX Integration](#6-ux-integration)
7. [Metrics to Measure Success](#7-metrics-to-measure-success)
8. [MVP vs Advanced Rollout](#8-mvp-vs-advanced-rollout)

---

## 1. Feature Architecture

### 1.1 Weekly AI Reports

**Pipeline Architecture:**
```
[Cron Scheduler] → [Report Job Queue] → [Data Aggregator] → [LLM Report Generator] → [Template Renderer] → [Delivery Service]
                                              ↓
                                    [Financial Engine]
                                    [Risk Engine]
                                    [Trend Calculator]
                                    [Optimizer Engine]
```

**Data Sources:**
- Business configuration (user_businesses table)
- Financial simulation snapshots (simulation_snapshots table)
- Risk assessment history (risk_assessments table)  
- User activity events (activity_log table)
- Scenario comparison results (scenarios table)

**Async Job Design:**
- Cron trigger: Every Monday 8:00 AM user local time
- Job queue: Bull/BullMQ with Redis backend
- Retry policy: 3 retries, exponential backoff
- Timeout: 60 seconds per report
- Batch processing: 500 users/batch with 1s delay between batches

**Report Personalization Logic:**
```
IF user.profitMargin < 10% → emphasize cost reduction
IF user.riskScore > 60 → lead with risk warnings
IF user.roi > 25% → highlight growth opportunities  
IF user.streakWeeks > 4 → celebrate consistency
IF user.lastLogin > 7 days → re-engagement messaging
```

**Delivery Channels:**
| Channel | Implementation | Priority |
|---------|---------------|----------|
| In-App | React component (✅ BUILT) | MVP |
| Email | SendGrid/SES with HTML template | MVP |
| Push | Firebase Cloud Messaging (FCM) | Advanced |
| SMS | Twilio (critical alerts only) | Enterprise |

**LLM Prompt Design:**
```
System: You are a senior business analyst generating a weekly intelligence 
briefing for a {business_type} business.

Context:
- Monthly Revenue: {revenue}
- Profit Margin: {margin}%
- Risk Score: {risk_score}/100
- Week-over-week revenue change: {wow_change}%
- Top 3 risks: {risks}
- Break-even: Month {break_even}

Generate a 3-paragraph executive briefing covering:
1. Performance summary with specific numbers
2. Top concern or opportunity with actionable recommendation
3. One-week action item with expected impact

Tone: Professional, concise, data-driven. Max 200 words.
```

---

### 1.2 Gamification System

**Scoring Logic:**
```
XP Sources:
├── Badge Unlocks: 100-500 XP each (15 badges implemented)
├── Daily Activity: 10 XP/login
├── Scenario Created: 25 XP
├── AI Question Asked: 5 XP
├── Report Generated: 15 XP
└── Optimization Run: 30 XP
```

**Badge Engine Architecture:**
```
[Event Stream] → [Badge Evaluator] → [Unlock Checker] → [Notification Service]
                        ↓                    ↓
               [User Progress DB]    [Achievement History]
```

**Anti-Spam Safeguards:**
- Rate limit: Max 500 XP/day from activities
- No XP for duplicate actions within 1 hour
- Badge unlock requires genuine metric achievement (verified server-side)
- Cooldown: 5 min between repeated AI questions for XP

**Reward Psychology (Implemented):**
- **Progress Visibility**: XP bar with next-level preview (creates anticipation)
- **Variable Rewards**: Different XP values per badge category
- **Loss Aversion**: Streak counter (users protect their streaks)
- **Social Proof**: Completion percentage shown
- **Milestone Celebrations**: Badge earn animations

---

### 1.3 Growth Features (Virality)

**Shareable Business Twin Links:**
```
URL: /twin/{public_id}?utm_source=share&ref={user_id}
Access: Read-only snapshot of dashboard
Content: KPIs, charts, executive summary (no raw data)
```

**Permission Model:**
```sql
-- Share permissions
CREATE TYPE share_access AS ENUM ('view', 'comment', 'edit', 'admin');

-- Sharing table
CREATE TABLE business_shares (
  id UUID PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  shared_by UUID REFERENCES users(id),
  shared_with UUID REFERENCES users(id) NULL,  -- NULL = public link
  access_level share_access DEFAULT 'view',
  public_token VARCHAR(64) UNIQUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Viral Loop Design:**
```
User creates twin → Simulation results → "Share with co-founder" CTA
                                       → "Get investor feedback" CTA
                                       → "Compare with peers" CTA
         ↓
   Shared user sees results → "Create your own twin" CTA
         ↓
   New user signs up (referral tracked)
         ↓
   Original user gets badge + XP
```

**Referral Mechanics:**
- Referrer gets: "Network Builder" badge (100 XP per referral)
- Referee gets: Extended free trial
- Track: UTM params + referral cookie (30-day window)

---

### 1.4 Location Intelligence (✅ IMPLEMENTED)

**Required Datasets (Production):**
| Dataset | Source | Update Frequency |
|---------|--------|-----------------|
| Rent data | Zillow API, LoopNet API | Monthly |
| Foot traffic | SafeGraph, Placer.ai | Weekly |
| Demographics | US Census Bureau API | Annual |
| Competition | Google Places API, Yelp Fusion | Monthly |
| Demand index | BLS Consumer Expenditure | Quarterly |
| Crime data | FBI UCR API | Annual |

**Feature Engineering:**
```python
features = {
    'rent_per_sqft': rent / sqft,
    'rent_to_revenue_ratio': rent / projected_revenue,
    'foot_traffic_index': normalized_traffic_score,
    'demographic_match': cosine_similarity(biz_target, area_demo),
    'competition_density': competitors_within_radius / radius_sq_miles,
    'demand_score': category_spending * population_density,
    'accessibility_score': transit_score + parking_score,
    'crime_safety_index': 1 - normalized_crime_rate
}
```

**Caching Strategy:**
- Location data: Redis cache, 24h TTL
- Scoring results: Cache per (location_id, business_type), 1h TTL
- API responses: HTTP cache with ETag headers
- Pre-compute top 20 locations per business type daily

---

### 1.5 Autonomous Optimization Engine (✅ IMPLEMENTED)

**Architecture:**
```
[User Config] → [Strategy Generator] → [Evaluation Pipeline] → [Ranking Engine] → [Results UI]
                       ↓                        ↓
              [Parameter Sweeps]        [Financial Engine]
              [Combined Strategies]     [Risk Engine]
              [Elasticity Models]       [Composite Scorer]
```

**Optimization Approach (Heuristic + Grid Search):**
- **Pricing**: Sweep -15% to +30% in 5% steps with demand elasticity (-0.3 to -0.5)
- **Staffing**: ±3 employees from current
- **Rent**: 85% to 120% of current (negotiation scenarios)
- **Volume**: 70% to 150% of current daily customers
- **Combined**: 4 pre-designed multi-variable strategies

**Evaluation Metrics (Composite Score):**
```
score = margin × 1.5 + roi × 0.8 + breakeven_bonus × 2 - risk_penalty × 0.5 + 30
```

**Safety Constraints:**
- Minimum 1 employee always maintained
- Maximum 200% price increase cap
- Rent cannot go below $500/month
- Customer volume bounded to realistic ranges
- All strategies flagged with risk level

**Explainability Layer:**
- Score breakdown visible on hover
- Strategy type labels (pricing, staffing, rent, growth, combined)
- Delta comparison vs base case for every metric
- Risk badge on every strategy card

---

## 2. Data Model Changes

### New Tables

```sql
-- Gamification
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  badge_id VARCHAR(50) NOT NULL,
  xp_earned INT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE TABLE user_progress (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  total_xp INT DEFAULT 0,
  level INT DEFAULT 1,
  streak_weeks INT DEFAULT 0,
  last_active_at TIMESTAMPTZ,
  simulations_run INT DEFAULT 0,
  scenarios_created INT DEFAULT 0,
  ai_questions_asked INT DEFAULT 0,
  reports_generated INT DEFAULT 0,
  optimizations_run INT DEFAULT 0
);

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly Reports
CREATE TABLE weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  business_id UUID REFERENCES businesses(id),
  report_data JSONB NOT NULL,
  health_score INT,
  period_start DATE,
  period_end DATE,
  delivered_via VARCHAR(20)[],
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Location Intelligence
CREATE TABLE location_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  business_id UUID REFERENCES businesses(id),
  locations_compared JSONB NOT NULL,
  best_location_id VARCHAR(50),
  best_score INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optimization Results
CREATE TABLE optimization_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  business_id UUID REFERENCES businesses(id),
  strategies_generated INT,
  top_strategy JSONB,
  top_score INT,
  base_profit NUMERIC,
  best_profit NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sharing & Collaboration
CREATE TABLE business_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  shared_by UUID REFERENCES users(id),
  shared_with UUID REFERENCES users(id),
  access_level VARCHAR(20) DEFAULT 'view',
  public_token VARCHAR(64) UNIQUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES users(id),
  referee_id UUID REFERENCES users(id),
  referral_code VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending',
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activity_log_user ON activity_log(user_id, created_at DESC);
CREATE INDEX idx_weekly_reports_user ON weekly_reports(user_id, period_end DESC);
CREATE INDEX idx_badges_user ON user_badges(user_id);
CREATE INDEX idx_shares_token ON business_shares(public_token);
```

---

## 3. Backend Services Required

| Service | Technology | Purpose | Priority |
|---------|-----------|---------|----------|
| **Report Service** | Node.js + BullMQ | Generate & deliver weekly reports | MVP |
| **Gamification Service** | Node.js + Redis | Badge evaluation, XP tracking | MVP |
| **Location Service** | Python/FastAPI | Geo data aggregation, scoring | MVP |
| **Optimization Service** | Python/FastAPI | Strategy generation & evaluation | MVP |
| **Notification Service** | Node.js + SendGrid | Email, push, in-app notifications | MVP |
| **Share Service** | Node.js | Public links, permissions, collaboration | Advanced |
| **Analytics Service** | Node.js + ClickHouse | Event tracking, funnel analysis | Advanced |
| **Cache Layer** | Redis Cluster | Hot data caching, rate limiting | MVP |

**Microservice Communication:**
```
API Gateway (Kong/nginx) → Service Mesh
├── Auth Service (JWT validation)
├── Business Service (CRUD, simulation)
├── Report Service (async queue)
├── Gamification Service (event-driven)
├── Location Service (REST + cache)
├── Optimization Service (async compute)
├── Notification Service (fan-out)
└── Analytics Service (event ingestion)
```

---

## 4. AI Models Required

| Model | Type | Purpose | Infrastructure |
|-------|------|---------|---------------|
| **Report Generator** | GPT-4o / Claude | Natural language report narration | API call per report |
| **Demand Forecaster** | XGBoost / Prophet | Predict customer volume by location | Self-hosted, retrain weekly |
| **Price Optimizer** | Bayesian Optimization | Find optimal price point with elasticity | Self-hosted |
| **Risk Predictor** | Random Forest | Predict business failure probability | Self-hosted, retrain monthly |
| **Location Scorer** | Gradient Boosting | Multi-factor location scoring | Self-hosted |
| **Recommendation Engine** | Collaborative Filtering | Suggest configurations from similar businesses | Self-hosted |

---

## 5. Job/Queue Design

```
Redis + BullMQ Architecture:

Queue: weekly-reports
├── Schedule: Monday 08:00 UTC (per timezone batch)
├── Concurrency: 10 workers
├── Retry: 3 attempts, exponential backoff
├── Timeout: 60s per job
└── Dead letter queue after 3 failures

Queue: badge-evaluation
├── Trigger: On every user event
├── Concurrency: 20 workers
├── Debounce: 30s per user
└── Batch: Evaluate all badges per event

Queue: optimization-runs
├── Trigger: User-initiated
├── Concurrency: 5 workers (CPU intensive)
├── Timeout: 120s
└── Cache results: 1h TTL

Queue: notifications
├── Trigger: Report ready, badge earned, alert
├── Concurrency: 50 workers
├── Priority: alerts > badges > reports
└── Rate limit: 10 notifications/user/day
```

---

## 6. UX Integration

### New Sidebar Navigation (✅ IMPLEMENTED)
```
ANALYTICS
├── 📊 Dashboard
├── 🔄 Scenarios  
└── 📍 Location Intel       ← NEW

AI TOOLS
├── 🤖 AI Advisor
├── ⚡ Auto Optimizer        ← NEW
├── 📬 Weekly Report         ← NEW
└── 📄 Export Reports

ENGAGEMENT
└── 🎮 Founder Journey       ← NEW
```

### Page Integration Points:
- **Dashboard**: Add gamification progress bar in header
- **Scenarios**: "Auto-generate with Optimizer" CTA
- **AI Advisor**: Track questions for gamification XP
- **Reports**: Track generation for badge progress
- **All pages**: Share button in top bar

---

## 7. Metrics to Measure Success

### Retention Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| D1 Retention | >60% | Users returning day after first simulation |
| D7 Retention | >40% | Users returning within 7 days |
| D30 Retention | >25% | Monthly active retention |
| Weekly Report Open Rate | >35% | Reports read / reports delivered |
| Streak Length (avg) | >3 weeks | Average consecutive active weeks |

### Engagement Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Avg Session Duration | >8 min | Time from login to last action |
| Scenarios per User | >4 | Average scenarios created |
| AI Questions per Session | >3 | Chat interactions per visit |
| Optimization Runs | >2/user | Auto-optimizer usage |
| Badge Unlock Rate | >40% | % of possible badges earned |

### Growth Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Viral Coefficient | >0.3 | Referrals per user |
| Share Rate | >15% | Users who share at least once |
| Referral Conversion | >25% | Shared links → Sign-ups |
| Public Template Usage | >500/month | Community template usage |
| Organic Sign-ups | >40% | Non-paid acquisition |

---

## 8. MVP vs Advanced Rollout

### Phase 1: MVP (✅ IMPLEMENTED — Frontend)
| Feature | Status | Notes |
|---------|--------|-------|
| Gamification Page | ✅ Built | 15 badges, 10 levels, XP system |
| Location Intelligence | ✅ Built | 8 locations, scoring, comparison |
| Autonomous Optimizer | ✅ Built | 30+ strategies, ranking |
| Weekly AI Report | ✅ Built | Health score, alerts, trends |
| Sidebar Navigation | ✅ Updated | New sections added |

### Phase 2: Advanced (Backend Required)
| Feature | Timeline | Dependencies |
|---------|----------|-------------|
| Automated email reports | Week 3-4 | SendGrid, BullMQ |
| Real location data APIs | Week 4-6 | SafeGraph, Zillow APIs |
| Persistent gamification | Week 3-4 | PostgreSQL, Redis |
| Public sharing links | Week 5-6 | Share service, permissions |
| LLM-powered report narration | Week 4-5 | OpenAI/Claude API |
| Collaborative editing | Week 6-8 | WebSocket, CRDT |

### Phase 3: Enterprise
| Feature | Timeline | Dependencies |
|---------|----------|-------------|
| Real-time market data feeds | Month 3 | Bloomberg/Reuters API |
| Multi-business portfolio | Month 3-4 | Portfolio service |
| White-label/franchise | Month 4-5 | Theming engine |
| Advanced ML optimization | Month 5-6 | GPU compute, MLflow |
| API for third-party integrations | Month 4 | OAuth, rate limiting |

---

## Architecture Diagram

```
                    ┌──────────────────────────────┐
                    │      Frontend (React/Vite)    │
                    │  ┌─────────────────────────┐  │
                    │  │ Dashboard │ Scenarios    │  │
                    │  │ AI Advisor│ Reports      │  │
                    │  │ Location  │ Optimizer    │  │
                    │  │ Gamification│ Weekly Rpt │  │
                    │  └─────────────────────────┘  │
                    └──────────────┬─────────────────┘
                                   │ REST/WebSocket
                    ┌──────────────▼─────────────────┐
                    │       API Gateway (Kong)        │
                    └──┬──────┬──────┬──────┬────────┘
                       │      │      │      │
              ┌────────▼──┐ ┌─▼────┐ ┌▼─────┐ ┌▼──────────┐
              │  Business  │ │Report│ │Gamify│ │ Location   │
              │  Service   │ │ Svc  │ │ Svc  │ │ Intel Svc  │
              └──────┬─────┘ └──┬───┘ └──┬───┘ └──┬────────┘
                     │          │        │        │
              ┌──────▼──────────▼────────▼────────▼─────┐
              │            PostgreSQL + Redis            │
              └──────────────────────────────────────────┘
                     │
              ┌──────▼──────────────────┐
              │   BullMQ Job Queues     │
              │  ├── weekly-reports     │
              │  ├── badge-evaluation   │
              │  ├── optimization-runs  │
              │  └── notifications      │
              └─────────────────────────┘
```
