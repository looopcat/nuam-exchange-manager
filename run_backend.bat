@echo off
cd backend
..\.venv\Scripts\python.exe -m uvicorn app:app --reload --port 8000
