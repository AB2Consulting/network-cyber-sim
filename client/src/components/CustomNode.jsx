import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode = ({ data, isConnectable, selected }) => {
    const isRouter = data.type === 'router' || data.type === 'udm-pro';
    const isSwitch = data.type === 'switch' || data.type === 'switch-cisco';
    const isPC = data.type === 'pc' || data.type === 'server' || data.type === 'storage';

    // Determine visual style based on node type
    let bgColor = 'bg-background';
    let borderColor = 'border-border';
    let icon = '❓';
    let labelColor = 'text-foreground';

    if (data.type === 'udm-pro') {
        borderColor = 'border-blue-600';
        icon = '🛡️'; // UDM Pro
        bgColor = 'bg-blue-950/30';
    } else if (data.type === 'fortigate') {
        borderColor = 'border-orange-600';
        icon = '🧱'; // FortiGate
        bgColor = 'bg-orange-950/30';
    } else if (data.type === 'switch-cisco') {
        borderColor = 'border-cyan-600';
        icon = '🔀';
        bgColor = 'bg-cyan-950/30';
    } else if (data.type === 'server') {
        borderColor = 'border-slate-500';
        icon = '🖥️'; // Rack server
        bgColor = 'bg-slate-900';
        labelColor = 'text-slate-50';
    } else if (data.type === 'storage') {
        borderColor = 'border-slate-400';
        icon = '💾'; // NAS
    } else if (isRouter) {
        borderColor = 'border-blue-500';
        icon = '🌐';
    } else if (isSwitch) {
        borderColor = 'border-green-500';
        icon = '🔀';
    } else if (isPC) {
        if (data.compromised) {
            borderColor = 'border-red-500';
            bgColor = 'bg-red-500/10';
            icon = '💀';
        } else if (data.label === 'Kali Linux' || data.isAttacker) {
            borderColor = 'border-red-600';
            bgColor = 'bg-zinc-950';
            labelColor = 'text-red-500';
            icon = '🐉';
        } else {
            icon = '💻';
        }
    }

    if (selected) {
        borderColor = 'border-primary';
    }

    return (
        <div className={`px-2 py-1 shadow-sm rounded-md bg-card border ${borderColor} ${bgColor} ${labelColor} min-w-[90px] text-center relative`}>
            {/* Target Handles (Input) */}
            {(isSwitch || isPC) && (
                <Handle
                    type="target"
                    position={Position.Top}
                    isConnectable={isConnectable}
                    className="w-2 h-2 !bg-muted-foreground !border-0 rounded-full"
                    style={{ top: '-4px' }}
                />
            )}

            <div className="flex flex-col items-center">
                <div className="text-lg mb-0.5 leading-none">{icon}</div>
                <div className="font-bold text-[10px] leading-tight">{data.label}</div>
                {data.ip && <div className="text-[8px] text-muted-foreground leading-tight">{data.ip}</div>}
            </div>

            {/* Source Handles (Output) */}
            {(isRouter || isSwitch) && (
                <Handle
                    type="source"
                    position={Position.Bottom}
                    isConnectable={isConnectable}
                    className="w-2 h-2 !bg-muted-foreground !border-0 rounded-full"
                    style={{ bottom: '-4px' }}
                />
            )}

            {/* Status Indicators */}
            <div className="absolute -top-1.5 -right-1.5 flex gap-0.5">
                {data.idsEnabled && (
                    <span className="flex h-3 w-3 items-center justify-center rounded-full bg-blue-500 text-[8px] text-white" title="IDS Enabled">
                        🛡️
                    </span>
                )}
                {data.firewallRules && data.firewallRules.length > 0 && (
                    <span className="flex h-3 w-3 items-center justify-center rounded-full bg-orange-500 text-[8px] text-white" title="Firewall Active">
                        🧱
                    </span>
                )}
            </div>
        </div>
    );
};

export default memo(CustomNode);
