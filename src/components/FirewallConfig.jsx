import React, { useState } from 'react';

export default function FirewallConfig({ node, onUpdate, onClose }) {
    const [rules, setRules] = useState(node.data.firewallRules || []);
    const [newRule, setNewRule] = useState({
        action: 'ALLOW',
        protocol: 'any',
        port: '',
        sourceIp: 'any',
    });

    const addRule = () => {
        if (!newRule.port && newRule.protocol !== 'any') {
            alert('Please specify a port');
            return;
        }

        const rule = {
            id: Date.now(),
            ...newRule,
            port: newRule.port || 'any',
        };

        setRules([...rules, rule]);
        setNewRule({ action: 'ALLOW', protocol: 'any', port: '', sourceIp: 'any' });
    };

    const removeRule = (id) => {
        setRules(rules.filter(r => r.id !== id));
    };

    const handleSave = () => {
        onUpdate(node.id, { ...node.data, firewallRules: rules });
        onClose();
    };

    return (
        <div className="absolute top-4 right-4 w-96 bg-card border border-border rounded-lg shadow-xl p-4 z-10">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Firewall Rules - {node.data.label}</h3>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">&times;</button>
            </div>

            {/* Existing Rules */}
            <div className="mb-4 max-h-48 overflow-y-auto">
                <h4 className="text-sm font-semibold mb-2">Active Rules:</h4>
                {rules.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No rules configured (all traffic allowed)</p>
                ) : (
                    <div className="space-y-2">
                        {rules.map(rule => (
                            <div key={rule.id} className="flex items-center justify-between bg-secondary p-2 rounded text-sm">
                                <span className={rule.action === 'ALLOW' ? 'text-green-500' : 'text-red-500'}>
                                    {rule.action}
                                </span>
                                <span>
                                    {rule.protocol === 'any' ? 'any' : `port ${rule.port}`} from {rule.sourceIp}
                                </span>
                                <button
                                    onClick={() => removeRule(rule.id)}
                                    className="text-destructive hover:text-destructive/80"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add New Rule */}
            <div className="border-t border-border pt-4 space-y-2">
                <h4 className="text-sm font-semibold">Add New Rule:</h4>

                <div className="grid grid-cols-2 gap-2">
                    <select
                        value={newRule.action}
                        onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                        className="px-2 py-1 bg-input border border-border rounded text-sm"
                    >
                        <option value="ALLOW">ALLOW</option>
                        <option value="DENY">DENY</option>
                    </select>

                    <select
                        value={newRule.protocol}
                        onChange={(e) => setNewRule({ ...newRule, protocol: e.target.value })}
                        className="px-2 py-1 bg-input border border-border rounded text-sm"
                    >
                        <option value="any">Any Protocol</option>
                        <option value="tcp">TCP</option>
                        <option value="udp">UDP</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Port (or 'any')"
                        value={newRule.port}
                        onChange={(e) => setNewRule({ ...newRule, port: e.target.value })}
                        className="px-2 py-1 bg-input border border-border rounded text-sm"
                    />

                    <input
                        type="text"
                        placeholder="Source IP (or 'any')"
                        value={newRule.sourceIp}
                        onChange={(e) => setNewRule({ ...newRule, sourceIp: e.target.value })}
                        className="px-2 py-1 bg-input border border-border rounded text-sm"
                    />
                </div>

                <button
                    onClick={addRule}
                    className="w-full px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                    Add Rule
                </button>
            </div>

            {/* Save/Cancel */}
            <div className="flex gap-2 mt-4">
                <button
                    onClick={handleSave}
                    className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                    Save
                </button>
                <button
                    onClick={onClose}
                    className="flex-1 px-3 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
