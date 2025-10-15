import React from 'react';
import { SubType } from '../types';

interface WelcomeScreenProps {
    onSelect: (type: SubType) => void;
    onLoginClick: () => void;
}

const SelectionScreen: React.FC<WelcomeScreenProps> = ({ onSelect, onLoginClick }) => {
    return (
        <div
            className="flex-1 flex flex-col justify-center items-center p-6 h-full bg-cover bg-center relative"
            style={{ backgroundImage: `url('https://ik.imagekit.io/7grri5v7d/indo%20street%20massage.png?updatedAt=1760119669463')` }}
        >
            <div className="absolute inset-0 bg-black/60 z-0" />
            <div className="relative z-10 w-full flex flex-col justify-center items-center">
                <div className="w-full text-center mb-10">
                    <h1 className="text-4xl font-bold text-white">
                        Indo<span className="text-orange-500">street</span>
                    </h1>
                    <p className="text-slate-400 mt-2">Massage Members Hub</p>
                </div>
                <div className="w-full max-w-md flex flex-col space-y-6">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-white">
                            Join the Hub
                        </h2>
                        <p className="text-slate-300 mt-2">First, tell us what you do.</p>
                    </div>
                    <SelectionCard
                        title="Massage Therapist"
                        description="I offer home services."
                        onClick={() => onSelect(SubType.HomeService)}
                    />
                    <SelectionCard
                        title="Massage Place"
                        description="I manage a business / spa location."
                        onClick={() => onSelect(SubType.Place)}
                    />
                </div>
                <div className="mt-8 text-center">
                    <button 
                        onClick={onLoginClick} 
                        className="text-sm text-orange-500 hover:underline"
                    >
                        Already have an account? Sign In
                    </button>
                </div>
            </div>
        </div>
    );
}

const SelectionCard: React.FC<{title: string; description: string; onClick: () => void;}> = ({ title, description, onClick }) => (
    <div
        onClick={onClick}
        className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/80 p-8 rounded-2xl text-center cursor-pointer hover:border-orange-500/70 transition-all duration-300"
    >
        <h3 className="text-xl font-bold text-orange-500">{title}</h3>
        <p className="text-slate-400 mt-2">{description}</p>
    </div>
);


export default SelectionScreen;