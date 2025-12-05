import { useState, useEffect } from 'react'
import NetworkingBasics from './components/NetworkingBasics'
import RedBlueGame from './components/RedBlueGame'
import EducationalHub from './components/EducationalHub'
import HardwareLab from './components/HardwareLab'
import { useTheme } from './contexts/ThemeContext'

function App() {
    const { theme, toggleTheme } = useTheme()
    const [isConnected, setIsConnected] = useState(false)
    const [currentView, setCurrentView] = useState('home') // 'home', 'networking', 'redblue', 'education'

    // Mock connection status
    useEffect(() => {
        setIsConnected(true)
    }, [])

    const renderContent = () => {
        if (currentView === 'education') {
            return (
                <EducationalHub
                    onNavigate={(view) => setCurrentView(view)}
                    onBack={() => setCurrentView('home')}
                />
            )
        }

        if (currentView === 'networking_basics') {
            return <NetworkingBasics onBack={() => setCurrentView('education')} />
        }

        if (currentView === 'hardware_lab') {
            return <HardwareLab onBack={() => setCurrentView('education')} />
        }

        if (currentView === 'security_ops') {
            return (
                <div className="w-full max-w-6xl space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-bold">Security Operations Center</h2>
                        <button
                            onClick={() => setCurrentView('education')}
                            className="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                        >
                            Back to Hub
                        </button>
                    </div>
                    <RedBlueGame />
                </div>
            )
        }

        if (currentView === 'networking') { // Backward compatibility just in case
            return <NetworkingBasics onBack={() => setCurrentView('home')} />
        }

        if (currentView === 'redblue') { // Backward compatibility
            return (
                <div className="w-full max-w-6xl space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-bold">Red vs Blue</h2>
                        <button
                            onClick={() => setCurrentView('home')}
                            className="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                        >
                            Back to Home
                        </button>
                    </div>
                    <RedBlueGame />
                </div>
            )
        }

        // Home View
        return (
            <div className="max-w-4xl w-full space-y-8 text-center">
                <h1 className="text-6xl font-bold tracking-tighter bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                    NetSim: Cyber Range
                </h1>

                <p className="text-xl text-muted-foreground">
                    Advanced Networking & Cybersecurity Simulation Platform
                </p>

                <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="flex items-center justify-center space-x-4">
                        <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="font-medium">
                            Server Status: {isConnected ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 mt-12 max-w-2xl mx-auto">
                    <div
                        onClick={() => setCurrentView('education')}
                        className="p-8 rounded-xl border bg-card hover:bg-accent/50 transition-colors cursor-pointer group shadow-lg"
                    >
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎓</div>
                        <h3 className="text-3xl font-bold mb-2 group-hover:text-blue-400 transition-colors">Enter Academy</h3>
                        <p className="text-muted-foreground text-lg">
                            Access Network Basics, Hardware Labs, and Red vs Blue scenarios.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative">
            <button
                onClick={toggleTheme}
                className="absolute top-4 right-4 p-2 rounded-lg bg-secondary hover:bg-accent transition-colors"
                aria-label="Toggle theme"
            >
                {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {renderContent()}
        </div>
    )
}

export default App
