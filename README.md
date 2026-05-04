
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
const AuthVaultixApp = new AuthVaultix({
  name: "YourAppName",       // App name from dashboard
  ownerid: "your_ownerid",   // Owner ID from dashboard
  secret: "your_secret",     // Secret key from dashboard
  version: "1.0"             // App version
});
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

### `new AuthVaultix(config)`

Creates a new AuthVaultix client instance.

| Parameter | Type | Description |
|-----------|------|-------------|
| `config.name` | `string` | Your app name on AuthVaultix |
| `config.ownerid` | `string` | Your owner ID |
| `config.secret` | `string` | Your app secret |
| `config.version` | `string` | Your app version string |

---

### `await authvaultix.Init()`

Initializes a session with the AuthVaultix API. **Must be called before any other method.**

```js
await AuthVaultixApp.Init();
```

---

### `await authvaultix.Login(username, password)`

Authenticates a user with username and password. HWID is automatically captured and sent.

```js
await AuthVaultixApp.Login("john", "mypassword");
```

---

### `await authvaultix.Register(username, password, license)`

Registers a new user account using a license key.

```js
await AuthVaultixApp.Register("newuser", "mypassword", "XXXX-XXXX-XXXX-XXXX");
```

---

### `await authvaultix.License(licenseKey)`

Authenticates directly using a license key (no username/password required).

```js
await AuthVaultixApp.License("XXXX-XXXX-XXXX-XXXX");
```

---

### `authvaultix.getHWID()` *(internal)*

Returns the current machine's Windows Security Identifier (SID) as the HWID. This is automatically called during login, register, and license operations.

---

## 🔒 Security Notes

- **Do NOT hardcode your `secret` in public repositories.** Use `.env` files or environment variables:
  ```js
  import 'dotenv/config';

  const AuthVaultixApp = new AuthVaultix({
    name: process.env.APP_NAME,
    ownerid: process.env.OWNER_ID,
    secret: process.env.SECRET,
    version: "1.0"
  });
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
| Linux/macOS | ⚠️ Partial (HWID returns `UNKNOWN_HWID`) |

> HWID detection currently uses the Windows `PowerShell` method. Linux/macOS support can be added by overriding `getHWID()`.

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
