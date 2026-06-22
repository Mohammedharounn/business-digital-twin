# Backend Architecture & Database Design Specification
## Business Digital Twin Platform

This document provides a technical blueprint for the authentication system and data persistence layer, optimized for scale, security, and high-frequency updates (3D layouts).

---

## 1. PostgreSQL Schema Design

### 1.1 Core Entities & Relationships
We use a hybrid approach: **Relational** for structural data (Users, Businesses, Permissions) and **JSONB** for high-velocity or complex state data (3D Layouts, Simulation Result Snapshots).

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Authentication & RBAC
CREATE TYPE user_role AS ENUM ('user', 'admin', 'investor', 'analyst');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- Argon2id
    role user_role DEFAULT 'user',
    is_verified BOOLEAN DEFAULT false,
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Business Management
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    industry_type VARCHAR(50) NOT NULL,
    config JSONB NOT NULL, -- Simulation variables
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 3D Layout Persistence
CREATE TABLE layouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    active_version_id UUID, -- Circular reference managed via triggers or logic
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE layout_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    layout_id UUID REFERENCES layouts(id) ON DELETE CASCADE,
    version_name VARCHAR(100),
    objects JSONB NOT NULL, -- Entire scene graph: [{type, pos, rot, scale, meta}, ...]
    screenshot_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- 4. Permissions & Sharing
CREATE TYPE access_level AS ENUM ('view', 'edit', 'admin');

CREATE TABLE business_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    access access_level DEFAULT 'view',
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, user_id)
);

-- 5. Audit & Activity
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    business_id UUID REFERENCES businesses(id),
    action VARCHAR(100) NOT NULL,
    metadata JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 1.2 Indexing Strategy
- **B-Tree on Foreign Keys**: Essential for join performance (`owner_id`, `business_id`, `user_id`).
- **GIN Index on JSONB**: Allows querying specific objects inside the layout.
  - `CREATE INDEX idx_layout_objects ON layout_versions USING GIN (objects);`
- **Unique on Email**: `CREATE UNIQUE INDEX idx_user_email ON users(email);`
- **Covering Indexes**: For common queries like fetching a business with its active layout.

---

## 2. Relational vs. JSONB Usage Rationale

| Data Type | Usage | Rationale |
|-----------|-------|-----------|
| **Relational** | Users, Permissions, Billing | Requires ACID compliance, strict constraints, and frequent cross-table joins. |
| **JSONB** | 3D Scene Graph | Layouts frequently change structure (adding new props, metadata). Storing as a blob avoids hundreds of small rows per save. |
| **JSONB** | Simulation Config | The simulation engine variables are nested and hierarchical; JSONB maps 1:1 to the frontend state object. |

---

## 3. API Endpoints (RESTful)

### 3.1 Authentication
- `POST /v1/auth/signup`: Create account + send verification email.
- `POST /v1/auth/login`: Return Access Token (JWT) + Set Refresh Token (HttpOnly Cookie).
- `POST /v1/auth/refresh`: Rotate refresh tokens + new access token.
- `POST /v1/auth/logout`: Revoke refresh token.
- `POST /v1/auth/forgot-password`: Send ephemeral signed link.
- `POST /v1/auth/verify-email`: Process verification token.

### 3.2 Layouts & Persistence
- `GET /v1/businesses/{id}/layout`: Fetch active layout version.
- `POST /v1/businesses/{id}/layout/autosave`: Debounced partial update (write-ahead log).
- `POST /v1/businesses/{id}/layout/version`: Create namespaced snapshot (Explicit Save).
- `GET /v1/businesses/{id}/versions`: List version history.
- `PATCH /v1/businesses/{id}/layout/active`: Roll back to a previous version.

---

## 4. Autosave Mechanism
To prevent overworking the DB during 3D editing:

1. **Frontend Buffer**: Local state updates instantly.
2. **Debounce (5s)**: Only send data if no changes occur for 5 seconds.
3. **Write-Ahead Log (WAL)**: Instead of overwriting the version every time, push "diffs" to a Redis stream.
4. **Background Flush**: A worker consolidates Redis diffs and performs a single PostgreSQL `UPDATE` every minute.

---

## 5. Security Best Practices

### 5.1 Token Security
- **JWT Signing**: RS256 (Asymmetric) - allows microservices to verify tokens with a Public Key without needing the Private Key.
- **CSRF Protection**: Use `SameSite=Strict` and custom Headers (e.g., `X-Requested-With`) to block cross-origin requests.
- **XSS Mitigation**: Content Security Policy (CSP) headers; strict sanitization of any user-generated text in layouts.

### 5.2 Database Security
- **Row Level Security (RLS)**: Enforce that `user_id` on the request matches the `owner_id` or `permission` record at the DB engine level.
```sql
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY business_access_policy ON businesses
    FOR ALL TO authenticated
    USING (owner_id = auth.uid() OR id IN (SELECT business_id FROM business_permissions WHERE user_id = auth.uid()));
```
- **Connection Pooling**: Use **PgBouncer** to handle high-frequency connections from serverless functions.
- **Encryption at Rest**: AWS RDS / Google Cloud SQL encryption enabled by default.

### 5.3 Infrastructure
- **Rate Limiting**: Nginx/Cloudflare tier + Application-level limits (max 5 login attempts/min).
- **Secrets Management**: Use AWS Secrets Manager or HashiCorp Vault; **never** store `PRIVATE_KEY` in `.env` files in production.
