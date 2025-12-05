import React from 'react';

const EducationalHub = ({ onNavigate, onBack }) => {
    return (
        <div className="flex flex-col gap-8 w-full max-w-6xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                        Cyber Security Academy
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Select a module to begin your training.
                    </p>
                </div>
                <button
                    onClick={onBack}
                    className="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                >
                    Back to Main Menu
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Module 1: Basics */}
                <div
                    onClick={() => onNavigate('networking_basics')}
                    className="group p-6 rounded-xl border bg-card hover:bg-accent/50 transition-all cursor-pointer shadow-sm hover:shadow-md h-[250px] flex flex-col"
                >
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform w-fit">🌐</div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors">Network Fundamentals</h3>
                    <p className="text-muted-foreground text-sm flex-1">
                        Learn the basics of IP addressing, connectivity checks (Ping), and port scanning (Nmap).
                    </p>
                    <div className="mt-4 text-xs font-mono text-blue-500">Status: AVAILABLE</div>
                </div>

                {/* Module 2: Hardware */}
                <div
                    onClick={() => onNavigate('hardware_lab')}
                    className="group p-6 rounded-xl border bg-card hover:bg-accent/50 transition-all cursor-pointer shadow-sm hover:shadow-md h-[250px] flex flex-col"
                >
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform w-fit">🔌</div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-green-400 transition-colors">Hardware Lab</h3>
                    <p className="text-muted-foreground text-sm flex-1">
                        Virtual Rack Environment. Configure Cisco Switches, Fortinet Firewalls, and Rack Servers.
                    </p>
                    <div className="mt-4 text-xs font-mono text-green-500">Status: NEW!</div>
                </div>

                {/* Module 3: Red vs Blue */}
                <div
                    onClick={() => onNavigate('security_ops')}
                    className="group p-6 rounded-xl border bg-card hover:bg-accent/50 transition-all cursor-pointer shadow-sm hover:shadow-md h-[250px] flex flex-col"
                >
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform w-fit">⚔️</div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-red-400 transition-colors">Security Operations</h3>
                    <p className="text-muted-foreground text-sm flex-1">
                        Red Team vs Blue Team. Launch attacks with Kali Linux or defend with IDS/Firewalls.
                    </p>
                    <div className="mt-4 text-xs font-mono text-red-500">Status: ADVANCED</div>
                </div>
            </div>

            <div className="mt-8 p-6 bg-secondary/20 rounded-lg border border-dashed">
                <h3 className="font-bold mb-2">🎓 Learning Path</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground overflow-x-auto pb-2">
                    <span className="flex items-center gap-2 text-foreground font-medium"><span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">1</span> Basics</span>
                    <span>→</span>
                    <span className="flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs border">2</span> CLI Mastery</span>
                    <span>→</span>
                    <span className="flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs border">3</span> Offensive Ops</span>
                    <span>→</span>
                    <span className="flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs border">4</span> Defensive Eng</span>
                </div>
            </div>
        </div>
    );
};

export default EducationalHub;
