import React from 'react';
import { render, screen } from '@testing-library/react';
import { PlayerStatus } from './PlayerStatus';

describe('PlayerStatus Component', () => {
  const fullStatus = {
    name: 'magnus',
    rating: 1850,
    progress: 40,
    level: 3,
    achievements: ['First win', 'Ten streak'],
  };

  test('renders nothing when playerStatus is null', () => {
    const { container } = render(<PlayerStatus playerStatus={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders name, avatar initial and rating', () => {
    render(<PlayerStatus playerStatus={fullStatus} />);

    expect(screen.getByText('magnus')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByText('Rating: 1850')).toBeInTheDocument();
  });

  test('renders level and progress bar value', () => {
    render(<PlayerStatus playerStatus={fullStatus} />);

    expect(screen.getByText('Level 3 Progress')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40');
  });

  test('renders achievements as chips', () => {
    render(<PlayerStatus playerStatus={fullStatus} />);

    expect(screen.getByText('Achievements')).toBeInTheDocument();
    expect(screen.getByText('First win')).toBeInTheDocument();
    expect(screen.getByText('Ten streak')).toBeInTheDocument();
  });

  test('falls back to defaults for missing fields', () => {
    render(<PlayerStatus playerStatus={{}} />);

    expect(screen.getByText('Unknown Player')).toBeInTheDocument();
    expect(screen.getByText('U')).toBeInTheDocument();
    expect(screen.getByText('Rating: N/A')).toBeInTheDocument();
    expect(screen.getByText('Level 1 Progress')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.queryByText('Achievements')).not.toBeInTheDocument();
  });
});
