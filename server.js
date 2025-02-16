const express = require("express");
const { exec } = require("child_process");
const ngrok = require("ngrok");

// Token added directly for Ngrok (not recommended for production, use .env instead)
const NGROK_AUTH_TOKEN = "2t7WXCwr8rxYCTHRzVNvP3W1H1Q_72FALhVLJfzPzuoQwtq5w"; // Add your actual token here

const app = express();
const PORT = process.env.PORT || 3000;

if (!NGROK_AUTH_TOKEN) {
  console.error("❌ ERROR: NGROK_AUTH_TOKEN is missing! Set it in the script.");
  process.exit(1);
}

// Windows setup commands
const enableTS = `powershell -Command "Set-ItemProperty -Path 'HKLM:\\System\\CurrentControlSet\\Control\\Terminal Server' -Name 'fDenyTSConnections' -Value 0"`;
const enableFirewall = `powershell -Command "Enable-NetFirewallRule -DisplayGroup 'Remote Desktop'"`;
const setUserAuth = `powershell -Command "Set-ItemProperty -Path 'HKLM:\\System\\CurrentControlSet\\Control\\Terminal Server\\WinStations\\RDP-Tcp' -Name 'UserAuthentication' -Value 1"`;
const setUserPassword = `powershell -Command "Set-LocalUser -Name 'runneradmin' -Password (ConvertTo-SecureString -AsPlainText 'P@ssw0rd!' -Force)"`;

// Function to run PowerShell commands
const runCommand = (cmd) => {
  exec(cmd, (error, stdout, stderr) => {
    if (error) console.error(`❌ PowerShell Error: ${error.message}`);
    if (stderr) console.error(`⚠️ PowerShell Stderr: ${stderr}`);
    console.log(`✅ PowerShell Output: ${stdout}`);
  });
};

// Execute setup commands
runCommand(enableTS);
runCommand(enableFirewall);
runCommand(setUserAuth);
runCommand(setUserPassword);

// Start Ngrok tunnel
let ngrokUrl = "";
(async function () {
  try {
    ngrokUrl = await ngrok.connect({ 
      proto: "tcp", 
      addr: 3389, 
      authtoken: NGROK_AUTH_TOKEN // Use the directly added token
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
