# 🛡️ Personal MCP Toolkit

A modular, intelligent, and secure **Model Context Protocol (MCP)** server that allows AI agents to manage system tools, terminals, and complex processes (such as penetration testing or software development) with full control.

👨‍💻 **Developer:** Seyed Hamidreza Hosseini

---

## 🌟 Key Features

- 🔍 **Progressive Tool Discovery:** The agent initially has access only to base tools and must explicitly and securely request advanced capabilities. This reduces context consumption and enhances security.
- 📚 **Dynamic Documentation System:** Without changing a single line of code, simply by adding a `.md` file to the `docs/` directory, the agent automatically detects it and serves it as a Resource to the model.
- 💾 **Persistent State Management:** By automatically creating an `.agent` directory in the workspace, the agent can save the progress of long-running tasks and resume exactly from the last saved point in case of internet disconnection or token limits.
- 🖥️ **Isolated Terminal Execution:** Enables running CLI commands within a controlled workspace with structured monitoring and JSON logging capabilities.
- 🛡️ **Cybersecurity Focus:** Includes agent-oriented documentation for professional tools like `nuclei`, `ffuf`, `sqlmap`, `katana`, and more.

---

## 🐧 Recommended Execution Environment (Very Important)

> ⚠️ **Note:** This project is specifically designed, tested, and optimized for **Linux** environments. Running it on Windows may result in permission limitations or terminal command incompatibilities.

### 🐉 Why Kali Linux?
Although this tool works on any Linux distribution (such as Ubuntu or Debian), it is **highly recommended** to run it on **Kali Linux** (preferably in a virtual machine).
**Reason:** Kali Linux comes pre-installed with many security tools, or installing them is extremely straightforward. This allows the agent to focus directly on "executing tests, writing scripts, and analyzing outputs" instead of wasting time and tokens on "installing and troubleshooting tools."

---

## 🚀 Installation and Setup (Step-by-Step on Linux)

To set up the project on your Linux system, follow these steps sequentially in your terminal:

### 1. Prerequisites
Ensure that **Node.js** (version 18 or higher) and **Git** are installed on your system:
```bash
node --version  # Should be v18.x.x or higher
npm --version
git --version
```
*(If not installed, run: `sudo apt update && sudo apt install nodejs npm git -y`)*

### 2. Clone the Repository
```bash
git clone <YOUR_REPOSITORY_URL>
cd tool_hermes
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Build the Project
Since the core of the project is written in TypeScript, it must be compiled:
```bash
npm run build
```
*(Note: After any changes to the code in the `src/` directory, you must run this command again).*

---

## ⚙️ Usage and Activation

### 1. Connect to a Client (e.g., Hermes)
The MCP server is designed to run via `stdio`. To use it, simply add the built path to your client as a local MCP Server:
```json
{
  "mcpServers": {
    "personal-toolkit": {
      "command": "node",
      "args": ["/absolute/path/to/tool_hermes/dist/index.js"]
    }
  }
}
```

### 2. Start a New Workspace
Ask the agent to create a workspace. This will **automatically** create the `.agent` directory for state management:
> "Create a workspace for me at `/home/user/my_project`."

### 3. Add New Documentation (Without Coding!)
To teach the agent a new tool or process, no code changes are required. Simply:
1. Create a markdown file (e.g., `my-tool.md`) in the `docs/security/` or `docs/linux/` directory.
2. Restart the MCP server.
3. The agent will automatically detect it and serve it at an address like `security://docs/my-tool`.

---

## 🔄 State Management (Resuming After Disconnection)

If the connection drops during a long-running process (like scanning a large network or building a project), do not worry. The agent automatically saves the state in the `.agent/current_state.json` file.

To resume work, simply tell the agent after reconnecting:
> "Read the `.agent/current_state.json` file and continue the work from the last recorded step."

---

## ⚠️ Development Status and Ethical Disclaimer

- 🚧 **Project Status:** This project is under **Active Development**. New features may be added continuously, and the file structure may be optimized.
- 🛡️ **Security and Ethical Warning:** This tool is designed strictly for educational, research, and **authorized** penetration testing purposes. Using this tool on systems, networks, or websites that you do not own or do not have **explicit written permission** to test is illegal and unethical. The developer assumes no responsibility for any misuse of this project.

---

> Built with ❤️ and a focus on modern software engineering by **Seyed Hamidreza Hosseini**.