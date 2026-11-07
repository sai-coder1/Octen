# Octen – AI Research Assistant

An AI-powered research assistant designed to help users discover information, explore relevant search results, and stay updated with daily AI and technology developments.

## Features

- **AI-Powered Search:** Search for information and explore relevant results.
- **Daily Briefings:** Get curated updates on AI, technology, and job-related developments.
- **News Discovery:** Explore news and information through organized result cards.
- **Clean User Interface:** A simple, user-friendly interface for accessing research and daily updates.

## Tech Stack

**Frontend**
- HTML
- CSS
- JavaScript

**Backend**
- Python
- FastAPI
- Octen SDK

**Other Tools**
- Python-dotenv
- REST API

## Project Structure

```text
research-assistant/
│
├── backend/
│   ├── cache/
│   ├── services/
│   ├── logging_config.py
│   └── main.py
│
├── frontend/
│   ├── app.js
│   ├── index.html
│   └── style.css
│
├── .env.example
├── .gitignore
├── requirements.txt
├── test_news.py
└── test_octen.py
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/sai-coder1/Octen.git
cd Octen
```

### 2. Create a Virtual Environment

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file using `.env.example` as your reference and add the required API credentials.

Never commit your actual `.env` file or expose API keys.

### 5. Run the Backend

```bash
python -m uvicorn backend.main:app --reload
```

### 6. Run the Frontend

Open `frontend/index.html` using a local development server configured for port `5500`.

## Testing

Run the test files using:

```bash
python test_news.py
python test_octen.py
```

## Future Improvements

- Expand research and discovery capabilities.
- Improve search result relevance.
- Introduce additional AI-powered research workflows.

---

**Built with curiosity and a passion for AI-powered research.**
