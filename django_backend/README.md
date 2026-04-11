# Intellichat Django Backend

We've migrated the intellichat REST API from Flask to Django!

## Setup

First, make sure you activate the virtual environment and install the required dependencies:

```bash
cd c:\Users\HONOR\intellichat
.\venv\Scripts\activate
pip install -r requirements.txt  # If generated, else use the command above or check pipenv/poetry
```

*(Note: dependencies were already installed during the setup process).*

## Running the Backend

You can start the Django development server on port 5000:

```bash
cd c:\Users\HONOR\intellichat\django_backend
.\venv\Scripts\activate
python manage.py runserver 5000
```

The frontend will contact this server at `http://localhost:5000/api/chat` exactly as it did for Flask!

## Dealing with AI Models
If you want the AI responses to work correctly, you must supply a valid `HF_TOKEN`.
Currently, the system is resolving a `.env` in `C:\Users\HONOR\intellichat\machine\.env` but this folder seems deleted. Either recreate `machine\.env` and put `HF_TOKEN=your_token` in it, or supply `HF_TOKEN` in the environment before starting the server. If it's missing, you'll see a warning on startup and AI generation will fail, but the chat history endpoint will continue to work!
