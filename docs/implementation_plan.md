# Educational Expansion Plan

## Goal Description
Create a comprehensive "Educational Arm" for the simulator. This will be a central hub offering structured learning paths starting from basics, moving to hardware setup (modeling specific devices like UDM Pro, FortiGate, Dell Servers), and advancing to offensive/defensive operations.

## User Review Required
> [!IMPORTANT]
> **Hardware Integration Strategy**: I will model the requested hardware (UDM Pro, FortiGate, Cisco Switch, etc.) as distinct nodes in the graph with specific properties.
> **Scope Check**: "Integrating PFSense/Kali" will be implemented as **simulated interfaces**.
> - **Kali**: Enhanced Terminal customization with pre-installed "tools" (simulated commands).
> - **Firewall (PFSense/FortiGate)**: A custom configuration UI popup that mimics rule management.

## Proposed Changes

### 1. New Component Structure
#### [NEW] [EducationalHub.jsx](file:///c:/Users/Alexb/.gemini/antigravity/scratch/network_cyber_sim/client/src/components/EducationalHub.jsx)
- Main landing page for the educational section.
- Cards/navigation for:
    1.  **Network Fundamentals** (CLI, Ping, Nmap) - *Refactored existing basics*
    2.  **Hardware Lab** (Rack Setup & Config) - *New*
    3.  **Security Ops** (Red vs Blue, Firewall Config) - *New/Integrated*

### 2. Hardware Lab Module
#### [NEW] [HardwareLab.jsx](file:///c:/Users/Alexb/.gemini/antigravity/scratch/network_cyber_sim/client/src/components/HardwareLab.jsx)
- A specific scenario using the `NetworkGraph`.
- **Preset Topology**:
    - **Gateway**: Ubiquiti UDM Pro
    - **Firewall**: Fortinet FortiGate 40F
    - **Switch**: Cisco Catalyst 9200L
    - **Servers**: Dell PowerEdge R660 & R360
    - **Storage**: Synology DS224+
- **Objective**: Connect and configure these devices (e.g., "Set up the VLANs on the Cisco switch", "Configure port forwarding on the FortiGate").

### 3. Component Updates
#### [MODIFY] [CustomNode.jsx](file:///c:/Users/Alexb/.gemini/antigravity/scratch/network_cyber_sim/client/src/components/CustomNode.jsx)
- Add visuals/icons for the specific hardware models (Dell Server, Cisco Switch, FortiGate).
- Add specific styling (e.g., rack-mount shape vs desktop).

#### [MODIFY] [Terminal.jsx](file:///c:/Users/Alexb/.gemini/antigravity/scratch/network_cyber_sim/client/src/components/Terminal.jsx)
- Add "Kali Mode" styling (Kali dragon logo or color scheme).
- Add help text for learning CLI commands.

#### [MODIFY] [App.jsx](file:///c:/Users/Alexb/.gemini/antigravity/scratch/network_cyber_sim/client/src/App.jsx)
- Update routing to point to `EducationalHub` instead of just `NetworkingBasics`.

## Verification Plan
### Manual Verification
- Navigate to the new "Education" section.
- Verify all 3 modules are accessible.
- **Hardware Lab**: Check that the graph loads with the specific devices (UDM Pro, etc.) and they are distinct from generic nodes.
- **Terminal**: Verify new help commands or "Kali" styling if implemented.
