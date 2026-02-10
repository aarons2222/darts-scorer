'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameSettings } from '@/types/game';
import { createOrGetPlayer, createMatch, createLeg } from '@/utils/database';
import { generatePlayerId } from '@/utils/gameLogic';

const STARTING_SCORES = [101, 301, 501, 701, 1001];

export default function SetupPage() {
  const router = useRouter();
  const [players, setPlayers] = useState([
    { id: generatePlayerId(), name: '', startingScore: 501 },
    { id: generatePlayerId(), name: '', startingScore: 501 }
  ]);
  const [numberOfLegs, setNumberOfLegs] = useState(1);
  const [numberOfSets, setNumberOfSets] = useState<number | undefined>(undefined);
  const [customScore, setCustomScore] = useState('');
  const [showCustomScore, setShowCustomScore] = useState<string>('');

  const addPlayer = () => {
    setPlayers([...players, { 
      id: generatePlayerId(), 
      name: '', 
      startingScore: 501 
    }]);
  };

  const removePlayer = (index: number) => {
    if (players.length > 2) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const updatePlayer = (index: number, field: 'name' | 'startingScore', value: string | number) => {
    const updated = [...players];
    updated[index] = { ...updated[index], [field]: value };
    setPlayers(updated);
  };

  const handleCustomScore = (playerIndex: string, score: string) => {
    const numScore = parseInt(score);
    if (numScore > 0 && numScore <= 9999) {
      updatePlayer(parseInt(playerIndex), 'startingScore', numScore);
    }
    setShowCustomScore('');
    setCustomScore('');
  };

  const startMatch = async () => {
    // Validate
    const hasEmptyNames = players.some(p => p.name.trim() === '');
    if (hasEmptyNames) {
      alert('Please enter names for all players');
      return;
    }

    try {
      // Create or get players in database
      const dbPlayers = await Promise.all(
        players.map(p => createOrGetPlayer(p.name.trim()))
      );

      const gameSettings: GameSettings = {
        numberOfLegs,
        numberOfSets,
        players: dbPlayers.map((dbPlayer, index) => ({
          id: dbPlayer.id,
          name: dbPlayer.name,
          startingScore: players[index].startingScore,
        })),
      };

      // Create match in database
      const match = await createMatch({
        numberOfLegs,
        numberOfSets,
        players: gameSettings.players,
      });

      // Create the first leg
      await createLeg(match.id, 1, 1);

      router.push('/game');
    } catch (error) {
      console.error('Failed to start match:', error);
      alert('Failed to start match. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-darts-dark via-darts-navy to-darts-accent">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">🎯 Match Setup</h1>
            <p className="text-gray-300">Configure your darts match</p>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
            {/* Players Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Players</h2>
              
              <div className="space-y-4">
                {players.map((player, index) => (
                  <div key={player.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-white">Player {index + 1}</h3>
                      {players.length > 2 && (
                        <button
                          onClick={() => removePlayer(index)}
                          className="text-darts-red hover:text-red-400 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Player name"
                        value={player.name}
                        onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-darts-green"
                      />
                      
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Starting Score</label>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          {STARTING_SCORES.map(score => (
                            <button
                              key={score}
                              onClick={() => updatePlayer(index, 'startingScore', score)}
                              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                player.startingScore === score
                                  ? 'bg-darts-green text-white'
                                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
                              }`}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Custom"
                            value={showCustomScore === index.toString() ? customScore : ''}
                            onChange={(e) => setCustomScore(e.target.value)}
                            onFocus={() => setShowCustomScore(index.toString())}
                            onBlur={() => {
                              if (customScore) handleCustomScore(index.toString(), customScore);
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && customScore) {
                                handleCustomScore(index.toString(), customScore);
                              }
                            }}
                            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-darts-green"
                          />
                          {showCustomScore !== index.toString() && (
                            <div className="px-3 py-2 bg-white/5 rounded-lg text-gray-300 text-sm border border-white/10">
                              {player.startingScore}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {players.length < 8 && (
                  <button
                    onClick={addPlayer}
                    className="w-full py-3 border-2 border-dashed border-white/30 rounded-lg text-gray-300 hover:border-white/50 hover:text-white transition-colors"
                  >
                    + Add Player
                  </button>
                )}
              </div>
            </div>

            {/* Match Format */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Match Format</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Sets</label>
                  <select
                    value={numberOfSets || 'none'}
                    onChange={(e) => setNumberOfSets(e.target.value === 'none' ? undefined : parseInt(e.target.value))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-darts-green"
                  >
                    <option value="none">No Sets (Just Legs)</option>
                    <option value={1}>Best of 1 Set</option>
                    <option value={3}>Best of 3 Sets</option>
                    <option value={5}>Best of 5 Sets</option>
                    <option value={7}>Best of 7 Sets</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Legs</label>
                  <select
                    value={numberOfLegs}
                    onChange={(e) => setNumberOfLegs(parseInt(e.target.value))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-darts-green"
                  >
                    <option value={1}>Best of 1 Leg</option>
                    <option value={3}>Best of 3 Legs</option>
                    <option value={5}>Best of 5 Legs</option>
                    <option value={7}>Best of 7 Legs</option>
                    <option value={9}>Best of 9 Legs</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-4 rounded-lg font-semibold transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={startMatch}
                disabled={players.some(p => p.name.trim() === '')}
                className="flex-1 bg-darts-green hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold transition-colors duration-200"
              >
                Start Match
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}