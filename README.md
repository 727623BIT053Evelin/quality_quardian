# Quality Guardian 🛡️

Quality Guardian is a comprehensive data quality management platform designed for B2B lead generation and CRM data cleaning. It combines a modern MERN stack frontend with a powerful Python-based ML microservice to identify, analyze, and remediate data inconsistencies in real-time.

## 🏗️ System Architecture

```mermaid
graph TD
    User((User)) -->|Uploads CSV/XLSX| React[React Frontend]
    React -->|API Calls / JWT| Node[Node.js / Express Backend]
    Node -->|Metadata / Auth| MongoDB[(MongoDB)]
    Node -->|File Path| Flask[Flask ML Service]
    Flask -->|Cleaning / Analysis| Pandas[[Pandas Pipeline]]
    Pandas -->|Cleaned JSON + CSV| Flask
    Flask -->|Processing Results| Node
    Node -->|Report Data| React
    React -->|Download Cleaned Data| Node
```

## 📁 Project Structure

- **`client/`**: React + Vite + Tailwind CSS dashboard. Features high-performance visualizations and real-time report auditing.
- **`server/`**: Node.js + Express backend. Handles authentication, file management, and orchestration between the UI and ML service.
- **`ml/`**: Python + Flask microservice. The core logic engine that performs data validation, normalization, and imputation. Also hosts the **Sentinel AI Chat Assistant**.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Python (3.9+)
- MongoDB (Running locally or via Atlas)

### Installation

1. **Start the ML Service**:
   ```bash
   cd ml
   pip install -r requirements.txt
   python app.py
   ```

2. **Start the Express Server**:
   ```bash
   cd server
   npm install
   npm run dev
   ```

3. **Start the Frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

---

*Refer to individual component READMEs for deep-dive logic and implementation details.*
