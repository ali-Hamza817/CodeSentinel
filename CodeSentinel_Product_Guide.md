# CodeSentinel: Deep Intelligence Security Auditing Platform

CodeSentinel is a state-of-the-art AI-driven security auditing platform designed for deep semantic analysis and sandboxed dynamic execution. It leverages local Large Language Models (LLMs) and containerized environments to provide a "Privacy-First" security review process.

---

## 🏗️ System Architecture
CodeSentinel follows a decoupled Multi-Process Architecture, ensuring stability and security during the auditing process.

### 1. Presentation Layer (Renderer)
- **Tech Stack**: React.js, TailwindCSS, Framer Motion.
- **Role**: A high-fidelity "Lumina-White" interface that manages state and visualizes telemetry data using Recharts.

### 2. Secure Bridge Layer (Preload)
- **Role**: Provides a secure context-isolated bridge using Electron Inter-Process Communication (IPC). It exposes only necessary system APIs to the frontend.

### 3. Orchestration Layer (Main Process)
- **Tech Stack**: Node.js, TypeScript.
- **Role**: The brain of the application. It handles process lifecycle, SQLite database management, and asynchronous orchestration of external engines.

### 4. Semantic Intelligence Engine (Ollama/LLM)
- **Model**: Llama 3.2 (3B Parameters).
- **Communication**: RESTful API calls to a localized Ollama instance.
- **Role**: Performs "Deep Reasoning" on source code snippets to identify logic flaws and architectural vulnerabilities.

### 5. Sandboxed Runtime Layer (Docker)
- **Engine**: Docker Desktop / Engine.
- **Role**: Creates ephemeral containers for building and running repositories. This layer captures hardware metrics (CPU/RAM) and startup latency in a safe environment.

---

## 🔄 User Interaction & Data Flow
The following sequence describes the end-to-end data orchestration during a typical security audit:

1. **Project Ingestion**: The user inputs a repository URL. The **Orchestration Layer** initiates a Git clone into a strictly managed local workspace.
2. **Metadata Extraction**: CodeSentinel identifies the project type (e.g., C#, Python) and maps out the source file tree.
3. **Static Audit Pass**: The **Static Analysis Engine** performs rapid pattern-matching to find hardcoded secrets (API keys) and common CWEs (SQLi, XSS).
4. **Semantic reasoning**: The user selects a file for "AI Architect Review". The **Orchestration Layer** streams the code to the **Intelligence Engine**, which returns structured security measures and logic-level findings.
5. **Sandboxed Build**: CodeSentinel generates a custom Dockerfile and initiates a build. The **Runtime Layer** captures the **Image Build Latency**.
6. **Execution Telemetry**: The application is booted inside a container. CodeSentinel measures **Startup Time** and monitors live resource consumption.
7. **Synthesis & Persistence**: All findings from all layers are aggregated and saved to the **SQLite Database**. The **Risk Scoring** algorithm translates these into a final security grade displayed on the **Dashboard**.

---

## 🏗️ Core Infrastructure
- **AI Intelligence**: Powered by **Llama 3.2 (3B)** running locally via Docker. This ensures code never leaves the host machine.
- **Dynamic Sandboxing**: Native **Docker Engine** integration for building and running untrusted repositories in isolated environments.
- **Persistent Engine**: **SQLite** database backend for high-fidelity persistence of audit states, metrics, and findings.
- **Frontend**: A premium "Lumina-White" high-fidelity interface built with React, Vite, and TailwindCSS.

---

## 🖥️ Screen-by-Screen Breakdown

### 1. Dashboard (The Nerve Center)
- **Feature**: Real-time project health HUD.
- **Implemented**: Aggregated vulnerability counts, average code complexity, build status, and a "Deep Audit" trigger.
- **Use Case**: Provides a high-level executive summary of the repository's security posture at a glance.

### 2. Workspace / Repository
- **Feature**: Repository management and ingestion.
- **Implemented**: Automated Git cloning from GitHub URLs or local path selection.
- **Use Case**: Onboarding new projects into the CodeSentinel ecosystem for analysis.

### 3. AI Architect Review
- **Feature**: Deep semantic reasoning.
- **Implemented**: File-by-file Llama 3.2 auditing. It generates specific code-level findings and architectural "Security Measures".
- **Use Case**: Critical for finding logic flaws like "Insecure Speech Synthesizer usage" that standard pattern-scanners miss.

### 4. Static Analysis
- **Feature**: Pattern-based and Entropy scanning.
- **Implemented**: Multi-language support (C#, TS, JS, PY, etc.). Uses regex patterns to find hardcoded secrets, SQLi, and XSS.
- **Use Case**: Rapid discovery of common vulnerabilities (CVEs) and secret leakage.

### 5. Dynamic Analysis
- **Feature**: Isolated runtime auditing.
- **Implemented**: Real-time Docker image building and container management with hardware telemetry (CPU/RAM).
- **Use Case**: Running the application in a sandbox to observe runtime behavior without risking the host machine.

### 6. Container Insights
- **Feature**: Runtime environment introspection.
- **Implemented**: Live monitoring of container resource usage and uptime.
- **Use Case**: Identifying resource exhaustion vulnerabilities or potential denial-of-service (DoS) patterns.

### 7. Complexity Dashboard
- **Feature**: Code maintainability metrics.
- **Implemented**: Analysis of logic depth and total file volume.
- **Use Case**: Correlating logic complexity with security risks; complex code is often where bugs hide.

### 8. Risk Scoring
- **Feature**: Quantitative security grading.
- **Implemented**: Mathematical weighting of Critical vs. Low findings to produce a project grade.
- **Use Case**: Prioritizing which repositories in a large organization need urgent remediation.

### 9. Build CI
- **Feature**: "Classic" build performance monitoring.
- **Implemented**: Measuring **Image Build Latency** and **Build Status** history.
- **Use Case**: Verifying that security hardening hasn't broken the application's ability to compile and build.

### 10. Startup Check
- **Feature**: Deployment readiness validation.
- **Implemented**: Measuring **Container Startup Time** in milliseconds.
- **Use Case**: Ensuring the application can boot rapidly in cloud environments without "Cold Start" failures.

### 11. Reports
- **Feature**: Audit export and history.
- **Implemented**: Listing and viewing historical audit results.
- **Use Case**: Generating documentation for compliance reviews (SOC2/ISO27001).

---

## 🚀 Key Value Propositions
1.  **Privacy Zero**: No code is sent to OpenAI or any cloud provider. Everything remains local.
2.  **Hybrid Auditing**: Combines the speed of **Static Analysis** with the intelligence of **AI Reasoning**.
3.  **Hardware Awareness**: Captures real-world performance metrics (Build time, startup latency) during the security audit.
4.  **Zero-Loss Persistence**: All findings are safely stored in a local encrypted database, allowing for long-term audit tracking.
