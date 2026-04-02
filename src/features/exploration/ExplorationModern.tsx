import React from 'react';

interface ApiExplorationProps {
  fen?: string;
  onExit?: () => void;
  boardOrientation?: 'white' | 'black';
}

// Stub component - to be implemented or removed during refactor
export function ApiExploration(_props: ApiExplorationProps) {
  return (
    <div>
      <p>API Exploration feature not yet implemented.</p>
    </div>
  );
}
