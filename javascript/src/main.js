import readline from "readline";
import { AuthVaultix } from "./authvaultix.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const AuthVaultixApp = new AuthVaultix(
  "", // App name
  "", // Account ID
  "", // App Secret
  "1.0" // App version
);


(async () => {
  await AuthVaultixApp.Init();

  console.log("\n[1] Login\n[2] Register\n[3] License Login\n[4] Upgrade\n[5] Forgot Password\n[6] Exit");
  rl.question("Choose option: ", async (choice) => {
    switch (choice) {
      case "1":
        rl.question("Username: ", (username) => {
          rl.question("Password: ", async (password) => {
            await AuthVaultixApp.Login(username.trim(), password.trim());
            rl.close();
          });
        });
        break;

      case "2":
        rl.question("Username: ", (username) => {
          rl.question("Password: ", (password) => {
            rl.question("License: ", async (license) => {
              await AuthVaultixApp.Register(
                username.trim(),
                password.trim(),
                license.trim()
              );
              rl.close();
            });
          });
        });
        break;

      case "3":
        rl.question("License: ", async (license) => {
          await AuthVaultixApp.License(license.trim());
          rl.close();
        });
        break;

      case "4":
        rl.question("Username: ", (username) => {
          rl.question("License: ", async (license) => {
            await AuthVaultixApp.Upgrade(username.trim(), license.trim());
            rl.close();
          });
        });
        break;

      case "5":
        rl.question("Username: ", (username) => {
          rl.question("Email: ", async (email) => {
            await AuthVaultixApp.ForgotPassword(username.trim(), email.trim());
            rl.close();
          });
        });
        break;

      case "6":
      default:
        console.log("Goodbye!");
        rl.close();
        break;
    }
  });
})();
