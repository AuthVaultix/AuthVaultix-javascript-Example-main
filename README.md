
<div align="center">

<img src="https://img.shields.io/badge/AuthVaultix-JS%20SDK-6C63FF?style=for-the-badge&logo=javascript&logoColor=white" alt="AuthVaultix JS SDK"/>

# 🔐 AuthVaultix — JavaScript SDK

**Official JavaScript/Node.js client library for the [AuthVaultix](https://authvaultix.com) authentication platform.**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![npm](https://img.shields.io/badge/npm-axios-CB3837?style=flat-square&logo=npm&logoColor=white)](https://www.npmjs.com/package/axios)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows-0078D6?style=flat-square&logo=windows&logoColor=white)](https://www.microsoft.com/windows)
[![ESM](https://img.shields.io/badge/Module-ESM-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://nodejs.org/api/esm.html)

> Integrate license-based user authentication into your Node.js apps in minutes — with HWID binding, subscription tracking, and a simple interactive CLI.

</div>

---

## ✨ Features

- 🔑 **License Key Authentication** — Authenticate users directly with a license key
- 👤 **Username / Password Login** — Traditional credential-based login
- 📝 **User Registration** — Register new users with a license key
- 🖥️ **HWID Binding** — Hardware ID (Windows SID) is auto-captured and bound to sessions
- 📦 **Subscription Tracking** — View active subscriptions, expiry dates, and time remaining
- ⚡ **Async/Await Support** — Fully promise-based, modern JavaScript (ES Modules)
- 🖥️ **Interactive CLI** — Ready-to-use terminal menu for quick testing

---

## 📁 Project Structure

```
authvaultix-js/
├── src/
│   ├── authvaultix.js   # Core AuthVaultix SDK class
│   └── main.js          # Interactive CLI example
├── package.json
├── run.bat              # Quick launcher for Windows
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- An account on [AuthVaultix](https://authvaultix.com)
- Your **App Name**, **Owner ID**, **Secret**, and **Version** from your dashboard

### 1. Clone the Repository

```bash
git clone https://github.com/AuthVaultix-javascript-Example-main.git
cd authvaultix-js
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Your App

Open `src/main.js` and replace the config values with your own from the AuthVaultix dashboard:

```js
const AuthVaultixApp = new AuthVaultix(
  "YourAppName",       // App name from dashboard
  "your_ownerid",      // Owner ID from dashboard
  "your_secret",       // Secret key from dashboard
  "1.0"                // App version
);
```

> ⚠️ **Never commit your real `secret` or `ownerid` to a public repository.** Use environment variables for production use.

### 4. Run

**Option A — npm:**
```bash
npm start
```

**Option B — Windows Batch File:**
```
run.bat
```

---

## 🖥️ CLI Usage

When you run the app, you'll see an interactive menu:

```
Connecting...
Initialized Successfully!

[1] Login
[2] Register
[3] License Login
[4] Exit
Choose option:
```

### Option 1 — Login
```
Username: john
Password: ••••••••
Logged in!

=== User Data ===
Username: john
IP: 192.168.x.x
HWID: S-1-5-21-XXXXXXXXX
Created: 5/1/2026, 10:00:00 AM
Last Login: 5/4/2026, 5:00:00 PM

Subscriptions:
[1] Premium | Expiry: 6/4/2026, 5:00:00 PM | Timeleft: 30d 0h 0m
```

### Option 2 — Register
```
Username: newuser
Password: ••••••••
License: XXXX-XXXX-XXXX-XXXX
Registered Successfully!
```

### Option 3 — License Login
```
License: XXXX-XXXX-XXXX-XXXX
License Login Successful!
```

---

## 🧩 SDK API Reference

### Initialization

#### `new AuthVaultix(appName, ownerId, secret, version)`
Creates a new AuthVaultix client instance.

| Parameter | Type | Description |
|-----------|------|-------------|
| `appName` | `string` | Your app name on AuthVaultix |
| `ownerId` | `string` | Your owner ID |
| `secret`  | `string` | Your app secret |
| `version` | `string` | Your app version string |

---

#### `await authvaultix.Init()`
Initializes a session with the AuthVaultix API. **Must be called before any other method.**

```js
await AuthVaultixApp.Init();
```

---

### Authentication Methods

#### `await authvaultix.Login(username, password)`
Authenticates a user with username and password. HWID is automatically captured and sent.

#### `await authvaultix.Register(username, password, licenseKey, email = "")`
Registers a new user account using a license key.

#### `await authvaultix.LicenseLogin(licenseKey)` / `await authvaultix.License(licenseKey)`
Authenticates directly using a license key (no username/password required).

#### `await authvaultix.Logout()`
Terminates the current session and logs the user out.

---

### User & Session Management

#### `await authvaultix.Check()`
Validates if the current session is still active.

#### `await authvaultix.Upgrade(username, licenseKey)`
Upgrades a user's account/subscription with a new license key.

#### `await authvaultix.ForgotPassword(username, email)`
Triggers a password reset email for the given user.

#### `await authvaultix.ChangeUsername(newUsername)`
Changes the authenticated user's username.

#### `authvaultix.CurrentUser`
Property that holds the currently authenticated user's information (Username, IP, HWID, Subscriptions, etc.).

---

### Variables & Data

#### `await authvaultix.GetVar(varName)`
Fetches a user-specific server-side variable.

#### `await authvaultix.SetVar(varName, value)`
Sets a user-specific server-side variable for the current user.

#### `await authvaultix.GetGlobalVar(varKey)`
Fetches a global server-side variable by its ID.

#### `await authvaultix.Download(fileId)`
Downloads a secure file from the server. Returns an object containing `success`, `message`, and `fileBytes` (a Node.js Buffer).

---

### Security & Logging

#### `await authvaultix.Log(message)`
Sends a log message to the AuthVaultix dashboard.

#### `await authvaultix.FetchOnline()`
Retrieves a list of currently online clients.

#### `await authvaultix.Ban(reason)`
Bans the currently authenticated user with a specific reason.

#### `await authvaultix.CheckBlacklist()`
Checks if the current machine's HWID is blacklisted on the server.

---

### Communication

#### `await authvaultix.ChatSend(message, channel)`
Sends a message to a specific chat channel.

#### `await authvaultix.ChatFetch(channel)`
Retrieves chat history for a specific channel.

---

## 🔒 Security Notes

- **Do NOT hardcode your `secret` in public repositories.** Use `.env` files or environment variables:
  ```js
  import 'dotenv/config';

  const AuthVaultixApp = new AuthVaultix(
    process.env.APP_NAME,
    process.env.OWNER_ID,
    process.env.SECRET,
    "1.0"
  );
  ```
- Add a `.env` file and list it in `.gitignore`:
  ```
  APP_NAME=YourApp
  OWNER_ID=abc123
  SECRET=your_secret_here
  ```

---

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| [axios](https://github.com/axios/axios) | `^1.7.7` | HTTP requests to AuthVaultix API |

---

## 🪟 Platform Support

| Platform | Supported |
|----------|-----------|
| Windows | Full (HWID via Windows SID) |
| Linux | Full (HWID via `/etc/machine-id`) |
| macOS | Full (HWID via `IOPlatformSerialNumber`) |

> HWID detection is handled automatically based on the OS platform using `os.platform()`.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ for the **AuthVaultix** ecosystem

⭐ **Star this repo** if you found it useful!

</div>
