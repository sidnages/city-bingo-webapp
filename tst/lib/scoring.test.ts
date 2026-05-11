import { describe, it, expect } from 'vitest';
import { calculateTeamScore } from '../../src/lib/scoring';

describe('Scoring Logic', () => {
  const scoringParams = { square: 1, bingo: 2, unique: 2 };
  
  // Generate 25 challenges
  const challenges = Array.from({ length: 25 }, (_, i) => ({
    id: `c${i}`,
    position: i,
    is_free_space: i === 12
  }));

  it('calculates base score correctly (squares only)', () => {
    const progress = [
      { team_id: 't1', challenge_id: 'c0' },
      { team_id: 't1', challenge_id: 'c1' }
    ];
    // t2 also completed c0, so c0 is not unique. c1 is unique.
    const allProgress = [
      ...progress,
      { team_id: 't2', challenge_id: 'c0' }
    ];

    // Score: 2 squares (2 pts) + 1 unique (2 pts) = 4 pts
    const score = calculateTeamScore('t1', allProgress, challenges, scoringParams);
    expect(score).toBe(4);
  });

  it('awards bingo bonus correctly', () => {
    // Top row: 0, 1, 2, 3, 4
    const progress = [
      { team_id: 't1', challenge_id: 'c0' },
      { team_id: 't1', challenge_id: 'c1' },
      { team_id: 't1', challenge_id: 'c2' },
      { team_id: 't1', challenge_id: 'c3' },
      { team_id: 't1', challenge_id: 'c4' }
    ];
    // All completed by others to remove unique bonus for simplicity
    const allProgress = [
      ...progress,
      { team_id: 't2', challenge_id: 'c0' },
      { team_id: 't2', challenge_id: 'c1' },
      { team_id: 't2', challenge_id: 'c2' },
      { team_id: 't2', challenge_id: 'c3' },
      { team_id: 't2', challenge_id: 'c4' }
    ];

    // Score: 5 squares (5 pts) + 1 bingo (2 pts) + 0 unique = 7 pts
    const score = calculateTeamScore('t1', allProgress, challenges, scoringParams);
    expect(score).toBe(7);
  });

  it('awards bingo bonus using free space', () => {
    // Middle row has free space at 12. 
    // Middle row indices: 10, 11, 12(FREE), 13, 14
    const progress = [
      { team_id: 't1', challenge_id: 'c10' },
      { team_id: 't1', challenge_id: 'c11' },
      { team_id: 't1', challenge_id: 'c13' },
      { team_id: 't1', challenge_id: 'c14' }
    ];
    const allProgress = [
      ...progress,
      ...progress.map(p => ({ ...p, team_id: 't2' }))
    ];

    // Score: 4 squares (4 pts) + 1 bingo (2 pts) = 6 pts
    const score = calculateTeamScore('t1', allProgress, challenges, scoringParams);
    expect(score).toBe(6);
  });

  it('calculates bonus challenges correctly', () => {
    const bonusChallenges = [
      { id: 'b1', points: 5 },
      { id: 'b2', points: 10 }
    ];
    const bonusProgress = [
      { team_id: 't1', bonus_challenge_id: 'b1' }
    ];

    // 0 regular progress
    const score = calculateTeamScore('t1', [], challenges, scoringParams, bonusProgress, bonusChallenges);
    expect(score).toBe(5);
  });

  it('awards unique bonus correctly', () => {
    const allProgress = [
      { team_id: 't1', challenge_id: 'c0' }, // unique
      { team_id: 't2', challenge_id: 'c1' }  // t1 didn't do this
    ];

    // Score: 1 square (1 pt) + 1 unique (2 pts) = 3 pts
    const score = calculateTeamScore('t1', allProgress, challenges, scoringParams);
    expect(score).toBe(3);
  });
});
