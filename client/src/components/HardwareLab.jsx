import React, { useState } from 'react';
import NetworkGraph from './NetworkGraph';

const labNodes = [
    {
        id: 'gw-1',
        type: 'udm-pro',
        position: { x: 400, y: 50 },
        data: { label: 'UDM Pro SE', type: 'udm-pro', ip: '192.168.1.1', subnet: '255.255.255.0', ports: [80, 443, 22], firewallRules: [], idsEnabled: true }
    },
    {
        id: 'fw-1',
        type: 'fortigate',
        position: { x: 400, y: 150 },
        data: { label: 'FortiGate 40F', type: 'fortigate', ip: '192.168.1.2', subnet: '255.255.255.0', ports: [80, 443, 22], firewallRules: [], idsEnabled: true }
    },
    {
        id: 'sw-1',
        type: 'switch-cisco',
        position: { x: 400, y: 300 },
        data: { label: 'Cisco C9200L', type: 'switch-cisco', ip: '192.168.1.3', subnet: '255.255.255.0', ports: [22], firewallRules: [] }
    },
    {
        id: 'srv-1',
        type: 'server',
        position: { x: 200, y: 450 },
        data: { label: 'Dell R660 (App)', type: 'server', ip: '192.168.1.10', subnet: '255.255.255.0', ports: [80, 443, 22], firewallRules: [] }
    },
    {
        id: 'srv-2',
        type: 'server',
        position: { x: 400, y: 450 },
        data: { label: 'Dell R360 (DB)', type: 'server', ip: '192.168.1.11', subnet: '255.255.255.0', ports: [5432, 22], firewallRules: [] }
    },
    {
        id: 'sto-1',
        type: 'storage',
        position: { x: 600, y: 450 },
        data: { label: 'Synology DS224+', type: 'storage', ip: '192.168.1.12', subnet: '255.255.255.0', ports: [445, 22], firewallRules: [] }
    }
];

const labEdges = [
    { id: 'e-gw-fw', source: 'gw-1', target: 'fw-1', type: 'smoothstep', animated: true },
    { id: 'e-fw-sw', source: 'fw-1', target: 'sw-1', type: 'smoothstep', animated: true },
    { id: 'e-sw-srv1', source: 'sw-1', target: 'srv-1', type: 'smoothstep' },
    { id: 'e-sw-srv2', source: 'sw-1', target: 'srv-2', type: 'smoothstep' },
    { id: 'e-sw-sto1', source: 'sw-1', target: 'sto-1', type: 'smoothstep' },
];

export default function HardwareLab({ onBack }) {
    // Only static for now, interactive elements are within the Graph nodes (terminals)
    return (
        <div className="w-full h-full flex flex-col gap-4 max-w-[1400px]">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">Hardware Lab: SMB Rack</h2>
                    <p className="text-muted-foreground">
                        Topology: UDM Pro -> FortiGate -> Cisco Switch -> Servers/Storage
                    </p>
                </div>
                <button
                    onClick={onBack}
                    className="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                >
                    Back to Hub
                </button>
            </div>

            <div className="flex gap-4 mb-4">
                <div className="p-4 bg-card rounded-md border flex-1">
                    <h3 className="font-bold mb-2">Lab Objectives</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Access the <strong>Cisco Switch</strong> (Double-click) and explore IOS commands (`show vlan`, `conf t`).</li>
                        <li>Verify connectivity between the App Server and Database Server.</li>
                        <li>Inspect the Gateway (UDM Pro) settings.</li>
                    </ul>
                </div>
                <div className="p-4 bg-card rounded-md border w-64">
                    <h3 className="font-bold mb-2">Device Status</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Gateway</span>
                            <span className="text-green-500">Online</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Firewall</span>
                            <span className="text-green-500">Active</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Switch Core</span>
                            <span className="text-green-500">Up</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 border rounded-lg overflow-hidden relative min-h-[600px] bg-zinc-950/20">
                <NetworkGraph
                    mode="lab"
                    initialData={{ nodes: labNodes, edges: labEdges }}
                />
            </div>
        </div>
    );
}
