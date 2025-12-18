# Server Backend 🚀

The Quality Guardian server is a Node.js / Express application that handles user authentication, file lifecycle management, and acts as the orchestrator for the ML processing service.

## 核心 (Core) Features
- **User Authentication**: Secure Login/Signup using JWT and bcrypt.
- **File Orchestration**: Uploads are accepted via `multer`, stored locally, and then sent to the Flask service for processing.
- **Data Persistence**: MongoDB stores dataset metadata, quality reports, and data previews.
- **Download Management**: Serves processed files (Original or Cleaned) back to the user with enforced file naming conventions.

## 🛠️ Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Networking**: Axios (for microservice communication)

## 📂 Key Files & Models

### Models (`/models`)
- **`User.js`**: Stores email, password (hashed), and account metadata.
- **`Dataset.js`**:
    - `user`: Reference to the owner.
    - `filename`: Original name of the file.
    - `originalPath`: Path to the raw uploaded file.
    - `cleanedPath`: Path to the file processed by the ML service.
    - `report`: JSON object containing missing counts, duplicates, and quality scores.
    - `preview_original` / `preview_cleaned`: Sample records for dashboard visualization.

### Routes (`/routes`)
- **`authRoutes.js`**: Handles account registration and token distribution.
- **`uploadRoutes.js`**:
    - `POST /api/upload`: Receives file, creates DB entry, pings Flask, and updates entry on success.
    - `GET /api/datasets/:id/download`: Streams files to the client (Forces `.csv` for cleaned data).

### Middleware (`/middleware`)
- **`authMiddleware.js`**: Validates JWT tokens to protect private routes like uploads and reports.

## 🔄 The Upload Lifecycle
1. User sends a file (multipart/form-data).
2. Multer saves it to `/uploads`.
3. Server creates a `status: 'processing'` entry in MongoDB.
4. Server POSTs the file path to `http://localhost:5000/process`.
5. Upon SUCCESS: Entry is updated with the report JSON and `status: 'completed'`.
6. Upon FAILURE: Entry is updated with `status: 'failed'` and an error message.
