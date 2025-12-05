import React from 'react';

export default function NetworkingChallenges({ challenges, completedIds }) {
    const progress = Math.round((completedIds.length / challenges.length) * 100);

    return (
        <div className="w-full md:w-80 h-full border-l bg-card p-4 flex flex-col gap-4 overflow-y-auto">
            <div>
                <h3 className="text-xl font-bold mb-1">Training Modules</h3>
                <p className="text-sm text-muted-foreground">Complete tasks to master the basics.</p>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                    <span>Progress</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-green-500 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="space-y-3 mt-2">
                {challenges.map((challenge) => {
                    const isCompleted = completedIds.includes(challenge.id);
                    return (
                        <div
                            key={challenge.id}
                            className={`p-3 rounded-lg border transition-all ${isCompleted
                                    ? 'bg-green-500/10 border-green-500/50'
                                    : 'bg-card hover:bg-accent/50'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`mt-1 h-5 w-5 rounded-full flex items-center justify-center text-xs border ${isCompleted
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'border-muted-foreground text-muted-foreground'
                                    }`}>
                                    {isCompleted ? '✓' : challenge.id}
                                </div>
                                <div>
                                    <h4 className={`font-medium ${isCompleted ? 'text-green-600' : ''}`}>
                                        {challenge.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {challenge.desc}
                                    </p>
                                    {isCompleted && (
                                        <div className="text-xs text-green-600 mt-2 font-medium">
                                            Completed!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
