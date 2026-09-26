# MoTA Scholar: SIH Project Architecture & Agents

## Overview
MoTA Scholar is a comprehensive, AI-driven, and blockchain-secured unified scholarship portal designed for the **Smart India Hackathon (SIH)**. It solves the critical bottlenecks faced by ST students and the Ministry of Tribal Affairs (MoTA).

## Core USPs (Unique Selling Propositions)
This project was built end-to-end to directly target SIH evaluation criteria (Innovation, Feasibility, Impact).

1. **Pre-Flight DBT Health Check**
   - **Problem:** Students wait months only to find out their Aadhaar isn't mapped to NPCI for Direct Benefit Transfer.
   - **Solution:** The platform pings the NPCI mapper *before* application submission. If unlinked, it guides the student to open an India Post Payments Bank (IPPB) account instantly.
   - *UI Location:* Dashboard Header Alert.

2. **Vernacular Voice-to-Form AI (Bhashini)**
   - **Problem:** Tribal students face massive digital literacy and language barriers (Santhali, Gondi, etc.).
   - **Solution:** JAGO AI integrates with Bhashini for voice-based vernacular input. Students speak to the bot in their native language, and it automatically fills out complex application forms.
   - *UI Location:* JAGO AI Chatbot Tab.

3. **e-RUPI Smart Contract Micro-Disbursements**
   - **Problem:** The reimbursement model forces poor students to take high-interest loans to pay upfront fees.
   - **Solution:** Instead of manual cash transfers, smart contracts instantly issue purpose-specific **e-RUPI Digital Vouchers**. These tokens can only be redeemed by the verified college/hostel, eliminating fraud and allowing the government to release funds upfront on Day 1.
   - *UI Location:* Wallet Tab (e-RUPI Smart Vouchers).

4. **Auto-Triage Grievance System (NLP)**
   - **Problem:** Minor errors (e.g., blurry documents) result in silent rejections.
   - **Solution:** An NLP engine intercepts rejection codes from Nodal Officers and triggers an actionable push notification (e.g., "Blurry Document - Open Camera to Fix Now") bypassing complex status menus.
   - *UI Location:* Alerts Tab.

5. **Blockchain Immutable Credential Vault**
   - **Problem:** Redundant document verification delays sanctions by 8-10 months.
   - **Solution:** DigiLocker nodes verify documents once, and cryptographically secure them on the ledger. Future applications are instant.
   - *UI Location:* Wallet Tab (DigiLocker Node).

## Tech Stack
- **Frontend:** React (Vite), lucide-react, react-router-dom.
- **Styling:** Custom CSS (Mobile-First, Glassmorphism, Native App Feel).
- **Backend Architecture:** Resilient mock-fallback architecture (capable of running 100% serverless on Vercel without a database for perfect demo reliability), backed by a Python FastAPI + SQLite structure for local development.

## Deployment
Deployed via Vercel for high-availability mobile demonstration.
