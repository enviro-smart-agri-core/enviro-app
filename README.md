# Enviro App

## Quick start
```bash
npm install
cp .env.example .env   # fill in your keys
npm run dev
```
Open: http://localhost:8000

---

## Session flow
| Situation | What happens |
|---|---|
| First time ever | Splash → Onboarding → Sign In |
| Seen onboarding, not logged in | Splash → Sign In |
| Already logged in | Splash → Home (skips everything) |
| Logout | Clears token → Sign In |

---

## Environment variables (.env)
```env
VITE_API_BASE_URL=http://localhost:3000/api
```
Get free weather key: https://openweathermap.org/api

---

## Backend endpoints expected
| Method | Endpoint | Body | Returns |
|---|---|---|---|
| POST | `/auth/login` | `{email,password}` | `{token,user}` |
| POST | `/auth/register` | `{email,password}` | `{token,user}` |
| GET | `/farm/sensors` | — | `{moisture,humidity,temp}` |
| GET | `/farm/water/status` | — | `{status,soilOk}` |
| POST | `/farm/water/force` | — | `{success}` |
| POST | `/farm/soil/analyze` | `{ph,nitrogen,phosphorus}` | `{advice}` |
| GET | `/farm/crop` | — | `{day,totalDays,harvestIn}` |
| POST | `/farm/scan` | FormData(image) | `{name,confidence,disease,advice}` |

---
