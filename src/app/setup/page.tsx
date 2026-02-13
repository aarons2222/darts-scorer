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
    <div className="min-h-screen bg-darts-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-dartboard-cream mb-2 font-mono">🎯 MATCH SETUP</h1>
            <p className="text-dartboard-cream/70">Configure your darts match</p>
          </div>

          <div className="bg-darts-surface border-2 border-darts-border rounded-lg p-6">
            {/* Players Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-dartboard-cream mb-4 font-mono">PLAYERS</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {players.map((player, index) => (
                  <div key={player.id} className="bg-darts-background border border-darts-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-dartboard-cream font-mono">PLAYER {index + 1}</h3>
                      {players.length > 2 && (
                        <button
                          onClick={() => removePlayer(index)}
                          className="text-dartboard-red hover:text-red-300 text-sm font-mono"
                        >
                          REMOVE
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="PLAYER NAME"
                        value={player.name}
                        onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                        className="w-full bg-darts-surface border-2 border-darts-border rounded-lg px-4 py-3 text-dartboard-cream placeholder-dartboard-cream/40 focus:outline-none focus:border-dartboard-red font-mono"
                      />
                      
                      <div>
                        <label className="block text-dartboard-cream/70 text-sm mb-2 font-mono">STARTING SCORE</label>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          {STARTING_SCORES.map(score => (
                            <button
                              key={score}
                              onClick={() => updatePlayer(index, 'startingScore', score)}
                              className={`py-2 px-3 rounded border-2 text-sm font-bold transition-colors font-mono ${
                                player.startingScore === score
                                  ? 'bg-dartboard-red border-dartboard-red text-dartboard-cream'
                                  : 'bg-darts-surface border-darts-border text-dartboard-cream hover:bg-darts-border'
                              }`}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="CUSTOM"
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
                            className="flex-1 bg-darts-surface border-2 border-darts-border rounded px-3 py-2 text-dartboard-cream placeholder-dartboard-cream/40 text-sm focus:outline-none focus:border-dartboard-red font-mono"
                          />
                          {showCustomScore !== index.toString() && (
                            <div className="px-3 py-2 bg-darts-surface rounded text-dartboard-cream text-sm border-2 border-darts-border font-mono font-bold">
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
                    className="w-full py-3 border-2 border-dashed border-darts-border rounded-lg text-dartboard-cream/70 hover:border-dartboard-red hover:text-dartboard-cream transition-colors font-mono font-bold"
                  >
                    + ADD PLAYER
                  </button>
                )}
              </div>
            </div>

            {/* Match Format */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-dartboard-cream mb-4 font-mono">MATCH FORMAT</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-dartboard-cream/70 text-sm mb-2 font-mono">SETS</label>
                  <select
                    value={numberOfSets || 'none'}
                    onChange={(e) => setNumberOfSets(e.target.value === 'none' ? undefined : parseInt(e.target.value))}
                    className="w-full bg-darts-surface border-2 border-darts-border rounded px-4 py-3 text-dartboard-cream focus:outline-none focus:border-dartboard-red font-mono"
                  >
                    <option value="none">No Sets (Just Legs)</option>
                    <option value={1}>Best of 1 Set</option>
                    <option value={3}>Best of 3 Sets</option>
                    <option value={5}>Best of 5 Sets</option>
                    <option value={7}>Best of 7 Sets</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-dartboard-cream/70 text-sm mb-2 font-mono">LEGS</label>
                  <select
                    value={numberOfLegs}
                    onChange={(e) => setNumberOfLegs(parseInt(e.target.value))}
                    className="w-full bg-darts-surface border-2 border-darts-border rounded px-4 py-3 text-dartboard-cream focus:outline-none focus:border-dartboard-red font-mono"
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
                className="flex-1 button-secondary py-4 font-mono"
              >
                CANCEL
              </button>
              <button
                onClick={startMatch}
                disabled={players.some(p => p.name.trim() === '')}
                className="flex-1 button-primary py-4 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
              >
                START MATCH
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}