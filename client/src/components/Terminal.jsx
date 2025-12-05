import React, { useState, useEffect, useRef } from 'react';

const KALI_LOGO = `
  (       (      (             )  
  )\\      )\\     )\\         ( /(  
(((_)    ((_)   ((_)  (     )\\()) 
)\\___    _      _     )\\   ((_)\\  
((/ __|  | |    | |   ((_)   | |(_) 
 | (__   | |__  | |  / _ \\   | |    
  \\___|  |____| |_|  \\___/   |_|    
                                    
`;

const CISCO_BANNER = `
Cisco IOS Software, C9200L Software (C9200L-UNIVERSALK9-M), Version 17.3.3, RELEASE SOFTWARE (fc2)
Technical Support: http://www.cisco.com/techsupport
Copyright (c) 1986-2023 by Cisco Systems, Inc.

Press RETURN to get started!
`;

const MAN_PAGES = {
    nmap: `NAME
    nmap - Network exploration tool and security / port scanner

SYNOPSIS
    nmap [Scan Type(s)] [Options] {target specification}

DESCRIPTION
    Nmap ("Network Mapper") is an open source tool for network exploration and security auditing.
    
EXAMPLES
    nmap 192.168.1.1       Scan a single target
    
EDUCATIONAL NOTE
    In this sim, nmap reveals open ports on target nodes.
`,
    ping: `NAME
    ping - send ICMP ECHO_REQUEST to network hosts

SYNOPSIS
    ping [destination]

DESCRIPTION
    Ping is used to test the reachability of a host on an Internet Protocol (IP) network.
`,
    hydra: `NAME
    hydra - a very fast network logon cracker

SYNOPSIS
    bruteforce <service> <target>

DESCRIPTION
    Hydra is a parallelized login cracker which supports numerous protocols to attack.
    (Simulated as 'bruteforce' command in this app)
`,
    metasploit: `NAME
    metasploit - penetration testing software

SYNOPSIS
    exploit <service> <target>

DESCRIPTION
    The Metasploit Framework is a tool for developing and executing exploit code against a remote target machine.
    (Simulated as 'exploit' command in this app)
`
};

export default function Terminal({ node, onCommand, onClose }) {
    const isKali = node?.data?.label?.toLowerCase().includes('kali') || node?.data?.type === 'attacker';
    const isCisco = node?.data?.type === 'switch-cisco';

    // Cisco IOS State
    const [iosMode, setIosMode] = useState('user'); // 'user' (>), 'priv' (#), 'config' ((config)#)
    const [hostname, setHostname] = useState('Switch');

    const [history, setHistory] = useState([
        `Welcome to ${node.data.label} Terminal`,
        isKali ? KALI_LOGO : '',
        'Type "help" for available commands.',
    ]);
    const [input, setInput] = useState('');
    const bottomRef = useRef(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [history]);

    useEffect(() => {
        if (isCisco) {
            setHistory([CISCO_BANNER]);
        } else {
            setHistory([
                `Welcome to ${node.data.label} Terminal`,
                isKali ? KALI_LOGO : '',
                'Type "help" for available commands.',
            ]);
        }
    }, [node.id, isKali, isCisco]);

    const getPrompt = () => {
        if (isKali) return '┌──(kali㉿kali)-[~]\n└─$';
        if (isCisco) {
            if (iosMode === 'config') return `${hostname}(config)#`;
            if (iosMode === 'priv') return `${hostname}#`;
            return `${hostname}>`;
        }
        return '>';
    };

    const handleKeyDown = async (e) => {
        if (e.key === 'Enter') {
            const cmd = input.trim();

            // Render the command in history
            setHistory((prev) => [...prev, `${getPrompt()} ${cmd}`]);
            setInput('');

            if (!cmd) return;

            // --- CISCO IOS LOGIC ---
            if (isCisco) {
                const parts = cmd.split(' ');
                const c = parts[0].toLowerCase();
                let output = '';

                if (iosMode === 'user') {
                    if (['en', 'enable'].includes(c)) {
                        setIosMode('priv');
                    } else if (['help', '?'].includes(c)) {
                        output = 'Exec commands:\n  enable  Turn on privileged commands\n  exit    Exit from the EXEC\n  ping    Send echo messages\n  show    Show running system information';
                    } else if (c === 'show' && parts[1] === 'version') {
                        output = 'Cisco IOS Software, C9200L Software (C9200L-UNIVERSALK9-M), Version 17.3.3';
                    } else if (c === 'show') {
                        output = '% Incomplete command.';
                    } else if (['exit', 'quit'].includes(c)) {
                        onClose();
                    } else {
                        output = '% Unknown command or computer name, or unable to find computer address';
                    }
                } else if (iosMode === 'priv') {
                    if (['conf', 'configure'].includes(c)) {
                        if (parts[1]?.startsWith('t')) {
                            setIosMode('config');
                            output = 'Enter configuration commands, one per line.  End with CNTL/Z.';
                        } else {
                            output = '% Incomplete command.';
                        }
                    } else if (['disable', 'exit'].includes(c)) {
                        setIosMode('user');
                    } else if (c === 'show') {
                        if (parts[1] === 'vlan') {
                            output = `
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi1/0/1, Gi1/0/2, Gi1/0/3
10   Data                             active    
20   Voice                            active    
`;
                        } else if (parts[1] === 'ip' && parts[2] === 'int' && parts[3] === 'brief') {
                            output = `
Interface              IP-Address      OK? Method Status                Protocol
Vlan1                  ${node.data.ip || 'unassigned'}    YES NVRAM  up                    up      
GigabitEthernet1/0/1   unassigned      YES unset  up                    up      
GigabitEthernet1/0/2   unassigned      YES unset  up                    up      
GigabitEthernet1/0/3   unassigned      YES unset  up                    up      
`;
                        } else if (parts[1] === 'run' || parts[1] === 'running-config') {
                            output = `Building configuration...
Current configuration : 1584 bytes
!
version 17.3
!
hostname ${hostname}
!
interface GigabitEthernet1/0/1
 switchport mode access
!
interface Vlan1
 ip address ${node.data.ip} 255.255.255.0
!
end`;
                        } else {
                            output = '% Incomplete command.';
                        }
                    } else if (c === 'wr' || c === 'write') {
                        output = 'Building configuration...\n[OK]';
                    } else {
                        output = '% Unknown command or computer name, or unable to find computer address';
                    }
                } else if (iosMode === 'config') {
                    if (['exit', 'end'].includes(c)) {
                        setIosMode('priv');
                        output = '%SYS-5-CONFIG_I: Configured from console by console';
                    } else if (c === 'hostname') {
                        if (parts[1]) {
                            setHostname(parts[1]);
                            output = ''; // Hostname updates prompt immediately
                        } else {
                            output = '% Incomplete command.';
                        }
                    } else if (c === 'vlan') {
                        output = '% VLAN configuration created';
                    } else if (c === 'int' || c === 'interface') {
                        output = ''; // Just simple simulation, we don't change sub-mode yet to keep it simple
                    } else {
                        output = ''; // Simulate accepting config
                    }
                }

                if (output) {
                    setHistory(prev => [...prev, output]);
                }
                return;
            }

            // --- STANDARD/KALI LOGIC ---
            // Process command
            const args = cmd.split(' ');
            const command = args[0].toLowerCase();

            let response = '';

            switch (command) {
                case 'help':
                    response = `Available commands:
                    
EDUCATIONAL:
  man <tool>              - Read the manual for a tool (e.g., 'man nmap')

BASIC NETWORK:
  ipconfig                - Show interface config
  ping <ip>               - Test connectivity
  nmap <ip>               - Port scanner

OFFENSIVE (Red Team):
  exploit <service> <ip>  - Exploit vulnerable services (Metasploit sim)
  ddos <ip>               - Launch packet flood
  bruteforce ssh <ip>     - Crack SSH passwords
  sniff                   - Packet sniffer (Wireshark sim)

DEFENSIVE (Blue Team):
  ids <enable|disable>    - Snort IDS control
  patch <service>         - Apply security patches
  firewall <block|allow>  - IPTables/Firewall control
  logs                    - View /var/log/auth.log`;
                    break;
                case 'man':
                    if (args[1]) {
                        const page = MAN_PAGES[args[1]];
                        if (page) {
                            response = page;
                        } else {
                            response = `No manual entry for ${args[1]}`;
                        }
                    } else {
                        response = 'What manual page do you want?';
                    }
                    break;
                case 'clear':
                    setHistory([]);
                    return;
                case 'ipconfig':
                    response = `
IP Address. . . . . : ${node.data.ip || 'Not set'}
Subnet Mask . . . . : ${node.data.subnet || 'Not set'}
Compromised . . . . : ${node.data.compromised ? 'YES (HACKED!)' : 'No'}
IDS Status. . . . . : ${node.data.idsEnabled ? 'ENABLED' : 'Disabled'}
Vulnerabilities . . : ${node.data.vulnerabilities?.join(', ') || 'None'}
`;
                    break;
                case 'ping':
                    if (args[1]) {
                        setHistory(prev => [...prev, `Pinging ${args[1]}...`]);
                        const result = await onCommand('ping', args[1]);
                        if (result) response = result;
                    } else {
                        response = 'Usage: ping <ip_address>';
                    }
                    break;
                case 'nmap':
                    if (args[1]) {
                        setHistory(prev => [...prev, `Starting Nmap scan on ${args[1]}...`]);
                        const result = await onCommand('nmap', args[1]);
                        if (result) response = result;
                    } else {
                        response = 'Usage: nmap <ip_address>\nType "man nmap" for more info.';
                    }
                    break;
                case 'exploit':
                case 'bruteforce':
                case 'firewall':
                    if (args[1] && args[2]) {
                        const result = await onCommand(command, args[1], args[2]);
                        if (result) response = result;
                    } else {
                        response = `Usage: ${command} requires 2 arguments\nType 'man ${command === 'bruteforce' ? 'hydra' : 'metasploit'}' for help.`;
                    }
                    break;
                case 'ddos':
                case 'ids':
                case 'patch':
                    if (args[1]) {
                        const result = await onCommand(command, args[1]);
                        if (result) response = result;
                    } else {
                        response = `Usage: ${command} <argument>`;
                    }
                    break;
                case 'sniff':
                case 'logs':
                    const result = await onCommand(command);
                    if (result) response = result;
                    break;
                default:
                    response = `'${command}' is not recognized. Type 'help' for available commands.`;
            }

            if (response) {
                setHistory((prev) => [...prev, response]);
            }
        }
    };

    return (
        <div className={`absolute bottom-4 right-4 w-[600px] h-[400px] bg-black text-green-400 font-mono text-sm rounded-lg shadow-xl border border-gray-700 flex flex-col overflow-hidden z-20 opacity-95 ${isKali ? 'border-t-4 border-t-blue-500' : ''} ${isCisco ? 'text-gray-200 bg-zinc-900 border-t-4 border-t-cyan-600' : ''}`}>
            <div className={`px-4 py-1 flex justify-between items-center border-b border-gray-700 ${isCisco ? 'bg-zinc-800' : 'bg-gray-800'}`}>
                <span className="text-xs text-gray-400 flex items-center gap-2">
                    {isKali && '🐉'} {isCisco && '🔀'} {node.data.label} - Terminal {isKali ? '(root@kali)' : ''} {isCisco ? '(Console)' : ''}
                </span>
                <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                {history.map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap mb-1">{line}</div>
                ))}
                <div ref={bottomRef} />
            </div>

            <div className="p-2 bg-gray-900 border-t border-gray-700 flex items-center">
                <span className={`mr-2 font-bold ${isKali ? 'text-blue-400' : 'text-green-400'} ${isCisco ? 'text-gray-300' : ''}`}>{getPrompt()}</span>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`flex-1 bg-transparent border-none outline-none focus:ring-0 ml-1 ${isCisco ? 'text-gray-200' : 'text-green-400'}`}
                    autoFocus
                    spellCheck="false"
                />
            </div>
        </div>
    );
}
