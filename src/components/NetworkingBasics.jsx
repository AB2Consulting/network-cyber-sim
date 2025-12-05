import React, { useState, useCallback } from 'react';
import NetworkGraph from './NetworkGraph';
import NetworkingChallenges from './NetworkingChallenges';

const CHALLENGES = [
    {
        id: 1,
        title: 'Connectivity Check',
        desc: 'Verify that PC 1 can reach PC 2. Use the ping command from PC 1 targeting 192.168.1.11.',
        criteria: { type: 'ping', source: 'PC 1', target: '192.168.1.11' }
    },
    {
        id: 2,
        title: 'Port Scanning',
        desc: 'Discover open ports on the Router. Run an nmap scan against 192.168.1.1.',
        criteria: { type: 'nmap', target: '192.168.1.1' }
    },
    {
        id: 3,
        title: 'Web Server Discovery',
        desc: 'Find the web server. Scan PC 2 (192.168.1.11) to see if port 80 is open.',
        criteria: { type: 'nmap', target: '192.168.1.11' }
    }
];

export default function NetworkingBasics({ onBack }) {
    const [completedChallenges, setCompletedChallenges] = useState([]);

    const handleCommandExecuted = useCallback((command, args, sourceNode) => {
        const targetIp = args;

        setCompletedChallenges(prev => {
            const newCompleted = [...prev];
            let updated = false;

            CHALLENGES.forEach(challenge => {
                if (newCompleted.includes(challenge.id)) return;

                const c = challenge.criteria;
                if (c.type === command) {
                    // Check target IP match
                    if (c.target && c.target !== targetIp) return;

                    // Check source node match (optional)
                    if (c.source && sourceNode.data.label !== c.source) return;

                    newCompleted.push(challenge.id);
                    updated = true;
                }
            });

            return updated ? newCompleted : prev;
        });
    }, []);

    return (
        <div className="w-full max-w-[1400px] h-[800px] flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex flex-col gap-4 min-w-0">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold">Networking Basics</h2>
                    <button
                        onClick={onBack}
                        className="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                        Back to Home
                    </button>
                </div>

                <div className="flex-1 border rounded-lg overflow-hidden relative">
                    <NetworkGraph
                        mode="basic"
                        onCommandExecuted={handleCommandExecuted}
                    />
                </div>
            </div>

            <NetworkingChallenges
                challenges={CHALLENGES}
                completedIds={completedChallenges}
            />
        </div>
    );
}
