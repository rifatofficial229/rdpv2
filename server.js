const express = require("express");
const { exec } = require("child_process");
const ngrok = require("ngrok");
require("dotenv").config(); // Load .env variables

const app = express();
const PORT = process.env.PORT || 3000;
const NGROK_AUTH_TOKEN = "2t7WXCwr8rxYCTHRzVNvP3W1H1Q_72FALhVLJfzPzuoQwtq5w"; // Hardcoded token

if (!NGROK_AUTH_TOKEN) {
  console.error("❌ ERROR: NGROK_AUTH_TOKEN is missing! Set it in environment variables.");
  process.exit(1);
}

// Function to run Linux commands (for the Render environment)
const runCommand = (cmd) => {
  exec(cmd, (error, stdout, stderr) => {
    if (error) console.error(`❌ Error: ${error.message}`);
    if (stderr) console.error(`⚠️ Stderr: ${stderr}`);
    console.log(`✅ Output: ${stdout}`);
  });
};

// Example Linux commands (e.g., setting firewall rules, starting services)
const enableFirewall = `sudo ufw allow 3389/tcp`; // Open RDP port 3389 on Linux firewall

// Execute Linux commands (as an example, adjust based on your needs)
runCommand(enableFirewall);

// Start Ngrok tunnel
let ngrokUrl = "";
(async function () {
  try {
    ngrokUrl = await ngrok.connect({
      proto: "tcp",
      addr: 3389, // The local port you want to expose (e.g., for RDP or another service)
      authtoken: NGROK_AUTH_TOKEN, // Use the hardcoded token
    });
    console.log(`🚀 Ngrok Tunnel Created: ${ngrokUrl}`);
  } catch (error) {
    console.error(`❌ Ngrok Error: ${error.message}`);
    process.exit(1);
  }
})();

// API Route to Get Ngrok URL
app.get("/", (req, res) => {
  if (!ngrokUrl) return res.status(500).json({ error: "Ngrok tunnel not initialized yet!" });
  res.json({ ngrok_url: ngrokUrl });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
