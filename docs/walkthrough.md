# Educational Arm & Hardware Lab Walkthrough

## System Status: Verified ✅

### 1. Educational Hub
- **Access**: Click "Enter Academy" on the home screen.
- **Modules**:
    - **Network Fundamentals**: Guides users through basic connectivity checks (Ping, Nmap).
    - **Hardware Lab**: A new virtual rack environment.
    - **Security Ops**: The Red vs Blue scenario.

### 2. Hardware Lab (Deep Dive)
- **Topology**:
    - **Gateway**: UDM Pro (Blue Shield)
    - **Firewall**: FortiGate 40F (Orange Brick)
    - **Switch**: Cisco C9200L (Cyan Switch)
    - **Servers**: Dell R660 & R360 (Rack Servers)
- **Interactive Features**:
    - **Cisco Experience**: Double-click the **Cisco Switch** to open the **IOS Console**.
        - Commands: `enable`, `conf t`, `show vlan`, `show ip int brief`.
    - **Server Access**: Double-click generic servers/PCs to open a standard shell.

### 3. Security Ops (Kali Mode)
- **Visuals**:
    - **Attacker Node**: Clearly marked "Kali Linux" with Dragon icon.
- **Terminal Experience**:
    - **Kali Shell**: Double-click the Kali node.
    - **Features**: Custom prompt (`root@kali`), `man` pages, and categorized tools (Offensive/Defensive).

## Verified Workflows
1.  **Navigation**: Home -> Academy -> Module -> Back -> Home. (All tested).
2.  **Topologies**:
    -   **Basics**: Standard tree (Router -> Switch -> PCs).
    -   **Hardware**: Rack setup (UDM -> Forti -> Cisco -> Servers).
    -   **Security**: Red vs Blue (Attacker vs Corp Net).
3.  **Terminal Switching**:
    -   Opening a Cisco node gives IOS prompt/commands.
    -   Opening a Kali node gives Kali prompt/logo.
    -   Opening a generic node gives standard prompt.
