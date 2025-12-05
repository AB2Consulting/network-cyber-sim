import React, { useState, useEffect } from 'react';

export default function NodeDetails({ node, onUpdate }) {
    const [ip, setIp] = useState(node.data.ip || '');
    const [subnet, setSubnet] = useState(node.data.subnet || '255.255.255.0');

    useEffect(() => {
        setIp(node.data.ip || '');
        setSubnet(node.data.subnet || '255.255.255.0');
    }, [node]);

    const handleSave = () => {
        onUpdate(node.id, { ...node.data, ip, subnet });
    };

    return (
        <div className="absolute top-4 right-4 w-64 bg-card border rounded-lg shadow-lg p-4 z-10">
            <h3 className="font-bold text-lg mb-4">{node.data.label}</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">IP Address</label>
                    <input
                        type="text"
                        value={ip}
                        onChange={(e) => setIp(e.target.value)}
                        className="w-full px-3 py-2 bg-background border rounded-md text-sm"
                        placeholder="192.168.1.1"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Subnet Mask</label>
                    <input
                        type="text"
                        value={subnet}
                        onChange={(e) => setSubnet(e.target.value)}
                        className="w-full px-3 py-2 bg-background border rounded-md text-sm"
                        placeholder="255.255.255.0"
                    />
                </div>

                <div className="pt-2">
                    <button
                        onClick={handleSave}
                        className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
}
