# Business Digital Twin — 3D, Auth & Persistence Architecture

This document outlines the design and implementation specifications for the 3D Visualization system, Authentication/User Management, and the Data Persistence layer.

---

## 1. 3D Engine Architecture

### 1.1 Choice of Engine: Three.js with React Three Fiber
We utilize **React Three Fiber (R3F)** for the 3D environment.
- **Declarative**: Allows managing 3D objects as React components.
- **Ecosystem**: Leverages `@react-three/drei` for complex helpers (Grid, TransformControls, Shadows).
- **Performance**: Fiber has near-zero overhead over Three.js and handles the render loop efficiently using the React lifecycle.

### 1.2 Asset Architecture
- **Geometry**: Procedural primitive shapes (Box, Cylinder) for MVP to ensure rapid generation.
- **Materials**: Standard PBR materials with environment mapping for realistic lighting.
- **Loading**: Use `GLTFLoader` for high-fidelity equipment models in later phases, stored on **AWS S3**.

---

## 2. Authentication & User Management

### 2.1 Architecture
A state-of-the-art JWT-based authentication system.

- **Storage**: Passwords hashed using **Argon2id** (superior to BCrypt).
- **Session Management**: 
  - **Access Token**: Short-lived (15 mins), stored in memory.
  - **Refresh Token**: Long-lived (7 days), stored in **HttpOnly, Secure, SameSite=Strict** cookies to prevent XSS/CSRF.

### 2.2 Security Features
- **Rate Limiting**: Implementation of `express-rate-limit` for login/signup endpoints.
- **Role-Based Access Control (RBAC)**:
  - `User`: Can create and edit their own twins.
  - `Investor`: Read-only access to shared business twins + advanced reporting.
  - `Admin`: Platform management and global simulation overrides.

---

## 3. Data Persistence (PostgreSQL + S3)

### 3.1 Database Schema (PostgreSQL)

```sql
-- Profiles & User Data
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Configurations
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    sqft INTEGER NOT NULL,
    rent NUMERIC NOT NULL,
    config JSONB NOT NULL, -- Full simulation parameters
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3D Layout Persistence
CREATE TABLE layouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id),
    version_name VARCHAR(50),
    objects JSONB NOT NULL, -- Array of objects: { id, pos, rot, type, meta }
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Simulation Snapshots
CREATE TABLE simulation_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id),
    snapshot_data JSONB NOT NULL, -- Results of the simulation at that moment
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.2 Strategy for Persistence
- **Relational for Core**: Users, Businesses, and Meta-data use standard SQL relationships.
- **JSONB for Flexibility**: 3D Layouts and Simulation Result history use JSONB for schema-less flexibility as features expand.
- **Autosave Engine**: WebSocket or debounced REST API (5s delay) to persist 3D layout changes during "Edit Mode".

---

## 4. API & Integration

### 4.1 3D Sync Architecture
- **Event-Driven**: When an object is moved in the 3D editor, an event is dispatched.
- **Conflict Resolution**: Last-write-wins for single-user sessions; CRDT (Conflict-free Replicated Data Types) for multi-user collaboration (Enterprise phase).

### 4.2 Auth Secure Middleware
```javascript
// Example Node.js/Express Middleware
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).send('Unauthorized');
    
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).send('Invalid Token');
    }
};
```

---

## 5. UX Flows

### 5.1 Onboarding
1. **Welcome**: Landing page (✅ BUILT)
2. **Auth**: Signup Modal/Page (Design: Minimalist, glassmorphism)
3. **Builder**: Step-by-step wizard (✅ BUILT)
4. **Visualizer**: Procedural generation intro (✅ BUILT)

### 5.2 3D Editor UI
- **Primary Viewport**: Large 3D canvas.
- **Side Panel**: Drag-and-drop asset library.
- **Toolbar**: Pan, Orbit, Select, Delete.
- **Status Bar**: "Cloud Synced" indicator for persistence.

---

## 6. Phased Roadmap

| Phase | Milestone | Features |
|-------|-----------|----------|
| **MVP** | Functional Core | JWT Auth, Procedural 3D (Boxes), PG Persistence |
| **v2.2** | High Fidelity | Real 3D Models (GLTF), S3 Asset Storage |
| **v2.5** | Multi-Tenancy | Team collaboration, Investor sharing |
| **v3.0** | VR/AR | Walkthrough mode using WebXR |
