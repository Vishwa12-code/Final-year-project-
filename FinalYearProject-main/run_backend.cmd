@echo off
cd backend
echo Setting up Python virtual environment...
if not exist venv (
    call python -m venv venv
)
call .\venv\Scripts\activate
echo Installing requirements...
call pip install -r requirements.txt
echo Starting Flask API...
call python app.py
