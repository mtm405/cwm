# Code with Morais - Gamified Python Learning Platform

A highly engaging, gamified online learning platform for teenagers to master Python and prepare for the IT Specialist certification.

## Features

- 🎮 **Gamified Learning**: Earn XP, PyCoins, and climb the leaderboard
- 💻 **Interactive Coding**: In-browser Python editor with instant feedback
- 📚 **Structured Lessons**: Step-by-step Python curriculum
- 🏆 **Daily Challenges**: New coding challenges every day
- 📊 **Progress Tracking**: Visual overview of learning progress
- 🎨 **Multiple Themes**: Dark, Light, and Glass themes
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Backend**: Flask (Python)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Google Cloud Platform (App Engine)

## Project Structure

```
/
├── admin/            # Admin tools and utilities
├── app.py            # Main application entry point
├── archive/          # Archived/legacy code
├── config/           # Application configuration
├── config.py         # Configuration settings (to be migrated to config/)
├── deployment/       # Deployment configurations (Docker, Cloud, Cloudflare)
├── docs/             # Documentation
├── environments/     # Environment configuration files
├── firebase_data/    # Firebase data models and tools
├── logs/             # Application logs
├── models/           # Data models
├── routes/           # API and view routes
├── scripts/          # Utility scripts
├── secure/           # Sensitive configuration (not in version control)
├── services/         # Service layer
├── static/           # Static assets (CSS, JS, images)
├── templates/        # HTML templates
├── tests/            # Test suite
└── utils/            # Utility functions
```
- **Containerization**: Docker
- **Code Editor**: ACE Editor
- **Frontend**: HTML, CSS, JavaScript

## Development Setup

### Prerequisites

- Python 3.11+
- Docker and Docker Compose
- Firebase project with service account key
- Google Cloud SDK (for deployment)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/code-with-morais.git
cd code-with-morais
```

2. Create a `.env` file:
```bash
SECRET_KEY=your-secret-key-here
DEV_MODE=True
```

3. Add your Firebase service account key as `serviceAccountKey.json`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Run locally:
```bash
python app.py
```

Or use Docker:
```bash
docker-compose up
```

### Running Tests

```bash
pytest tests/
```

## Deployment

### Google Cloud App Engine

1. Install Google Cloud SDK
2. Configure your project:
```bash
gcloud config set project your-project-id
```

3. Deploy:
```bash
gcloud app deploy
```

### Docker Deployment

Build and run the Docker container:
```bash
docker build -t code-with-morais .
docker run -p 8080:8080 code-with-morais
```

## Project Structure

```
code-with-morais/
├── app.py                # Main Flask application
├── config.py             # Configuration settings and environment variables
├── requirements.txt      # Python dependencies
├── Dockerfile            # Docker configuration
├── app.yaml              # App Engine configuration
├── models/               # Database models and data access
│   ├── __init__.py
│   ├── user.py           # User-related models and operations
│   ├── lesson.py         # Lesson models and operations
│   ├── quiz.py           # Quiz models and operations
│   ├── challenge.py      # Daily challenge functionality
│   └── activity.py       # User activity tracking
├── routes/               # Route handlers
│   ├── __init__.py
│   ├── main_routes.py    # Core routes (landing page, dashboard)
│   └── lesson_routes.py  # Lesson-related routes
├── services/             # Business logic services
│   ├── __init__.py
│   ├── firebase_service.py # Firebase interactions
│   └── code_execution.py   # Python code execution service
├── static/               # Static assets
│   ├── css/              # Stylesheets (see static/css/CSS_ARCHITECTURE_MAPPING.md)
│   └── js/               # JavaScript files
├── templates/            # HTML templates
├── utils/                # Utility functions
│   └── __init__.py
└── tests/                # Unit and integration tests
    └── __init__.py
```
├── docker-compose.yml # Docker Compose config
├── app.yaml           # Google App Engine config
├── .env               # Environment variables (not in repo)
├── serviceAccountKey.json # Firebase credentials (not in repo)
├── static/
│   ├── css/
│   │   └── style.css  # Main stylesheet
│   └── js/
│       └── main.js    # Main JavaScript file
├── templates/
│   ├── base.html      # Base template
│   ├── index.html     # Landing page
│   ├── dashboard.html # User dashboard
│   ├── lessons.html   # Lessons overview
│   └── lesson.html    # Individual lesson
└── tests/
    └── test_app.py    # Unit tests
```

## Development Mode

The platform runs in development mode by default, bypassing authentication for rapid testing. To disable dev mode, set `DEV_MODE=False` in your `.env` file.

## Development Guidelines

### CSS Development
- **📖 Read First**: [`static/css/CSS_ARCHITECTURE_MAPPING.md`](static/css/CSS_ARCHITECTURE_MAPPING.md) - Complete CSS guide
- **🎯 Component Structure**: CSS is organized by components in `static/css/components/`
- **⚡ Entry Point**: All styles imported through `static/css/main.css`
- **🚨 Before Changes**: Check which file owns the class you want to modify

### Documentation
- **📚 Complete docs**: [`docs/README.md`](docs/README.md) - Organized documentation index
- **🏗️ Architecture**: See `docs/architecture/` for technical details
- **🔧 Maintenance**: See `docs/maintenance/` for cleanup guides

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built for teenagers learning Python
- Designed to prepare students for IT Specialist certification
- Inspired by gamified learning principles
