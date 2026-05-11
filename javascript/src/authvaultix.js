import axios from "axios";
import { execSync } from "child_process";
import os from "os";

export class AuthVaultix {
    constructor(appName, ownerId, secret, version) {
        this._core = new AuthVaultixCore(appName, ownerId, secret, version);
    }

    get RisponceCollection() { return this._core.RisponceCollection; }
    get LastMessage1() { return this._core.LastMessage1; }
    get LastMessage() { return this._core.LastMessage; }
    get LastResponseMessage() { return this._core.LastResponseMessage; }
    get CurrentUser() { return this._core.CurrentUser; }
    get UserData() { return this._core.UserData; }
    get UseFullKey() { return this._core.UseFullKey; }
    get SessionId() { return this._core.SessionId; }
    get Initialized() { return this._core.Initialized; }

    async Init() { return await this._core.InitializeContext(); }
    async Login(username, password) { return await this._core.AuthenticateUser(username, password); }
    async Check() { return await this._core.ValidateSession(); }
    async Register(username, password, licenseKey, email = "") { return await this._core.RegisterAccount(username, password, licenseKey, email); }
    async LicenseLogin(licenseKey) { return await this._core.LicenseAccess(licenseKey); }
    async License(licenseKey) { return await this._core.LicenseAccess(licenseKey); }
    async Log(message) { return await this._core.SendLog(message); }
    async Download(fileId) { return await this._core.RetrieveFile(fileId); }
    async FetchOnline() { return await this._core.GetOnlineClients(); }
    async Ban(reason) { return await this._core.EnforceBan(reason); }
    async Logout() { await this._core.TerminateSession(); }
    async ChangeUsername(newUsername) { await this._core.UpdateUsername(newUsername); }
    async CheckBlacklist() { return await this._core.VerifyBlacklist(); }
    async ForgotPassword(username, email) { return await this._core.TriggerPasswordReset(username, email); }
    async Upgrade(username, licenseKey) { return await this._core.ApplyUpgrade(username, licenseKey); }
    async GetGlobalVar(varKey) { return await this._core.FetchGlobalVariable(varKey); }
    async GetVar(varName) { return await this._core.FetchUserVariable(varName); }
    async SetVar(varName, value) { return await this._core.UpdateUserVariable(varName, value); }
    async ChatSend(message, channel) { return await this._core.TransmitChatMessage(message, channel); }
    async ChatFetch(channel) { return await this._core.RetrieveChatHistory(channel); }
}

class UserInfo {
    constructor(data) {
        this.username = data.username;
        this.ip = data.ip;
        this.hwid = data.hwid;
        this.createdate = data.createdate;
        this.lastlogin = data.lastlogin;
        this.subscriptions = data.subscriptions ? data.subscriptions.map(s => new Subscription(s)) : [];
    }

    get CreationDate() {
        return this.createdate ? new Date(parseInt(this.createdate) * 1000) : null;
    }

    get LastLoginDate() {
        return this.lastlogin ? new Date(parseInt(this.lastlogin) * 1000) : null;
    }

    get CreationDateFormatted() {
        return this.CreationDate ? this.CreationDate.toLocaleString() : "Invalid date";
    }

    get LastLoginFormatted() {
        return this.LastLoginDate ? this.LastLoginDate.toLocaleString() : "Invalid date";
    }
}

class Subscription {
    constructor(data) {
        this.subscription = data.subscription;
        this.key = data.key;
        this.expiry = data.expiry;
        this.timeleft = data.timeleft;
    }

    get ExpiryDate() {
        return this.expiry ? new Date(parseInt(this.expiry) * 1000) : null;
    }

    get ExpiryFormatted() {
        return this.ExpiryDate ? this.ExpiryDate.toLocaleString() : "Invalid date";
    }

    get TimeLeftFormatted() {
        if (!this.ExpiryDate) return "N/A";
        const diffSeconds = Math.floor((this.ExpiryDate.getTime() - Date.now()) / 1000);
        if (diffSeconds <= 0) return "Expired";
        
        let remaining = diffSeconds;
        const days = Math.floor(remaining / 86400);
        remaining %= 86400;
        const hours = Math.floor(remaining / 3600);
        remaining %= 3600;
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
}

class HardwareIdentifier {
    static Fetch() {
        try {
            const platform = os.platform();
            if (platform === "win32") {
                return execSync(`powershell -Command "[System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value"`, { encoding: "utf8" }).trim();
            } else if (platform === "darwin") {
                const output = execSync("ioreg -l | grep IOPlatformSerialNumber").toString();
                const parts = output.split("=");
                return parts[1] ? parts[1].trim().replace(/"/g, "") : "UNKNOWN_HWID";
            } else if (platform === "linux") {
                return require("fs").readFileSync("/etc/machine-id", "utf-8").trim();
            }
            return "UNKNOWN_HWID";
        } catch {
            return "UNKNOWN_HWID";
        }
    }
}

class PayloadBuilder {
    constructor(type) {
        this.payload = { type };
    }

    WithContext(appName, ownerId, sessionId) {
        this.payload.name = appName;
        this.payload.ownerid = ownerId;
        if (sessionId) {
            this.payload.sessionid = sessionId;
        }
        return this;
    }

    WithValue(key, value) {
        this.payload[key] = value;
        return this;
    }

    Compile() {
        return this.payload;
    }
}

class NetworkAgent {
    static async Post(url, payload) {
        try {
            const params = new URLSearchParams(payload);
            const response = await axios.post(url, params);
            return response.data;
        } catch (err) {
            console.error("Connection failed");
            process.exit(1);
        }
    }
}

class AuthVaultixCore {
    constructor(appName, ownerId, secret, version) {
        if (!appName || !ownerId || !secret || !version) {
            console.error("Application not setup correctly.");
            process.exit(1);
        }
        this._appName = appName;
        this._ownerId = ownerId;
        this._secret = secret;
        this._version = version;
        this._apiUrl = "https://authvaultix.com/api/1.0/";

        this.RisponceCollection = "";
        this.LastMessage1 = null;
        this.LastMessage = null;
        this.LastResponseMessage = null;
        this.CurrentUser = null;
        this.UserData = null;
        this.UseFullKey = false;
        this.SessionId = null;
        this.Initialized = false;
    }

    EnsureReady() {
        if (!this.Initialized) {
            console.error("SDK not initialized. Call Client.Init() before using any API.");
            process.exit(1);
        }
    }

    async InitializeContext() {
        this.RisponceCollection = "Initialization failed1";
        if (this.Initialized) return true;

        const payload = new PayloadBuilder("init")
            .WithValue("ver", this._version)
            .WithValue("name", this._appName)
            .WithValue("ownerid", this._ownerId)
            .Compile();

        const resp = await NetworkAgent.Post(this._apiUrl, payload);
        
        if (resp === "Authvaultix_Invalid") {
            console.error("App not found");
            process.exit(1);
        }

        if (!resp.success) {
            console.error(resp.message || "Init Failed");
            process.exit(1);
        }

        this.SessionId = resp.sessionid;
        this.Initialized = true;
        console.log("Initialized SDK");
        return true;
    }

    async AuthenticateUser(username, password) {
        this.RisponceCollection = null;
        this.EnsureReady();

        const payload = new PayloadBuilder("login")
            .WithContext(this._appName, this._ownerId, this.SessionId)
            .WithValue("username", username)
            .WithValue("pass", password)
            .WithValue("hwid", HardwareIdentifier.Fetch())
            .Compile();

        const resp = await NetworkAgent.Post(this._apiUrl, payload);

        if (!resp.success) {
            this.RisponceCollection = resp.message || "Login failed";
            console.log("❌ Login Failed:", resp.message || "Unknown error");
            return false;
        }

        console.log("✅ Logged in!");
        this.CurrentUser = new UserInfo(resp.info);
        if (resp.sessionid) this.SessionId = resp.sessionid;
        this.printUserInfo(this.CurrentUser);
        return true;
    }

    async ValidateSession() {
        this.RisponceCollection = null;
        this.EnsureReady();
        if (!this.SessionId) {
            console.error("Session missing");
            process.exit(1);
        }

        const payload = new PayloadBuilder("check")
            .WithContext(this._appName, this._ownerId, this.SessionId)
            .Compile();

        const resp = await NetworkAgent.Post(this._apiUrl, payload);
        
        if (!resp || !resp.success) {
            console.error(resp?.message || "Session check failed");
            process.exit(1);
        }

        this.RisponceCollection = resp.message;
        this.LastMessage = this.RisponceCollection;
        this.LastMessage1 = this.RisponceCollection;
        return true;
    }

    async RegisterAccount(username, password, licenseKey, email) {
        this.RisponceCollection = null;
        this.EnsureReady();

        const payload = new PayloadBuilder("register")
            .WithContext(this._appName, this._ownerId, this.SessionId)
            .WithValue("username", username)
            .WithValue("pass", password)
            .WithValue("key", licenseKey)
            .WithValue("email", email)
            .WithValue("hwid", HardwareIdentifier.Fetch())
            .Compile();

        const resp = await NetworkAgent.Post(this._apiUrl, payload);

        if (!resp.success) {
            this.RisponceCollection = resp.message || "Register failed";
            console.log("❌ Register Failed:", resp.message || "Unknown error");
            return false;
        }

        console.log("✅ Registered Successfully!");
        this.CurrentUser = new UserInfo(resp.info);
        if (resp.sessionid) this.SessionId = resp.sessionid;
        this.printUserInfo(this.CurrentUser);
        return true;
    }

    async LicenseAccess(licenseKey) {
        this.EnsureReady();
        const payload = new PayloadBuilder("license")
            .WithContext(this._appName, this._ownerId, this.SessionId)
            .WithValue("key", licenseKey)
            .WithValue("hwid", HardwareIdentifier.Fetch())
            .Compile();

        const resp = await NetworkAgent.Post(this._apiUrl, payload);

        if (!resp.success) {
            this.RisponceCollection = resp.message || "License login failed";
            console.log("❌ License Login Failed:", resp.message || "Unknown error");
            return false;
        }

        console.log("✅ License Login Successful!");
        this.CurrentUser = new UserInfo(resp.info);
        if (resp.sessionid) this.SessionId = resp.sessionid;
        this.printUserInfo(this.CurrentUser);
        return true;
    }

    async SendLog(message) {
        let serverMessage = null;
        this.EnsureReady();
        if (!this.SessionId) {
            return { success: false, message: "Session missing. Please login again." };
        }

        const payload = new PayloadBuilder("log")
            .WithContext(this._appName, this._ownerId, this.SessionId)
            .WithValue("message", message)
            .WithValue("pcuser", os.userInfo().username)
            .Compile();

        const resp = await NetworkAgent.Post(this._apiUrl, payload);

        if (!resp || !resp.success) {
            serverMessage = resp?.message || "Log failed";
            return { success: false, message: serverMessage };
        }
        
        this.LastMessage = resp.message;
        return { success: true, message: resp.message };
    }

    async RetrieveFile(fileId) {
        this.EnsureReady();
        if (!this.SessionId) {
            return { success: false, message: "Session missing. Please login again.", fileBytes: null };
        }
        if (!fileId) {
            return { success: false, message: "Invalid file id.", fileBytes: null };
        }

        const payload = new PayloadBuilder("file")
            .WithContext(this._appName, this._ownerId, this.SessionId)
            .WithValue("fileid", fileId)
            .Compile();

        const resp = await NetworkAgent.Post(this._apiUrl, payload);

        if (!resp) {
            return { success: false, message: "Download request failed (no response).", fileBytes: null };
        }

        this.LastMessage = resp.message;
        this.LastMessage1 = resp.message;

        if (!resp.success) {
            return { success: false, message: resp.message || "Download failed", fileBytes: null };
        }
        
        if (!resp.contents) {
            return { success: false, message: "File content missing", fileBytes: null };
        }
        
        try {
            const fileBytes = Buffer.from(resp.contents, "hex");
            return { success: true, message: resp.message || "Download successful", fileBytes };
        } catch (e) {
            return { success: false, message: "Invalid file encoding", fileBytes: null };
        }
    }

    async GetOnlineClients() {
        this.EnsureReady();
        if (!this.SessionId) {
            return { success: false, message: "Session missing. Please login again.", users: null };
        }

        const payload = new PayloadBuilder("fetchOnline")
            .WithContext(this._appName, this._ownerId, this.SessionId)
            .Compile();

        const resp = await NetworkAgent.Post(this._apiUrl, payload);

        if (!resp) {
            return { success: false, message: "Request failed. Please try again.", users: null };
        }

        if (!resp.success) {
            return { success: false, message: resp.message || "Failed to fetch online users.", users: null };
        }

        const usersList = resp.users ? Array.from({ length: Number(resp.users) }).map((_, i) => ({ credential: `User_${i+1}` })) : [];
        return { success: true, message: resp.message || "OK", users: usersList };
    }

    async EnforceBan(reason) {
        this.EnsureReady();
        if (!this.SessionId) {
            return { success: false, message: "Session missing. Please login again." };
        }

        const payload = new PayloadBuilder("ban")
            .WithContext(this._appName, this._ownerId, this.SessionId)
            .WithValue("reason", reason || "No reason provided")
            .Compile();

        const resp = await NetworkAgent.Post(this._apiUrl, payload);

        if (!resp) {
            return { success: false, message: "Request failed. Please try again." };
        }

        this.LastMessage = resp.message;
        this.LastMessage1 = resp.message;

        if (!resp.success) {
            return { success: false, message: resp.message || "Ban failed" };
        }

        return { success: true, message: resp.message || "Banned" };
    }

    async TerminateSession() {
        this.EnsureReady();
        const payload = new PayloadBuilder("logout")
            .WithContext(this._appName, this._ownerId, this.SessionId)
            .Compile();

        const resp = await NetworkAgent.Post(this._apiUrl, payload);
        if (!resp || !resp.success) {
            console.error(resp?.message || "Logout Error");
        }

        this.SessionId = null;
        this.Initialized = false;
        console.log("Logged out successfully");
    }

    async UpdateUsername(newUsername) {
        this.EnsureReady();
        if (!newUsername) throw new Error("New username cannot be empty");

        const payload = new PayloadBuilder("changeUsername")
            .WithContext(this._appName, this._ownerId, this.SessionId)
            .WithValue("newUsername", newUsername)
            .Compile();

        const resp = await NetworkAgent.Post(this._apiUrl, payload);
        if (!resp || !resp.success) throw new Error(resp?.message || "Change username Error");

        this.SessionId = null;
        this.Initialized = false;
        console.log("Username changed successfully, user logged out.");
    }

    async VerifyBlacklist() {
        this.EnsureReady();
        if (!this.SessionId) {
            return { success: false, message: "Session missing. Please login again." };
        }

        const payload = new PayloadBuilder("checkblacklist")
            .WithContext(this._appName, this._ownerId, this.SessionId)
            .WithValue("hwid", HardwareIdentifier.Fetch())
            .Compile();

        const resp = await NetworkAgent.Post(this._apiUrl, payload);
        if (!resp) {
            return { success: false, message: "Request failed. Please try again." };
        }

        this.LastMessage = resp.message;
        this.LastMessage1 = resp.message;

        if (!resp.success) {
            return { success: false, message: resp.message || "Client is blacklisted" };
        }

        return { success: true, message: resp.message || "Client is not blacklisted" };
    }

    async TriggerPasswordReset(username, email) {
        this.EnsureReady();
        const payload = new PayloadBuilder("forgot")
            .WithContext(this._appName, this._ownerId, this.SessionId)
            .WithValue("username", username)
            .WithValue("email", email)
            .Compile();

        const resp = await NetworkAgent.Post(this._apiUrl, payload);

        if (!resp || !resp.success) {
            this.RisponceCollection = resp?.message || "Failed";
            return false;
        }

        console.log("Reset email sent successfully");
        return true;
    }

    async ApplyUpgrade(username, licenseKey) {
        this.EnsureReady();
        const payload = new PayloadBuilder("upgrade")
            .WithContext(this._appName, this._ownerId, this.SessionId)
            .WithValue("username", username)
            .WithValue("key", licenseKey)
            .Compile();

        const resp = await NetworkAgent.Post(this._apiUrl, payload);

        if (!resp || !resp.success) {
            this.RisponceCollection = resp?.message || "Upgrade Error";
            return false;
        }

        console.log("Upgrade successful");
        return true;
    }

    async FetchGlobalVariable(varKey) {
        this.RisponceCollection = "";
        this.EnsureReady();
        if (!this.SessionId) {
            this.RisponceCollection = "Session missing. Please login again.";
            return null;
        }
        if (!varKey) {
            this.RisponceCollection = "Invalid variable key.";
            return null;
        }

        const payload = new PayloadBuilder("var")
            .WithContext(this._appName, this._ownerId, this.SessionId)
            .WithValue("varid", varKey)
            .Compile();

        const resp = await NetworkAgent.Post(this._apiUrl, payload);
        
        if (!resp || !resp.success) {
            this.RisponceCollection = resp?.message || "Failed to fetch variable.";
            return null;
        }

        this.RisponceCollection = "OK";
        return resp.message;
    }

    async FetchUserVariable(varName) {
        this.RisponceCollection = "";
        this.EnsureReady();
        if (!this.SessionId) {
            this.RisponceCollection = "Session missing. Please login again.";
            return null;
        }
        if (!varName) {
            this.RisponceCollection = "Invalid variable name.";
            return null;
        }

        const payload = new PayloadBuilder("getvar")
            .WithContext(this._appName, this._ownerId, this.SessionId)
            .WithValue("var", varName)
            .Compile();

        const resp = await NetworkAgent.Post(this._apiUrl, payload);
        
        if (!resp || !resp.success) {
            this.RisponceCollection = resp?.message || "Failed to get variable.";
            return null;
        }

        this.RisponceCollection = resp.message || "OK";
        return resp.message;
    }

    async UpdateUserVariable(varName, value) {
        this.RisponceCollection = "";
        this.EnsureReady();
        if (!this.SessionId) {
            this.RisponceCollection = "Session missing. Please login again.";
            return false;
        }
        if (!varName) {
            this.RisponceCollection = "Invalid variable name.";
            return false;
        }

        const payload = new PayloadBuilder("setvar")
            .WithContext(this._appName, this._ownerId, this.SessionId)
            .WithValue("varid", varName)
            .WithValue("data", value || "")
            .Compile();

        const resp = await NetworkAgent.Post(this._apiUrl, payload);
        
        if (!resp) {
            this.RisponceCollection = "Invalid server response.";
            return false;
        }

        this.RisponceCollection = resp.message || (resp.success ? "OK" : "Failed");
        this.LastMessage = this.RisponceCollection;
        this.LastMessage1 = this.RisponceCollection;

        return resp.success;
    }

    async TransmitChatMessage(message, channel) {
        this.EnsureReady();
        if (!this.SessionId) {
            return { success: false, message: "Session missing. Please login again." };
        }
        if (!message) {
            return { success: false, message: "Message cannot be empty." };
        }
        if (!channel) {
            return { success: false, message: "Invalid channel." };
        }

        const payload = new PayloadBuilder("chatsend")
            .WithContext(this._appName, this._ownerId, this.SessionId)
            .WithValue("message", message)
            .WithValue("channel", channel)
            .Compile();

        const resp = await NetworkAgent.Post(this._apiUrl, payload);
        
        if (!resp) {
            return { success: false, message: "Request failed. Please try again." };
        }

        this.LastResponseMessage = resp.message;

        if (!resp.success) {
            return { success: false, message: resp.message || "Chat send failed." };
        }

        return { success: true, message: resp.message || "Sent" };
    }

    async RetrieveChatHistory(channel) {
        this.EnsureReady();
        if (!this.SessionId) return null;
        if (!channel) return null;

        const payload = new PayloadBuilder("chatget")
            .WithContext(this._appName, this._ownerId, this.SessionId)
            .WithValue("channel", channel)
            .Compile();

        const resp = await NetworkAgent.Post(this._apiUrl, payload);

        if (!resp || !resp.success) return null;

        return resp.messages || [];
    }

    printUserInfo(info) {
        console.log("\n=== User Data ===");
        console.log("Username:", info.username);
        console.log("IP:", info.ip);
        console.log("HWID:", info.hwid);
        console.log("Created:", info.CreationDateFormatted);
        console.log("Last Login:", info.LastLoginFormatted);

        if (info.subscriptions && info.subscriptions.length > 0) {
            console.log("\nSubscriptions:");
            info.subscriptions.forEach((sub, index) => {
                console.log(`[${index + 1}] ${sub.subscription} | Expiry: ${sub.ExpiryFormatted} | Timeleft: ${sub.TimeLeftFormatted}`);
            });
        }
    }
}
