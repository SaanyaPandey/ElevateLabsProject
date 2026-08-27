# 🔮 CodeCraft

An interactive, responsive online code playground for front-end developers to write, preview, and manage HTML, CSS, and JavaScript projects directly in the browser.

---

## 👤 Owner & Lead Developer
**Saanya Pandey** 

---

## 🚀 Key Features

*   **Real-time Editor Tabs:** Dedicated panels for writing HTML, CSS, and JS powered by **CodeMirror** (with VS Code styling, syntax highlighting, and auto-brackets).
*   **Instant Sandboxed Preview:** A live-rendered `<iframe>` preview of your front-end code that automatically refreshes as you type (debounced to prevent lagging).
*   **Integrated Dev Console:** A custom virtual terminal catching console outputs (`log`, `info`, `warn`, `error`), runtime exceptions, and unhandled promise rejections straight from the sandboxed preview.
*   **Project Dashboard & CRUD:** Create, save, search, and delete your projects with automatic date/timestamp tracking.
*   **Project Import/Export:** Import local HTML files directly into the workspace or download your creations as single standalone HTML files with styles and scripts bundled.
*   **Dual Data-Store Architecture:** Seamless integration with an Express/MongoDB backend API, with a built-in LocalStorage/Supabase mock fallback system if external database parameters are omitted.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | High-performance client SPA framework & build tool |
| **Styling** | Tailwind CSS | Modern utility-first responsive stylesheet |
| **Icons** | Lucide React | Clean, scalable visual iconography |
| **Code Editor** | UIW React CodeMirror | Robust in-browser text editing controls |
| **Backend Server** | Node.js, Express | RESTful backend handling persistent project storage |
| **Primary Database** | MongoDB & Mongoose | Document database for saving project templates |
| **Alternative DB** | Supabase | Postgres-based cloud backend support |
| **Local Fallback** | LocalStorage | Simulated offline database interface for offline-first development |

---

## 📂 Project Structure

```
project/
├── server/                 # Express backend API server
│   ├── models/             # Mongoose/MongoDB data models
│   │   └── Project.js      # Project schema definitions
│   ├── server.js           # Server application startup & entry routing
│   └── package.json        # Backend dependencies & commands
├── src/                    # Frontend React SPA
│   ├── components/         # Reusable UI elements (Navbar, Layout)
│   ├── lib/                # Database/API helper clients
│   │   ├── projectsApi.js  # Fetch requests pointing to MongoDB Express backend
│   │   ├── supabaseClient.js # Supabase connection client + Mock LocalStorage engine
│   │   └── defaultCode.js  # Starter templates (HTML, CSS, JS) for new editors
│   ├── pages/              # Primary route views (Home, Editor, Projects)
│   ├── App.jsx             # Main Router structure
│   └── main.jsx            # React root mount anchor
├── supabase/               # Optional database schemas
│   └── migrations/         # PostgreSQL migration tables
└── package.json            # Main workspace setup & concurrently launch scripts
```

---

## ⚙️ Setup & Installation

Follow these steps to run both the frontend and backend of Knotic locally.

### 1. Prerequisite Settings
Make sure you have [Node.js](https://nodejs.org/) (v16+ recommended) installed.

### 2. Configure Environment Variables
Inside the `project` root, set up your configuration.

Create a `.env` file in the **project root** containing:
```env
# URL where your Express server is running (omit or empty to use Supabase/Mock LocalStorage)
VITE_API_URL=http://localhost:5000
```

Create a `.env` file inside the **`project/server/`** directory containing:
```env
# Port configuration and MongoDB connection string
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/knotic?retryWrites=true&w=majority
```

### 3. Install Dependencies
Run the install command in the main project directory and inside the server directory:
```bash
# Install frontend packages
npm install

# Install backend server packages
cd server
npm install
cd ..
```

### 4. Running the Application
You can run the frontend, the backend, or both simultaneously using the scripts in `package.json`:

*   **Run Everything (Frontend + Backend concurrently):**
    ```bash
    npm run dev:all
    ```
*   **Run Frontend Only:**
    ```bash
    npm run dev
    ```
*   **Run Backend Server Only:**
    ```bash
    npm run server
    ```

Once running, open your browser and navigate to the address shown by Vite (normally `http://localhost:5173`).

---


 Built with 💜 by **Saanya Pandey**.
