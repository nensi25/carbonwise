# CarbonWise Rewards — Sustainability Incentive Platform 🌿

[![Deployment Status](https://img.shields.io/badge/Deployment-Live-success?style=flat-square)](https://nensi25.github.io/carbonwise/)
[![Tech Stack](https://img.shields.io/badge/Tech_Stack-HTML5_/_CSS3_/_JS-blue?style=flat-square)](https://nensi25.github.io/carbonwise/)

## 📌 Problem Statement
Global climate degradation requires immediate individual environmental accountability. While people want to live sustainably, they often lack the systemic motivation, clear impact tracking frameworks, and real-world rewards necessary to sustain long-term eco-friendly habits.

## 💡 Solution
**CarbonWise Rewards** is a professional, high-fidelity Single Page Application (SPA) designed to gamify and incentivize resource conservation. The platform enables users to securely log carbon-abating deeds, monitor their progress relative to monthly goals, benchmark community engagement metrics, consult an AI-driven sustainability workspace, and redeem points for sustainable retail commodities.

---

## 🚀 Live Project Link
Experience the fully functional dashboard live here:  
👉 **[https://nensi25.github.io/carbonwise/](https://nensi25.github.io/carbonwise/)**

---

## ✨ Key Architectural Features

### 🔐 1. Multi-User Authentication Directory
- Structured login and registration portal powered by a persistent central state repository (`AppState`).
- Sandboxed data spaces mapped using relational `localStorage` schemas to store user credentials, specific milestones, tracking data, and historical log ledgers privately.

### 📈 2. Real-Time Green Points Engine
- Automatic computations updating user wallets instantly with CarbonWise Points upon successful submission of green deeds.
- Dynamically managed metrics including **Carbon Abated (kg CO₂)**, **Capital Saved (INR)**, and **Eco Levels/Badges**.

### 📝 3. OCR & Object Vision Tracking Simulators
- Dedicated interfaces for scanning and verifying eco-actions:
  - *Recycle Clothes:* Simulates AI OCR receipt extraction data pipelines.
  - *Eco Check-In:* Image capture component representing object vision identification of reusable assets (e.g., thermal flasks).
  - *Green Transit & Eco Shop:* Logs live distance and coordinates partner brand transactions.

### 🤖 4. AI Sustainability Assistant Workspace
- Conversational fine-tuned Large Language Model (LLM) interactive interface.
- Includes shortcut dynamic prompt injections tailored for domestic resource efficiency engineering, appliance power audits, and composting strategies.

### 🏆 5. Gamified Circles & Community Leaderboard
- A live community ranking matrix contrasting peer scores to spark constructive competition.
- Automatic calculation parameters evaluating percentile performance against demographic averages.

---

## 🛠️ Technical Implementation & Stack

- **Frontend Architecture:** Clean semantic HTML5 structure bundled as a high-performance **Single Page Application (SPA)** with zero external rendering framework overhead.
- **Styling Matrix:** Advanced CSS3 implementing modular UI view structures, responsive Flexbox/Grid systems, micro-animations (`animate-fade-in`), and visual alert states.
- **Core Engine:** Vanilla JavaScript (ES6+) regulating state mutations, simulated document payload verification, automatic carousel controls, and dynamically rendered SVG progress arcs.
- **Persistence Layer:** Web Storage API (`localStorage`) handling seamless session states and audit trails across reloads.
- **Assets:** Google Font Stack (Inter Architecture) and FontAwesome Vector Glyphs (v6.4).

---

## 🔮 Future Development Roadmap
- [ ] **Production-Grade AI Integration:** Embedding real web-scrapers and neural models for image categorization and document extraction.
- [ ] **Predictive Trend Models:** Training regression metrics to predict household utility bills and carbon expenditure trajectories.
- [ ] **Blockchain Ledger Layer:** Moving the CarbonWise loyalty token point validation pipelines onto a decentralized smart contract network to minimize ledger tampering.
- [ ] **Enterprise Brand API Hooks:** Direct point-of-sale voucher integrations with physical sustainability partner outlets in India.

---

## 📦 Local Installation Guide

1. Clone the repository to your environment:
   ```bash
   git clone [https://github.com/nensi25/carbonwise.git](https://github.com/nensi25/carbonwise.git)
