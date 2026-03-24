# Game Marketplace — Quick Start Guide

## Prerequisites

- [Node.js](https://nodejs.org/) v18+ and npm
- [MySQL](https://dev.mysql.com/downloads/) v8+

Verify: `node --version` and `npm --version`

---

## Setup (3 Steps)

### 1. Set Up Database

Open MySQL and run:
```sql
source C:/Users/ASUS/OneDrive/Desktop/not finali/370/database.sql
```

### 2. Update Database Password

Edit `server.js` line 26:
```js
password: 'your_mysql_password',  // or '' if no password
```

### 3. Install & Run

```bash
cd "C:/Users/ASUS/OneDrive/Desktop/not finali/370"
npm install
node server.js
```

Open: **http://localhost:3000**

---

## Development Mode (Hot Reload)

Run **two terminals**:

**Terminal 1 — Backend:**
```bash
cd "C:/Users/ASUS/OneDrive/Desktop/not finali/370"
node server.js
```

**Terminal 2 — Frontend:**
```bash
cd "C:/Users/ASUS/OneDrive/Desktop/not finali/370/client"
npm install
npm run dev
```

Open: **http://localhost:5173**

---

## Rebuild Frontend

When you change React code:
```bash
cd "C:/Users/ASUS/OneDrive/Desktop/not finali/370/client"
npm run build
```

Then restart the backend.

---

## Quick Reference

| Task | Command |
|------|---------|
| Install backend packages | `npm install` | `370/` |
| Start server (production) | `node server.js` | `370/` |
| Install frontend packages | `npm install` | `370/client/` |
| Start React dev server | `npm run dev` | `370/client/` |
| Build React for production | `npm run build` | `370/client/` |

---

## URLs

| Page | URL |
|------|-----|
| Home | http://localhost:3000/ |
| User Login | http://localhost:3000/login |
| User Register | http://localhost:3000/register |
| Admin Login | http://localhost:3000/admin-login |
| Admin Register | http://localhost:3000/admin-register |
| User Dashboard | http://localhost:3000/user-dashboard |
| Admin Dashboard | http://localhost:3000/admin-dashboard |

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `npm: command not found` | Wrong terminal or Node not installed | Open VS Code terminal (`Ctrl+``) or reinstall Node.js |
| `Exit Code: 127` | Running npm in wrong folder | Make sure you `cd` into the correct folder first |
| `Database connection failed` | MySQL not running or wrong password | Start MySQL and check password in `server.js` line 26 |
| Blank page at localhost:3000 | React not built yet | Run `npm run build` in `370/client/` |
