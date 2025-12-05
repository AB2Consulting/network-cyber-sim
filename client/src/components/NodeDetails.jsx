import React, { useState, useEffect } from 'react';

const NodeDetails = ({ node, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(node.data.label);
    const [ip, setIp] = useState(node.data.ip);

    useEffect(() => {
        setLabel(node.data.label);
        setIp(node.data.ip);
    }, [node]);

    const handleSave = () => {
        onUpdate(node.id, { ...node.data, label, ip });
        setIsEditing(false);
    };

    return (
        <div className="absolute top-4 left-4 w-[300px] bg-card border rounded-lg shadow-xl p-4 z-10 text-card-foreground">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="font-bold">Node Properties</h3>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs text-blue-400 hover:text-blue-300"
                    >
                        Edit
                    </button>
                )}
            </div>

            <div className="space-y-3">
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">Type</label>
                    <div className="text-sm font-mono bg-muted p-1 rounded capitalize">{node.data.type}</div>
                </div>

                <div>
                    <label className="block text-xs text-muted-foreground mb-1">Hostname</label>
                    {isEditing ? (
                        <input
                            className="w-full bg-background border rounded px-2 py-1 text-sm"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                        />
                    ) : (
                        <div className="text-sm font-medium">{node.data.label}</div>
                    )}
                </div>

                <div>
                    <label className="block text-xs text-muted-foreground mb-1">IP Address</label>
                    {isEditing ? (
                        <input
                            className="w-full bg-background border rounded px-2 py-1 text-sm"
                            value={ip}
                            onChange={(e) => setIp(e.target.value)}
                        />
                    ) : (
                        <div className="text-sm font-mono text-muted-foreground">
                            {node.data.ip || 'Unassigned'}
                        </div>
                    )}
                </div>

                <div className="pt-2 border-t mt-2">
                    <label className="block text-xs text-muted-foreground mb-1">Status</label>
                    <div className="flex gap-2 flex-wrap">
                        {node.data.compromised ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-500 font-bold border border-red-500/50">COMPROMISED</span>
                        ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-green-500/20 text-green-500 border border-green-500/50">SECURE</span>
                        )}
                        {node.data.idsEnabled && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-500 border border-blue-500/50">IDS ACTIVE</span>
                        )}
                    </div>
                </div>

                {node.data.ports && node.data.ports.length > 0 && (
                    <div>
                        <label className="block text-xs text-muted-foreground mb-1">Open Ports</label>
                        <div className="flex gap-1 flex-wrap">
                            {node.data.ports.map(p => (
                                <span key={p} className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">{p}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {isEditing && (
                <div className="mt-4 flex gap-2 justify-end">
                    <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1 text-xs rounded bg-muted hover:bg-muted/80"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-3 py-1 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        Save
                    </button>
                </div>
            )}
        </div>
    );
};

export default NodeDetails;
