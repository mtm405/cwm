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
FLASK_ENV=development
```

3. Add your Firebase service account key as `serviceAccountKey.json`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Run locally:
```bash
# Method 1: Command line
python app.py

# Method 2: VS Code Tasks (recommended)
# Press Ctrl+Shift+B or run the "Deploy Full Stack" task
# See DEPLOYMENT_GUIDE.md for more details
```

## VS Code Tasks and Development

This project includes VS Code tasks to make development and deployment easier:

1. **Start Flask App** (Default Build Task)
   - Press `Ctrl+Shift+B` to start the Flask app
   - Runs in production mode with real Firebase data

2. **Start Cloudflare Tunnel** (Default Test Task)
   - Open Command Palette (`Ctrl+Shift+P`) and select "Run Test Task"
   - Exposes your local server to the internet via Cloudflare

3. **Deploy Full Stack**
   - Runs both tasks in parallel
   - Available in the VS Code tasks menu

### Recommended VS Code Extensions

For an improved development experience, install the recommended extensions:
- Task Explorer: For a visual task interface with one-click run buttons
- Task Manager: For status bar task buttons

See [RECOMMENDED_EXTENSIONS.md](./RECOMMENDED_EXTENSIONS.md) for more details.

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
│   ├── css/              # Stylesheets
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

## Development vs Production

The platform can be run in either development or production mode. To switch between modes, set `FLASK_ENV=development` or `FLASK_ENV=production` in your `.env` file or as an environment variable.

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
