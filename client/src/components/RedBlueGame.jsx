import React, { useState, useCallback } from 'react';
import NetworkGraph from './NetworkGraph';

const initialGameNodes = [
    {
        id: 'attacker',
        type: 'pc',
        position: { x: 50, y: 300 },
        data: {
            label: 'Kali Linux',
            type: 'attacker',
            ip: '10.10.10.5',
            subnet: '10.10.10.0/24',
            ports: [],
            isAttacker: true,
            firewallRules: [],
            idsEnabled: false
        },
        className: 'border-red-500 bg-red-950/20'
    },
    {
        id: 'router-corp',
        type: 'router',
        position: { x: 300, y: 300 },
        data: {
            label: 'Corp Gateway',
            type: 'router',
            ip: '192.168.1.1',
            subnet: '255.255.255.0',
            ports: [80, 22],
            firewallRules: [],
            idsEnabled: true
        }
    },
    {
        id: 'srv-web',
        type: 'server',
        position: { x: 500, y: 200 },
        data: {
            label: 'Web Server',
            type: 'server',
            ip: '192.168.1.10',
            subnet: '255.255.255.0',
            ports: [80, 443],
            vulnerabilities: ['http'],
            passwordStrength: 'medium',
            firewallRules: [],
            idsEnabled: true
        }
    },
    {
        id: 'srv-db',
        type: 'server',
        position: { x: 500, y: 400 },
        data: {
            label: 'DB Server',
            type: 'server',
            ip: '192.168.1.11',
            subnet: '255.255.255.0',
            ports: [5432, 22],
            vulnerabilities: ['ssh'],
            passwordStrength: 'weak',
            firewallRules: [],
            idsEnabled: true
        }
    }
];

const initialGameEdges = [
    { id: 'e-att-gw', source: 'attacker', target: 'router-corp', type: 'smoothstep', label: 'Internet' },
    { id: 'e-gw-web', source: 'router-corp', target: 'srv-web', type: 'smoothstep' },
    { id: 'e-gw-db', source: 'router-corp', target: 'srv-db', type: 'smoothstep' },
];

export default function RedBlueGame() {
    const [score, setScore] = useState(0);
    const [gameLog, setGameLog] = useState([]);
    const [team, setTeam] = useState('red'); // 'red' or 'blue'

    const handleGameEvent = useCallback((event, points) => {
        setScore(prev => prev + points);

        let message = '';
        if (event === 'exploit_success') message = 'CRITICAL: Host Compromised!';
        if (event === 'ids_enable') message = 'DEFENSE: IDS Activated';
        if (event === 'bruteforce_success') message = 'CRITICAL: Password Cracked';
        if (event === 'firewall_rule') message = 'DEFENSE: Firewall Rule Updated';
        if (event === 'patch_success') message = 'DEFENSE: Vulnerability Patched';
        if (event === 'ddos_launch') message = 'ATTACK: DDoS Traffic Detected';

        if (message) {
            setGameLog(prev => [`[${new Date().toLocaleTimeString()}] ${message} (+${points})`, ...prev]);
        }
    }, []);

    return (
        <div className="w-full h-[800px] flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 bg-card border rounded-lg">
                <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold">
                        Score: <span className={score > 0 ? 'text-green-500' : 'text-foreground'}>{score}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-red-500 text-white rounded font-bold text-sm">RED TEAM (Attacker)</span>
                    <span className="px-3 py-1 bg-blue-500 text-white rounded font-bold text-sm">BLUE TEAM (Defender)</span>
                </div>
            </div>

            <div className="flex-1 flex gap-4 min-h-0">
                <div className="flex-[3] border rounded-lg overflow-hidden relative bg-zinc-950/50">
                    <NetworkGraph
                        mode="redblue"
                        initialData={{ nodes: initialGameNodes, edges: initialGameEdges }}
                        onGameEvent={handleGameEvent}
                    />
                </div>

                <div className="flex-1 border rounded-lg bg-card p-4 flex flex-col min-w-[300px]">
                    <h3 className="font-bold mb-4 border-b pb-2">Mission Control</h3>

                    <div className="mb-6">
                        <h4 className="text-sm font-bold text-red-400 mb-2">Red Objectives</h4>
                        <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-4">
                            <li>Scan the network to find targets (`nmap`).</li>
                            <li>Exploit the Web Server (`exploit http`).</li>
                            <li>Bruteforce the Database SSH (`bruteforce ssh`).</li>
                        </ul>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-sm font-bold text-blue-400 mb-2">Blue Objectives</h4>
                        <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-4">
                            <li>Identify attacking IP addresses.</li>
                            <li>Block attackers with Firewall (`firewall block &lt;ip&gt;`).</li>
                            <li>Enable IDS on servers (`ids enable`).</li>
                            <li>Patch vulnerabilities (`patch http`).</li>
                        </ul>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col">
                        <h4 className="font-bold mb-2">Game Event Log</h4>
                        <div className="flex-1 overflow-y-auto bg-muted/50 p-2 rounded text-xs font-mono space-y-1">
                            {gameLog.length === 0 && <div className="text-muted-foreground italic">No events yet...</div>}
                            {gameLog.map((log, i) => (
                                <div key={i} className="py-1 border-b border-border/50 last:border-0">{log}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
