# Open AF (Open Android Forensics)

Open AF is an open-source Android forensic analysis platform aimed at providing a web-based GUI for forensic investigation and educational use. It extracts device data from virtual or physical Android devices over network or USB using ADB (Android Debug Bridge) and stores project/case metadata in MongoDB.

## Features & Architecture

- **Plugin Architecture**: Modular design allowing plugin-based extensions for extracting and analyzing different device artifacts.
- **FastAPI Backend**: Asynchronous REST API providing project management, device interaction, and plugin execution.
- **Per-Project Isolation**: Dynamic MongoDB database isolation per forensic project (`OpenAF_<project_id>`).
- **Obsidian Documentation**: Comprehensive codebase notes and internal linking inside the `docs/` directory.

---

## Prerequisites

- [Docker & Docker Compose](https://www.docker.com/) (for running MongoDB)
- [ADB (Android Debug Bridge)](https://developer.android.com/tools/adb) installed and added to PATH
- [Python 3.14+](https://www.python.org/) or [uv](https://docs.astral.sh/uv/) package manager

---

## Getting Started

### 1. Start the Database (MongoDB)

Run MongoDB via Docker Compose in the root directory:

```bash
docker compose up -d
```

### 2. Start the ADB Server

Ensure your local ADB daemon is running and listening on port 5037:

```bash
adb start-server
```

*(Optional)* Verify connected devices or emulators (e.g., Genymotion / Android Studio Emulator):

```bash
adb devices
```

### 3. Run the Backend

Navigate to the `backend` directory and start the server using `uv`:

```bash
cd backend

# Install dependencies
uv sync

# Run the FastAPI server in development mode
fastapi dev main.py
```

*Alternatively, using standard Python venv & uvicorn:*

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r pyproject.toml
uvicorn main:app --reload
```

---

## API Documentation & Health Check

Once the server is running:

- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)
- **Interactive OpenAPI Specs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Codebase Documentation

Detailed module documentation and architecture guides are maintained as an Obsidian Vault inside the `docs/` folder:
- Entry point: [`docs/Codebase Overview.md`](docs/Codebase%20Overview.md)