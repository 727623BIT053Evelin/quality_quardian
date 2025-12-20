# Frontend Dashboard 🎨

Quality Guardian's frontend is a high-performance React application designed for clarity, speed, and actionable insights. It provides a visual layer over complex data quality audits.

## 核心 (Core) Features
- **Visual Analytics**: Interactive charts powered by `Recharts` to visualize error distribution and attribute completeness.
- **Data Preview Engine**: Conditional row/cell styling that highlights invalid and missing data in real-time.
- **Responsive Navigation**: Sidebar-driven layout for switching between Reports, Datasets, and Settings.
- **Global Search**: Instantly filter datasets and reports across the entire workspace.
- **Animated Transitions**: Smooth UI state changes using `Framer Motion`.
- **Sentinel AI Integration**: Use the companion Streamlit assistant for conversational data auditing.

## 🛠️ Tech Stack
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **State/Routing**: React Router DOM, React Hooks

## 📂 Key Pages (`/pages`)

### 1. Landing Page
Modern hero section and feature overview with a "vibrant dark mode" aesthetic.

### 2. Dashboard (`Reports.jsx`)
A clean list view of all processed datasets with status indicators (Processing, Completed, Failed).

### 3. Dataset Report (`DatasetReport.jsx`) 📄
The most complex part of the UI. Logic includes:
- **Score Calculation**: Computes Overall Health, Missing Rate, and Duplicate rates for the summary cards.
- **Dynamic Charting**:
    - **PieChart**: Shows the ratio of Missing vs. Duplicate vs. Formatting issues.
    - **BarChart**: Ranks attributes by missing value count.
- **The Data View**:
    - **Highlighting**: Uses helper functions (`isMissing`, `isInvalidFormat`) to apply red/green backgrounds to table cells.
    - **Tabs**: Allows toggling between "Original" (Raw) and "Cleaned" (Processed) data views.
- **CSV Download**: Direct integration with the server's download endpoint.

## 🎨 Design Principles
- **Aesthetics**: Uses a specialized HSL color palette (Slate, Indigo, Rose) for a premium "Glassmorphism" look.
- **Feedback**: Immediate loaders and status badges ensure the user knows exactly where their data is in the pipeline.
