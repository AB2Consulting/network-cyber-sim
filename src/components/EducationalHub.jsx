import React from 'react';

export default function EducationalHub({ onNavigate, onBack }) {
    return (
        <div className="flex flex-col h-full w-full max-w-6xl mx-auto space-y-8 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Educational Hub</h1>
                    <p className="text-muted-foreground mt-2">Select a training module to begin your journey.</p>
                </div>
                <button
                    onClick={onBack}
                    className="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                >
                    Back to Home
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Module 1: Network Basics */}
                <div
                    onClick={() => onNavigate('networking_basics')}
                    className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 cursor-pointer"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative space-y-4">
                        <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-2xl">
                            🌐
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Network Fundamentals</h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                Learn the basics of CLI, IP addressing, ping, and nmap scanning. Start here if you are new!
                            </p>
                        </div>
                        <div className="text-xs font-semibold text-blue-500 flex items-center gap-1">
                            START MODULE <span>→</span>
                        </div>
                    </div>
                </div>

                {/* Module 2: Hardware Lab */}
                <div
                    onClick={() => onNavigate('hardware_lab')}
                    className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-orange-500/50 cursor-pointer"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative space-y-4">
                        <div className="h-12 w-12 rounded-lg bg-orange-500/20 flex items-center justify-center text-2xl">
                            🔌
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Hardware Lab</h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                Virtual Rack: Configure UDM Pro, FortiGate, Cisco Switches, and Dell Servers.
                            </p>
                        </div>
                        <div className="text-xs font-semibold text-orange-500 flex items-center gap-1">
                            ENTER LAB <span>→</span>
                        </div>
                    </div>
                </div>

                {/* Module 3: Security Ops */}
                <div
                    onClick={() => onNavigate('security_ops')}
                    className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-red-500/50 cursor-pointer"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative space-y-4">
                        <div className="h-12 w-12 rounded-lg bg-red-500/20 flex items-center justify-center text-2xl">
                            🛡️
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Security Ops</h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                Red vs Blue scenarios. Use Kali tools to exploit and FortiGate/PFSense to defend.
                            </p>
                        </div>
                        <div className="text-xs font-semibold text-red-500 flex items-center gap-1">
                            DEPLOY <span>→</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 p-6 rounded-lg border bg-muted/30">
                <h3 className="text-lg font-semibold mb-2">My Certification Progress</h3>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full w-[0%] transition-all" style={{ width: '15%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Level 1: Script Kiddie (15%)</p>
            </div>
        </div>
    );
}
