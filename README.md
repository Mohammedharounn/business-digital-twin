# Business Digital Twin - Master Project Overview

Welcome to the **Business Digital Twin** platform. This document serves as the high-level entry point explaining the entire project scope, architecture, how to run the application, and where to find the detailed specifications for each subsystem.

## 1. What is this project?
**Business Digital Twin** is an AI-first smart simulation platform designed to enable aspiring entrepreneurs to build a complete digital replica of their future business. It bridges the gap between static business plans and real-world results using high-fidelity 3D modeling and AI-driven analysis.

**Core Value Propositions:**
- **Risk Reduction**: Virtual testing of business models (price, rent, staffing, marketing).
- **Astra Intelligence**: Real-time AI advice via semantic reasoning.
- **Micro-Simulations**: Scenario branching to test worst-case vs. best-case.
- **Investor Readiness**: Auto-generated high-impact financial reports and pitch narratives.

---

## 2. Technology Stack & Architecture

### **Frontend**
- **Framework:** React 18 & Vite
- **3D Visualization:** Three.js, `@react-three/fiber`, `@react-three/drei`
- **Styling & UI:** Tailwind CSS, Framer Motion, Lucide React
- **State Management:** Zustand, TanStack React Query

### **Backend**
- **Server Environment:** Node.js with Express.js
- **Real-Time Engine:** Socket.io (for the physical pulse simulation pipeline)
- **Database:** MongoDB (with Mongoose)
- **AI Core:** LangChain, OpenAI API (GPT-4o fallback models)

### **System Architecture Flow**
The system uses a Layered Microservices architecture. The React frontend interacts with the Express API gateway to authenticate users and persist their configurations to MongoDB. Simultaneously, the backend routes requests to the AI Service for deep intelligence modeling, and uses a Socket.io stream to pump real-time simulation updates to the 3D dashboard.

---

## 3. Project Directory Structure

```text
/ (Project Root)
├── /src                    # React Frontend Code (Pages, Components, 3DEditor, AIChat)
├── /server                 # Node.js Express Backend Code & API Routes
├── /public                 # Static assets like images and models
├── /dist                   # (Generated) Production build of the frontend
├── package.json            # Project dependencies & npm scripts
├── vite.config.js          # Vite build configuration
└── .env                    # System environment variables (Keys, Secrets)
```

---

## 4. How to Run the Project Locally

The project is structured to run the Frontend and Backend concurrently using `concurrently` from the root via `npm`.

1. **Install Dependencies:**
   Ensure you have Node.js installed, then run:
   ```bash
   npm install
   ```

2. **Set up Environment Variables:**
   Make sure you have an `.env` file in the root containing your database URIs, JWT Secrets, and OpenAI API Keys.

3. **Start the Application in Development Mode:**
   To run both the server and the frontend simultaneously:
   ```bash
   npm run dev:all
   ```
   *Note: If you want to run them separately, you can use `npm run dev` for the frontend and `npm run server` for the backend.*

---

## 5. Detailed Documentation Index

The project has been scaled meticulously with dedicated documentation for every aspect of the architecture. Below is a guide to everything documented in this repository:

- 📄 **[`MASTER_DOCUMENTATION.md`](./MASTER_DOCUMENTATION.md)**
  *The core vision, executive summary, product pillars, and long-term scaling strategy for the project.*

- 📄 **[`DOCUMENTATION.md`](./DOCUMENTATION.md)**
  *Massive, comprehensive technical documentation of all logic layers.*

- 📄 **[`SYSTEM_DESIGN_SPEC.md`](./SYSTEM_DESIGN_SPEC.md)**
  *Detailed API designs, specific 3D engine mathematics, deployment guidelines, and scalability limits.*

- 📄 **[`PROJECT_COMPLETE_GUIDE.md`](./PROJECT_COMPLETE_GUIDE.md)**
  *A full completion checklist covering what was built, testing standards, and implementation achievements.*

- 📄 **[`ARCHITECTURE.md`](./ARCHITECTURE.md)**
  *High-level system interaction patterns between the frontend, API gateway, and database.*

- 📄 **[`AUTH_SPEC.md`](./AUTH_SPEC.md) & [`3D_AUTH_PERSISTENCE_DOC.md`](./3D_AUTH_PERSISTENCE_DOC.md)**
  *Full technical run-down of the JWT security scheme, session handling, and how state connects to persistent databases across reloads.*

- 📄 **[`BACKEND_DATABASE_DESIGN.md`](./BACKEND_DATABASE_DESIGN.md)**
  *Full entity-relationship details for MongoDB (Users, Businesses, Logs).*

- 📄 **[`ADVANCED_FEATURES.md`](./ADVANCED_FEATURES.md)**
  *Explanations of extreme deep-tech features like dynamic time progression and dynamic 3D rendering.*

- 📄 **[`POSTMAN_GUIDE.md`](./POSTMAN_GUIDE.md) & Postman Collection**
  *Guide to using the included `.json` collection file to test API health, authentication, and data retrieval endpoints.*

- 📄 **[`RESEARCH_METHODOLOGY.md`](./RESEARCH_METHODOLOGY.md) & `PROJECT_PRESENTATION.md`**
  *Academic and professional backing resources for validation and presentation.*
