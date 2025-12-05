# How to Upload Your Project to GitHub

You cannot simply copy and paste the files. You need to use **Git**, a version control system.

## Prerequisites
1.  **GitHub Account**: Make sure you have one at [github.com](https://github.com).
2.  **Git Installed**: \u26a0\ufe0f **It seems Git is NOT installed on your system.**

### How to Install Git (Windows)
1.  Download **Git for Windows** from [git-scm.com/download/win](https://git-scm.com/download/win).
2.  Run the installer.
3.  **Important**: During installation, ensure "Git from the command line and also from 3rd-party software" is selected (usually default).
4.  Keep clicking "Next" through all other options (defaults are fine).
5.  Once installed, **restart your terminal** (close VS Code and reopen it) for the changes to take effect.
6.  Verify by typing `git --version` again.

## Step 1: Create a Repository on GitHub
1.  Log in to GitHub.
2.  Click the **+** icon in the top right and select **New repository**.
3.  **Name**: `network-cyber-sim` (or whatever you like).
4.  **Public/Private**: Choose your preference.
5.  **Do NOT** initialize with README, .gitignore, or License (we have these locally).
6.  Click **Create repository**.
7.  Copy the URL provided (e.g., `https://github.com/YourUsername/network-cyber-sim.git`).

## Step 2: Initialize Local Repository
Open your terminal (PowerShell or Command Prompt) and run these commands **inside your project folder**:

```powershell
# 1. Initialize Git
git init

# 2. Add all files to staging
git add .

# 3. Commit the files
git commit -m "Initial commit of Network Cyber Sim"

# 4. Link to your GitHub repo (Replace URL with yours)
git remote add origin https://github.com/YOUR_USERNAME/network-cyber-sim.git

# 5. Push properly
git branch -M main
git push -u origin main
```

## "What if I just want to copy/paste?"
If you really want to avoid Git command line:
1.  Go to your repository on GitHub.
2.  Click **"uploading an existing file"** link.
3.  Drag and drop your files.
    *   *Warning*: This works poorly for nested folders and thousands of files (like `node_modules`, though `.gitignore` usually prevents that locally, drag-drop ignores it).
    *   **Strongly Recommended**: Use the command line method above.

## Common Error: "! [rejected] main -> main (fetch first)"
If you see this error, it means you initialized the repo on GitHub with a README or License. You need to pull those files first.

**Run these commands to fix it:**
```powershell
# 1. Pull the remote files (merging unrelated histories)
git pull origin main --allow-unrelated-histories

# 2. Push your code again
git push -u origin main
```
