import axios from "axios";
import { execSync } from "child_process";

export class AuthVaultix {
  constructor(config) {
    this.name = config.name;
    this.ownerid = config.ownerid;
    this.secret = config.secret;
    this.version = config.version;
    this.sessionid = null;
    this.BASE_URL = "https://api.authvaultix.com/api/1.2/";
  }

  async sendRequest(payload) {
    try {
      const params = new URLSearchParams(payload);
      const response = await axios.post(this.BASE_URL, params);
      return response.data;
    } catch (err) {
      console.error("❌ HTTP Error:", err.message);
      process.exit(1);
    }
  }

  getHWID() {
    try {
      const output = execSync(
        `powershell -Command "[System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value"`,
        { encoding: "utf8" }
      ).trim();
      return output || "UNKNOWN_HWID";
    } catch {
      return "UNKNOWN_HWID";
    }
  }

  async Init() {
    console.log("Connecting...");
    const resp = await this.sendRequest({
      type: "init",
      name: this.name,
      ownerid: this.ownerid,
      secret: this.secret,
      ver: this.version,
    });

    if (resp.success) {
      this.sessionid = resp.sessionid;
      console.log("✅ Initialized Successfully!");
    } else {
      console.log("❌ Init Failed:", resp.message || "Unknown error");
      process.exit(1);
    }
  }

  async Login(username, password) {
    const resp = await this.sendRequest({
      type: "login",
      sessionid: this.sessionid,
      username,
      pass: password,
      hwid: this.getHWID(),
      name: this.name,
      ownerid: this.ownerid,
    });

    if (resp.success) {
      console.log("✅ Logged in!");
      this.printUserInfo(resp.info);
    } else {
      console.log("❌ Login Failed:", resp.message || "Unknown error");
    }
  }

  async Register(username, password, license) {
    const resp = await this.sendRequest({
      type: "register",
      sessionid: this.sessionid,
      username,
      pass: password,
      key: license,
      hwid: this.getHWID(),
      name: this.name,
      ownerid: this.ownerid,
    });

    if (resp.success) {
      console.log("✅ Registered Successfully!");
      this.printUserInfo(resp.info);
    } else {
      console.log("❌ Register Failed:", resp.message || "Unknown error");
    }
  }

  async License(license) {
    const resp = await this.sendRequest({
      type: "license",
      sessionid: this.sessionid,
      key: license,
      hwid: this.getHWID(),
      name: this.name,
      ownerid: this.ownerid,
    });

    if (resp.success) {
      console.log("✅ License Login Successful!");
      this.printUserInfo(resp.info);
    } else {
      console.log("❌ License Login Failed:", resp.message || "Unknown error");
    }
  }

  printUserInfo(info) {
    console.log("\n👤 User Info:");
    console.log(" Username:", info.username);
    console.log(" HWID:", info.hwid);
    console.log(" IP:", info.ip);
    if (info.subscriptions) {
      console.log(" Subscriptions:");
      for (const sub of info.subscriptions) {
        console.log(`  - ${sub.subscription} | Expires: ${sub.expiry}`);
      }
    }
  }
}
