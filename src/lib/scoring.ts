/**
 * Calculates a team's score based on the following rules:
 * +1 for every challenge completed
 * +2 extra for every Bingo
 * +2 extra for every challenge completed by NO OTHER team
 */
export const calculateTeamScore = (
  teamId: string,
  allProgress: any[], // TeamProgress[]
  allChallenges: any[], // Challenge[]
  teamIds: string[],
  scoringParams: { square: number, bingo: number, unique: number }
) => {
  // Sort challenges by position to ensure 0-24 index alignment
  const sortedChallenges = [...allChallenges].sort((a, b) => a.position - b.position);
  const teamProgress = allProgress.filter((p) => p.team_id === teamId);
  const completedChallengeIds = teamProgress.map((p) => p.challenge_id);

  // 1. Base Score: +pointsPerSquare per challenge
  let score = completedChallengeIds.length * scoringParams.square;

  // 2. Bingo Bonus: +pointsPerBingo per Bingo
  const bingoPatterns = [
    [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
    [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
    [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
  ];

  let bingoCount = 0;
  bingoPatterns.forEach((pattern) => {
    if (pattern.every((pos) => {
        const challenge = sortedChallenges[pos];
        return challenge && (challenge.is_free_space || completedChallengeIds.includes(challenge.id));
    })) {
      bingoCount++;
    }
  });
  score += bingoCount * scoringParams.bingo;

  // 3. Uniqueness Bonus: +pointsPerUnique per challenge no one else completed
  completedChallengeIds.forEach((cId) => {
    const isCompletedByOthers = allProgress.some((p) => p.challenge_id === cId && p.team_id !== teamId);
    if (!isCompletedByOthers) {
      score += scoringParams.unique;
    }
  });

  return score;
};
