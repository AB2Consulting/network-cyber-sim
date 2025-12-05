import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const NetworkingChallenges = ({ challenges, completedIds }) => {
    return (
        <div className="w-full md:w-[350px] bg-card border rounded-lg p-4 h-full overflow-y-auto">
            <h3 className="font-bold text-xl mb-4">Missions</h3>
            <div className="space-y-4">
                {challenges.map((challenge) => {
                    const isCompleted = completedIds.includes(challenge.id);
                    return (
                        <div
                            key={challenge.id}
                            className={`p-4 rounded-lg border transition-all ${isCompleted ? 'bg-green-500/10 border-green-500/50' : 'bg-muted/50 border-border'}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <Circle className="w-5 h-5 text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <h4 className={`font-medium ${isCompleted ? 'text-green-500' : ''}`}>
                                        {challenge.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {challenge.desc}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default NetworkingChallenges;
