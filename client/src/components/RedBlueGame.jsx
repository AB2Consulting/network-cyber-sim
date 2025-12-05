import React, { useState, useCallback } from 'react';
import NetworkGraph from './NetworkGraph';

export default function RedBlueGame() {
    const [redScore, setRedScore] = useState(0);
    const [blueScore, setBlueScore] = useState(0);
    const [events, setEvents] = useState([]);

    const handleGameEvent = useCallback((type, points) => {
        const timestamp = new Date().toLocaleTimeString();
        let message = '';

        if (type.includes('exploit') || type.includes('ddos') || type.includes('bruteforce')) {
            setRedScore(prev => prev + points);
            message = `[RED] +${points} pts: ${type.replace('_', ' ').toUpperCase()}`;
        } else {
            setBlueScore(prev => prev + points);
            message = `[BLUE] +${points} pts: ${type.replace('_', ' ').toUpperCase()}`;
        }

        setEvents(prev => [`${timestamp} - ${message}`, ...prev].slice(0, 5));
    }, []);

    return (
        <div className="w-full h-[800px] flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm col-span-2">
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <span className="text-red-500">Red Team (Attack)</span>
                        <span className="text-muted-foreground">vs</span>
                        <span className="text-blue-500">Blue Team (Defense)</span>
                    </h2>
                    <p className="text-muted-foreground">
                        Use the "Kali Linux" terminal to launch attacks. Protect "Corp Server" and "Worksation".
                        <br />
                        <span className="text-sm opacity-80">Tip: Double-click nodes to open terminals.</span>
                    </p>
                </div>

                <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-center">
                            <div className="text-red-500 font-bold text-xl">RED</div>
                            <div className="text-3xl font-mono">{redScore}</div>
                        </div>
                        <div className="text-2xl font-bold text-muted-foreground">VS</div>
                        <div className="text-center">
                            <div className="text-blue-500 font-bold text-xl">BLUE</div>
                            <div className="text-3xl font-mono">{blueScore}</div>
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
                        {events.map((e, i) => (
                            <div key={i} className="truncate">{e}</div>
                        ))}
                    </div>
                </div>
            </div>

            <NetworkGraph
                mode="redblue"
                onGameEvent={handleGameEvent}
                initialData={{
                    nodes: [
                        { id: '1', position: { x: 400, y: 50 }, data: { label: 'Internet Gateway', type: 'router', ip: '10.0.0.1', isRedTeam: false }, type: 'custom' },
                        { id: '2', position: { x: 400, y: 150 }, data: { label: 'Main Switch', type: 'switch', ip: '10.0.0.2' }, type: 'custom' },
                        { id: '3', position: { x: 200, y: 300 }, data: { label: 'Corp Server', type: 'server', ip: '10.0.0.10', ports: [80, 443, 22], vulnerabilities: ['ssh', 'http'], passwordStrength: 'medium' }, type: 'custom' },
                        { id: '4', position: { x: 600, y: 300 }, data: { label: 'Workstation', type: 'pc', ip: '10.0.0.20', ports: [80], vulnerabilities: [] }, type: 'custom' },
                        { id: '5', position: { x: 100, y: 100 }, data: { label: 'Kali Linux', type: 'pc', ip: '10.0.0.66', ports: [], isAttacker: true }, type: 'custom' },
                    ],
                    edges: [
                        { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
                        { id: 'e2-3', source: '2', target: '3', type: 'smoothstep' },
                        { id: 'e2-4', source: '2', target: '4', type: 'smoothstep' },
                        { id: 'e1-5', source: '1', target: '5', type: 'smoothstep', animated: true, style: { stroke: '#ef4444' } },
                    ]
                }}
            />
        </div>
    );
}
