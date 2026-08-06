# Run from backend/ directory
cd /d %~dp0
if exist ".venv\Scripts\python.exe" (
	.venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
) else (
	uvicorn main:app --reload --host 0.0.0.0 --port 8000
)
