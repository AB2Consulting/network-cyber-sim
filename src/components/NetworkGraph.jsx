import React, { useCallback, useState, useEffect, useRef } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import NodeDetails from './NodeDetails';
import Terminal from './Terminal';
import FirewallConfig from './FirewallConfig';
import CustomNode from './CustomNode';

const nodeTypes = {
    custom: CustomNode,
};

const initialNodes = [
    {
        id: '1',
        position: { x: 300, y: 50 },
        data: {
            label: 'Router 1',
            type: 'router',
            ip: '192.168.1.1',
            subnet: '255.255.255.0',
            ports: [22, 80],
            firewallRules: [],
            vulnerabilities: ['ssh'],
            compromised: false,
            idsEnabled: false,
            securityLogs: [],
            passwordStrength: 'medium'
        },
        type: 'custom',
    },
    {
        id: '2',
        position: { x: 300, y: 200 },
        data: {
            label: 'Switch 1',
            type: 'switch',
            ip: '',
            subnet: '',
            ports: [],
            firewallRules: [],
            vulnerabilities: [],
            compromised: false,
            idsEnabled: false,
            securityLogs: [],
            passwordStrength: 'strong'
        },
        type: 'custom',
    },
    {
        id: '3',
        position: { x: 100, y: 350 },
        data: {
            label: 'PC 1',
            type: 'pc',
            ip: '192.168.1.10',
            subnet: '255.255.255.0',
            ports: [],
            firewallRules: [],
            vulnerabilities: [],
            compromised: false,
            idsEnabled: false,
            securityLogs: [],
            passwordStrength: 'strong'
        },
        type: 'custom',
    },
    {
        id: '4',
        position: { x: 500, y: 350 },
        data: {
            label: 'PC 2',
            type: 'pc',
            ip: '192.168.1.11',
            subnet: '255.255.255.0',
            ports: [80, 443],
            firewallRules: [],
            vulnerabilities: ['http', 'ssh'],
            compromised: false,
            idsEnabled: false,
            securityLogs: [],
            passwordStrength: 'weak'
        },
        type: 'custom',
    },
];

const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
    { id: 'e2-3', source: '2', target: '3', type: 'smoothstep' },
    { id: 'e2-4', source: '2', target: '4', type: 'smoothstep' },
];

const Packet = ({ x, y, blocked }) => (
    <div
        style={{
            position: 'absolute',
            left: x,
            top: y,
            width: '12px',
            height: '12px',
            backgroundColor: blocked ? '#ef4444' : '#3b82f6',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            boxShadow: `0 0 10px ${blocked ? '#ef4444' : '#3b82f6'}`
        }}
    />
);

const isSameSubnet = (ip1, ip2, mask) => {
    if (!ip1 || !ip2 || !mask) return false;
    const ipToLong = (ip) => ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
    const maskToLong = (mask) => mask.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
    return (ipToLong(ip1) & maskToLong(mask)) === (ipToLong(ip2) & maskToLong(mask));
};

const checkFirewall = (targetNode, sourceIp, port = 'any', protocol = 'any') => {
    const rules = targetNode.data.firewallRules || [];
    if (rules.length === 0) return { allowed: true };

    for (const rule of rules) {
        const ipMatch = rule.sourceIp === 'any' || rule.sourceIp === sourceIp;
        const portMatch = rule.port === 'any' || port === 'any' || rule.port === String(port);
        const protocolMatch = rule.protocol === 'any' || protocol === 'any' || rule.protocol === protocol;

        if (ipMatch && portMatch && protocolMatch) {
            return { allowed: rule.action === 'ALLOW', rule: rule };
        }
    }
    return { allowed: false, rule: { action: 'DENY (implicit)', port: 'any', sourceIp: 'any' } };
};

export default function NetworkGraph({ mode = 'basic', onGameEvent, onCommandExecuted, initialData }) {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || initialEdges);
    const [packets, setPackets] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [terminalNode, setTerminalNode] = useState(null);
    const [firewallNode, setFirewallNode] = useState(null);
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);

    useEffect(() => {
        if (initialData) {
            setNodes(initialData.nodes);
            setEdges(initialData.edges);
        } else {
            // Only reset to default if no initialData is provided (prevents overriding on re-renders if not handled carefully, but simple useEffect is fine for now)
            // Actually, if we switch modes, we might want to reset.
            // But for now, let's just respect the prop.
            if (mode === 'basic' && !initialData) {
                setNodes(initialNodes);
                setEdges(initialEdges);
            }
        }
    }, [initialData, mode]);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const onNodeClick = useCallback((event, node) => {
        setSelectedNode(node);
    }, []);

    const onNodeDoubleClick = useCallback((event, node) => {
        const allowedTypes = ['pc', 'router', 'switch', 'switch-cisco', 'server', 'udm-pro', 'fortigate'];
        if (allowedTypes.includes(node.data.type) || node.data.isAttacker) {
            setTerminalNode(node);
        }
    }, []);

    const onNodeUpdate = (nodeId, newData) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === nodeId) {
                return { ...node, data: newData };
            }
            return node;
        }));
        if (selectedNode && selectedNode.id === nodeId) {
            setSelectedNode(prev => ({ ...prev, data: newData }));
        }
        if (firewallNode && firewallNode.id === nodeId) {
            setFirewallNode(prev => ({ ...prev, data: newData }));
        }
    };

    useEffect(() => {
        setNodes(nds => nds.map(node => {
            const classes = [];
            if (node.data.compromised) classes.push('compromised');
            if (node.data.idsEnabled) classes.push('ids-protected');
            return { ...node, className: classes.join(' ') };
        }));
    }, [nodes.map(n => `${n.id}-${n.data.compromised}-${n.data.idsEnabled}`).join(',')]);

    useEffect(() => {
        const interval = setInterval(() => {
            setPackets((currentPackets) => {
                return currentPackets.map(packet => {
                    if (packet.progress >= 1) return null;
                    const newProgress = packet.progress + 0.02;
                    const sourceNode = nodes.find(n => n.id === packet.sourceId);
                    const targetNode = nodes.find(n => n.id === packet.targetId);
                    if (!sourceNode || !targetNode) return null;

                    const sourceW = sourceNode.width || 150;
                    const sourceH = sourceNode.height || 40;
                    const targetW = targetNode.width || 150;
                    const targetH = targetNode.height || 40;

                    const startX = sourceNode.position.x + sourceW / 2;
                    const startY = sourceNode.position.y + sourceH / 2;
                    const endX = targetNode.position.x + targetW / 2;
                    const endY = targetNode.position.y + targetH / 2;

                    const x = startX + (endX - startX) * newProgress;
                    const y = startY + (endY - startY) * newProgress;

                    return { ...packet, progress: newProgress, x, y };
                }).filter(Boolean);
            });
        }, 16);
        return () => clearInterval(interval);
    }, [nodes]);

    const findPath = (startNodeId, endNodeId) => {
        const queue = [[startNodeId]];
        const visited = new Set();
        visited.add(startNodeId);
        while (queue.length > 0) {
            const path = queue.shift();
            const node = path[path.length - 1];
            if (node === endNodeId) return path;
            const neighbors = edges
                .filter(e => e.source === node || e.target === node)
                .map(e => (e.source === node ? e.target : e.source));
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    const newPath = [...path, neighbor];
                    queue.push(newPath);
                }
            }
        }
        return null;
    };

    const sendPacket = (sourceId, targetId, port = 'any', protocol = 'any', checkFw = true) => {
        const sourceNode = nodes.find(n => n.id === sourceId);
        const targetNode = nodes.find(n => n.id === targetId);
        if (!sourceNode || !targetNode) return { success: false, reason: 'Node not found' };

        const isSwitch = (n) => n.data.type === 'switch';
        if (!isSwitch(sourceNode) && !isSwitch(targetNode)) {
            if (!isSameSubnet(sourceNode.data.ip, targetNode.data.ip, sourceNode.data.subnet)) {
                return { success: false, reason: 'Different subnets' };
            }
        }

        let blocked = false;
        let fwRule = null;
        if (checkFw) {
            const fwCheck = checkFirewall(targetNode, sourceNode.data.ip, port, protocol);
            if (!fwCheck.allowed) {
                blocked = true;
                fwRule = fwCheck.rule;
            }
        }

        const path = findPath(sourceId, targetId);
        if (path) {
            path.forEach((nodeId, index) => {
                if (index < path.length - 1) {
                    const nextNodeId = path[index + 1];
                    setTimeout(() => {
                        setPackets(prev => [...prev, {
                            id: Date.now() + index,
                            sourceId: nodeId,
                            targetId: nextNodeId,
                            progress: 0,
                            x: 0,
                            y: 0,
                            blocked: blocked
                        }]);
                    }, index * 800);
                }
            });
            if (blocked) return { success: false, reason: 'Blocked by firewall', rule: fwRule };
            return { success: true };
        } else {
            return { success: false, reason: 'No route to host' };
        }
    };

    const addSecurityLog = (nodeId, message, severity = 'info') => {
        setNodes(nds => nds.map(n => {
            if (n.id === nodeId) {
                const timestamp = new Date().toLocaleTimeString();
                const log = `[${timestamp}] [${severity.toUpperCase()}] ${message}`;
                return {
                    ...n,
                    data: {
                        ...n.data,
                        securityLogs: [...(n.data.securityLogs || []), log].slice(-50)
                    }
                };
            }
            return n;
        }));
    };

    const handleTerminalCommand = async (command, arg, arg2) => {
        if (command === 'ping') {
            const targetIp = arg;
            const targetNode = nodes.find(n => n.data.ip === targetIp);
            if (targetNode) {
                const result = sendPacket(terminalNode.id, targetNode.id, 'any', 'any', true);
                if (result.success) {
                    if (onCommandExecuted) onCommandExecuted('ping', targetIp, terminalNode);
                    return `Reply from ${targetIp}: bytes=32 time=10ms TTL=64`;
                } else if (result.reason === 'Blocked by firewall') {
                    return `Request timed out.\n(Blocked by firewall: ${result.rule.action} port ${result.rule.port} from ${result.rule.sourceIp})`;
                } else {
                    return 'Request timed out.';
                }
            } else {
                return 'Request timed out.';
            }
        } else if (command === 'nmap') {
            const targetIp = arg;
            const targetNode = nodes.find(n => n.data.ip === targetIp);
            if (targetNode) {
                sendPacket(terminalNode.id, targetNode.id, 'any', 'tcp', false);
                await new Promise(r => setTimeout(r, 500));
                sendPacket(terminalNode.id, targetNode.id, 'any', 'tcp', false);
                await new Promise(r => setTimeout(r, 1000));

                const openPorts = targetNode.data.ports || [];
                if (openPorts.length === 0) {
                    if (onCommandExecuted) onCommandExecuted('nmap', targetIp, terminalNode);
                    return `All 1000 scanned ports on ${targetIp} are closed.`;
                }
                if (onCommandExecuted) onCommandExecuted('nmap', targetIp, terminalNode);
                return `PORT    STATE SERVICE\n${openPorts.map(p => `${p}/tcp  open  ${p === 80 ? 'http' : p === 443 ? 'https' : p === 22 ? 'ssh' : 'unknown'}`).join('\n')}`;
            } else {
                return `Note: Host seems down.`;
            }
        }

        // --- RED VS BLUE COMMANDS ---
        if (mode !== 'redblue') {
            return `Command '${command}' not found. (Available in Red vs Blue mode only)`;
        }

        if (command === 'exploit') {
            const service = arg;
            const targetIp = arg2;
            const targetNode = nodes.find(n => n.data.ip === targetIp);

            if (!targetNode) return `Host ${targetIp} not found.`;
            if (!service) return 'Usage: exploit <service> <target_ip>\nServices: ssh, http, ftp, smb';

            const servicePortMap = { ssh: 22, http: 80, https: 443, ftp: 21, smb: 445 };
            const port = servicePortMap[service];

            if (!targetNode.data.ports.includes(port)) return `Service ${service} is not running on ${targetIp}`;
            if (!targetNode.data.vulnerabilities.includes(service)) return `${targetIp} is not vulnerable to ${service} exploit (patched or not vulnerable)`;

            const fwCheck = checkFirewall(targetNode, terminalNode.data.ip, port, 'tcp');
            if (!fwCheck.allowed) return `Exploit blocked by firewall on ${targetIp}`;

            setNodes(nds => nds.map(n => {
                if (n.id === targetNode.id) return { ...n, data: { ...n.data, compromised: true } };
                return n;
            }));

            addSecurityLog(targetNode.id, `COMPROMISED via ${service} exploit from ${terminalNode.data.ip}`, 'critical');
            if (targetNode.data.idsEnabled) addSecurityLog(targetNode.id, `IDS ALERT: Exploit attempt detected from ${terminalNode.data.ip}`, 'warning');

            sendPacket(terminalNode.id, targetNode.id, port, 'tcp', false);
            await new Promise(r => setTimeout(r, 1000));

            if (onGameEvent) onGameEvent('exploit_success', 100);
            return `[+] Exploit successful!\n[+] ${targetIp} has been compromised\n[+] You now have access to ${targetNode.data.label}`;
        } else if (command === 'ddos') {
            const targetIp = arg;
            const targetNode = nodes.find(n => n.data.ip === targetIp);
            if (!targetNode) return `Host ${targetIp} not found.`;

            for (let i = 0; i < 10; i++) {
                setTimeout(() => sendPacket(terminalNode.id, targetNode.id, 'any', 'tcp', false), i * 100);
            }

            addSecurityLog(targetNode.id, `DDoS attack from ${terminalNode.data.ip}`, 'critical');
            if (targetNode.data.idsEnabled) addSecurityLog(targetNode.id, `IDS ALERT: DDoS attack detected from ${terminalNode.data.ip}`, 'warning');

            if (onGameEvent) onGameEvent('ddos_launch', 50);
            return `[+] DDoS attack launched against ${targetIp}\n[+] Flooding target with packets...`;
        } else if (command === 'bruteforce') {
            const service = arg;
            const targetIp = arg2;
            const targetNode = nodes.find(n => n.data.ip === targetIp);

            if (!targetNode) return `Host ${targetIp} not found.`;
            if (service !== 'ssh') return 'Usage: bruteforce ssh <target_ip>';

            const strength = targetNode.data.passwordStrength;
            const successRate = { weak: 0.8, medium: 0.4, strong: 0.1 };
            const success = Math.random() < successRate[strength];

            await new Promise(r => setTimeout(r, 2000));

            if (success) {
                setNodes(nds => nds.map(n => {
                    if (n.id === targetNode.id) return { ...n, data: { ...n.data, compromised: true } };
                    return n;
                }));
                addSecurityLog(targetNode.id, `SSH brute force successful from ${terminalNode.data.ip}`, 'critical');
                if (onGameEvent) onGameEvent('bruteforce_success', 75);
                return `[+] Password cracked!\n[+] ${targetIp} has been compromised\n[+] Credentials: root:password123`;
            } else {
                addSecurityLog(targetNode.id, `Failed SSH brute force attempt from ${terminalNode.data.ip}`, 'warning');
                return `[-] Brute force failed. Password too strong or account locked.`;
            }
        } else if (command === 'sniff') {
            const subnet = terminalNode.data.subnet;
            const attackerIp = terminalNode.data.ip;
            const sameSubnetNodes = nodes.filter(n => n.data.ip && isSameSubnet(attackerIp, n.data.ip, subnet));

            if (sameSubnetNodes.length <= 1) return 'No traffic detected on this network segment.';
            return `[+] Packet sniffer activated\n[+] Capturing traffic on ${subnet}...\n\nCaptured packets:\n${sameSubnetNodes.slice(0, 3).map(n => `  ${n.data.ip} -> ${n.data.label}: HTTP GET /admin`).join('\n')}`;
        } else if (command === 'ids') {
            const action = arg;
            if (action === 'enable') {
                setNodes(nds => nds.map(n => {
                    if (n.id === terminalNode.id) return { ...n, data: { ...n.data, idsEnabled: true } };
                    return n;
                }));
                addSecurityLog(terminalNode.id, 'IDS enabled', 'info');
                if (onGameEvent) onGameEvent('ids_enable', 20);
                return '[+] Intrusion Detection System enabled\n[+] Monitoring for suspicious activity...';
            } else if (action === 'disable') {
                setNodes(nds => nds.map(n => {
                    if (n.id === terminalNode.id) return { ...n, data: { ...n.data, idsEnabled: false } };
                    return n;
                }));
                return '[-] IDS disabled';
            } else {
                return `Usage: ids <enable|disable>\nCurrent status: ${terminalNode.data.idsEnabled ? 'ENABLED' : 'DISABLED'}`;
            }
        } else if (command === 'patch') {
            const service = arg;
            if (!service) return `Usage: patch <service>\nVulnerable services: ${terminalNode.data.vulnerabilities.join(', ') || 'none'}`;
            if (!terminalNode.data.vulnerabilities.includes(service)) return `${service} is not vulnerable or already patched.`;

            await new Promise(r => setTimeout(r, 1500));

            setNodes(nds => nds.map(n => {
                if (n.id === terminalNode.id) {
                    return { ...n, data: { ...n.data, vulnerabilities: n.data.vulnerabilities.filter(v => v !== service) } };
                }
                return n;
            }));

            addSecurityLog(terminalNode.id, `Patched ${service} vulnerability`, 'info');
            if (onGameEvent) onGameEvent('patch_success', 50);
            return `[+] ${service} vulnerability patched successfully\n[+] System is now protected against ${service} exploits`;
        } else if (command === 'logs') {
            const logs = terminalNode.data.securityLogs || [];
            if (logs.length === 0) return 'No security events logged.';
            return `Security Event Log:\n${'='.repeat(50)}\n${logs.slice(-10).join('\n')}`;
        } else if (command === 'firewall') {
            const action = arg;
            const targetIp = arg2;
            if (!action || !targetIp) return 'Usage: firewall <block|allow> <ip>';

            const newRule = {
                id: Date.now(),
                action: action === 'block' ? 'DENY' : 'ALLOW',
                protocol: 'any',
                port: 'any',
                sourceIp: targetIp
            };

            setNodes(nds => nds.map(n => {
                if (n.id === terminalNode.id) {
                    return { ...n, data: { ...n.data, firewallRules: [...n.data.firewallRules, newRule] } };
                }
                return n;
            }));

            addSecurityLog(terminalNode.id, `Firewall rule added: ${newRule.action} ${targetIp}`, 'info');
            if (onGameEvent) onGameEvent('firewall_rule', 25);
            return `[+] Firewall rule added: ${newRule.action} all traffic from ${targetIp}`;
        }
    };

    return (
        <div className="flex flex-col h-full w-full gap-4 relative">
            {selectedNode && (
                <NodeDetails node={selectedNode} onUpdate={onNodeUpdate} />
            )}
            {terminalNode && (
                <Terminal
                    node={terminalNode}
                    onCommand={handleTerminalCommand}
                    onClose={() => setTerminalNode(null)}
                />
            )}
            {firewallNode && (
                <FirewallConfig
                    node={firewallNode}
                    onUpdate={onNodeUpdate}
                    onClose={() => setFirewallNode(null)}
                />
            )}

            <div className="flex gap-2 p-2 bg-card border rounded-md">
                <div className="text-sm text-muted-foreground p-2">
                    Double-click: Terminal {mode === 'redblue' && '| Single-click + Firewall button: Configure rules'}
                </div>
                {mode === 'redblue' && (
                    <button
                        onClick={() => selectedNode && setFirewallNode(selectedNode)}
                        disabled={!selectedNode}
                        className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        🛡️ Configure Firewall
                    </button>
                )}
            </div>

            <div className="h-[600px] w-full border rounded-lg bg-background relative" ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onNodeDoubleClick={onNodeDoubleClick}
                    onInit={setReactFlowInstance}
                    nodeTypes={nodeTypes}
                    fitView
                >
                    <Controls />
                    <MiniMap />
                    <Background variant="dots" gap={12} size={1} />
                </ReactFlow>
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                    {reactFlowInstance && packets.map(packet => {
                        const { x, y, zoom } = reactFlowInstance.getViewport();
                        const screenX = packet.x * zoom + x;
                        const screenY = packet.y * zoom + y;
                        return <Packet key={packet.id} x={screenX} y={screenY} blocked={packet.blocked} />;
                    })}
                </div>
            </div>
        </div>
    );
}
