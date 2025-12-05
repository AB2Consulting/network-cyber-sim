import React, { useState } from 'react';
import NetworkGraph from './NetworkGraph';

export default function HardwareLab({ onBack }) {
    const [labStatus, setLabStatus] = useState('Active');

    // Preset topology matching the invoice equipment
    // UDM Pro -> FortiGate -> Cisco Switch -> [Servers, NAS, AP]

    // We need to pass these as props or modify NetworkGraph to accept initialNodes.
    // Currently NetworkGraph has hardcoded initialNodes.
    // I should modify NetworkGraph to accept `initialNodes` as a prop!
    // But since I can't modify NetworkGraph easily without potentially breaking other views, 
    // I will use the 'redblue' mode or add a new 'lab' mode to NetworkGraph and handle initialization there?
    // OR BETTER: Pass `customNodes` and `customEdges` to NetworkGraph and have it use them if provided.
    // Let's assume I will update NetworkGraph to accept `initialState` prop.
    // Wait, NetworkGraph uses `useNodesState(initialNodes)`.
    // I can modify NetworkGraph to take an `initialData` prop.

    // For this specific file, I'll just render the structure and assume I'll update NetworkGraph next.
    // Actually, I should update NetworkGraph FIRST to accept props, otherwise this won't work.
    // However, I can write this file now and then update NetworkGraph.

    // Let's define the nodes here.
    const labNodes = [
        {
            id: 'udm-1',
            position: { x: 400, y: 50 },
            data: { label: 'UDM Pro', type: 'udm-pro', ip: '10.0.0.1', subnet: '255.0.0.0', ports: [80, 443, 22], compromised: false },
            type: 'custom',
        },
        {
            id: 'fg-1',
            position: { x: 400, y: 150 },
            data: { label: 'FortiGate 40F', type: 'fortigate', ip: '10.0.1.1', subnet: '255.255.255.0', ports: [443, 22], firewallRules: [], compromised: false },
            type: 'custom',
        },
        {
            id: 'cisco-1',
            position: { x: 400, y: 300 },
            data: { label: 'Cisco C9200L', type: 'switch-cisco', ip: '10.0.1.2', subnet: '255.255.255.0', ports: [], compromised: false },
            type: 'custom',
        },
        {
            id: 'srv-1',
            position: { x: 200, y: 450 },
            data: { label: 'Dell R660 (VM Host)', type: 'server', ip: '10.0.1.10', subnet: '255.255.255.0', ports: [80, 443, 3389], compromised: false },
            type: 'custom',
        },
        {
            id: 'srv-2',
            position: { x: 350, y: 450 },
            data: { label: 'Dell R360 (App)', type: 'server', ip: '10.0.1.11', subnet: '255.255.255.0', ports: [8080], compromised: false },
            type: 'custom',
        },
        {
            id: 'nas-1',
            position: { x: 500, y: 450 },
            data: { label: 'Synology DS224+', type: 'storage', ip: '10.0.1.20', subnet: '255.255.255.0', ports: [445, 2049], compromised: false },
            type: 'custom',
        },
        {
            id: 'pc-admin',
            position: { x: 650, y: 300 },
            data: { label: 'Admin Workstation', type: 'pc', ip: '10.0.1.100', subnet: '255.255.255.0', ports: [], compromised: false },
            type: 'custom',
        }
    ];

    const labEdges = [
        { id: 'e-udm-fg', source: 'udm-1', target: 'fg-1', type: 'smoothstep' },
        { id: 'e-fg-sw', source: 'fg-1', target: 'cisco-1', type: 'smoothstep' },
        { id: 'e-sw-s1', source: 'cisco-1', target: 'srv-1', type: 'smoothstep' },
        { id: 'e-sw-s2', source: 'cisco-1', target: 'srv-2', type: 'smoothstep' },
        { id: 'e-sw-nas', source: 'cisco-1', target: 'nas-1', type: 'smoothstep' },
        { id: 'e-sw-pc', source: 'cisco-1', target: 'pc-admin', type: 'smoothstep' },
    ];

    return (
        <div className="flex flex-col h-full w-full max-w-[1600px] mx-auto p-4 gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">Hardware Lab Environment</h2>
                    <p className="text-muted-foreground">
                        Configure and manage your virtual data center.
                        <br />
                        <span className="text-sm opacity-80">Tip: Double-click the <b>Cisco Switch</b> and try commands like <code>enable</code>, <code>show vlan</code>, or <code>configure terminal</code>!</span>
                    </p>
                </div>
                <button
                    onClick={onBack}
                    className="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                >
                    Back to Hub
                </button>
            </div>

            <div className="flex-1 border rounded-lg overflow-hidden bg-background relative shadow-md">
                <NetworkGraph
                    mode="lab"
                    initialData={{ nodes: labNodes, edges: labEdges }}
                />
            </div>

            <div className="grid grid-cols-4 gap-4">
                <div className="p-4 border rounded bg-card">
                    <h4 className="font-bold text-sm text-muted-foreground">Gateway</h4>
                    <div className="text-xl font-bold flex items-center gap-2">
                        🛡️ UDM Pro
                        <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded">Online</span>
                    </div>
                </div>
                <div className="p-4 border rounded bg-card">
                    <h4 className="font-bold text-sm text-muted-foreground">Firewall</h4>
                    <div className="text-xl font-bold flex items-center gap-2">
                        🧱 FortiGate
                        <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded">Active</span>
                    </div>
                </div>
                <div className="p-4 border rounded bg-card">
                    <h4 className="font-bold text-sm text-muted-foreground">Core Switch</h4>
                    <div className="text-xl font-bold flex items-center gap-2">
                        🔀 Cisco 9200L
                        <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded">Trunk OK</span>
                    </div>
                </div>
                <div className="p-4 border rounded bg-card">
                    <h4 className="font-bold text-sm text-muted-foreground">Compute</h4>
                    <div className="text-xl font-bold flex items-center gap-2">
                        🖥️ Dell PowerEdge
                        <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded">VMs Running</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
