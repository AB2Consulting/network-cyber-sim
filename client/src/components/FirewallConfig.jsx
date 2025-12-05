import React, { useState } from 'react';

const FirewallConfig = ({ node, onUpdate, onClose }) => {
    const [rules, setRules] = useState(node.data.firewallRules || []);
    const [newRule, setNewRule] = useState({
        action: 'ALLOW',
        protocol: 'any',
        port: 'any',
        sourceIp: 'any'
    });

    const handleAddRule = () => {
        const rule = { ...newRule, id: Date.now() };
        const updatedRules = [...rules, rule];
        setRules(updatedRules);
        onUpdate(node.id, { ...node.data, firewallRules: updatedRules });
    };

    const handleDeleteRule = (id) => {
        const updatedRules = rules.filter(r => r.id !== id);
        setRules(updatedRules);
        onUpdate(node.id, { ...node.data, firewallRules: updatedRules });
    };

    return (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] bg-card border rounded-lg shadow-xl p-4 z-20 text-card-foreground">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="font-bold flex items-center gap-2">
                    🧱 Firewall Configuration: {node.data.label}
                </h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
            </div>

            <div className="mb-6">
                <h4 className="text-sm font-bold mb-2">Add Access Control Rule</h4>
                <div className="grid grid-cols-5 gap-2 items-end">
                    <div className="col-span-1">
                        <label className="text-xs block mb-1">Action</label>
                        <select
                            className="w-full text-sm p-1 rounded border bg-background"
                            value={newRule.action}
                            onChange={e => setNewRule({ ...newRule, action: e.target.value })}
                        >
                            <option value="ALLOW">ALLOW</option>
                            <option value="DENY">DENY</option>
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label className="text-xs block mb-1">Protocol</label>
                        <select
                            className="w-full text-sm p-1 rounded border bg-background"
                            value={newRule.protocol}
                            onChange={e => setNewRule({ ...newRule, protocol: e.target.value })}
                        >
                            <option value="any">ANY</option>
                            <option value="tcp">TCP</option>
                            <option value="udp">UDP</option>
                            <option value="icmp">ICMP</option>
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label className="text-xs block mb-1">Port</label>
                        <input
                            className="w-full text-sm p-1 rounded border bg-background"
                            placeholder="any"
                            value={newRule.port}
                            onChange={e => setNewRule({ ...newRule, port: e.target.value })}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="text-xs block mb-1">Source IP</label>
                        <input
                            className="w-full text-sm p-1 rounded border bg-background"
                            placeholder="any"
                            value={newRule.sourceIp}
                            onChange={e => setNewRule({ ...newRule, sourceIp: e.target.value })}
                        />
                    </div>
                    <div className="col-span-1">
                        <button
                            onClick={handleAddRule}
                            className="w-full py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-bold mb-2">Active Rules (Processed Top-Down)</h4>
                <div className="max-h-[300px] overflow-y-auto border rounded bg-muted/20">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-xs uppercase">
                            <tr>
                                <th className="p-2">Action</th>
                                <th className="p-2">Proto</th>
                                <th className="p-2">Port</th>
                                <th className="p-2">Source</th>
                                <th className="p-2 w-8"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rules.map((rule, idx) => (
                                <tr key={rule.id} className="border-b last:border-0 hover:bg-muted/50">
                                    <td className={`p-2 font-bold ${rule.action === 'ALLOW' ? 'text-green-500' : 'text-red-500'}`}>
                                        {rule.action}
                                    </td>
                                    <td className="p-2">{rule.protocol}</td>
                                    <td className="p-2">{rule.port}</td>
                                    <td className="p-2">{rule.sourceIp}</td>
                                    <td className="p-2">
                                        <button
                                            onClick={() => handleDeleteRule(rule.id)}
                                            className="text-red-500 hover:text-red-700"
                                            title="Delete Rule"
                                        >
                                            &times;
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {rules.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-4 text-center text-muted-foreground italic">
                                        No explicit rules. Default policy: DENY (Implicit).
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FirewallConfig;
