# Frontend-Backend API Configuration

This app calls a Flask backend that exposes:
- /members/
- /expenses/
- /balances/
- /balances/settlements

How the frontend picks the API base URL (src/api.js getBaseUrl):
1) Uses REACT_APP_API_BASE if set (recommended). Example values:
   - https://your-domain:3001
   - https://your-domain:3001/api (if your backend is mounted under /api)
2) If the dev server is running on port 3000 and CRA proxy is configured in package.json,
   it uses a relative base of /api (so requests go to /api/members/, etc.).
3) Falls back to http://localhost:3001.

Environment variable to set:
- REACT_APP_API_BASE

Examples:
- For local dev with CRA proxy (package.json has "proxy": "http://localhost:3001"):
  Do NOT set REACT_APP_API_BASE. The app will use /api and be proxied to the backend.
- For preview environments where the backend is at https://...:3001 without an /api prefix:
  Set REACT_APP_API_BASE=https://<host>:3001

CORS:
- When using different origins, ensure the backend allows CORS from the frontend origin or use the CRA proxy in development.

Troubleshooting 404:
- Verify the backend actually serves /members/, /expenses/, /balances/.
- Confirm REACT_APP_API_BASE points to the correct base (include /api if your backend routes are under that prefix).
