import { getRatingStatus, type Experience } from '@/features/experiences/types';

function makeExperience(ratings: Experience['ratings']): Experience {
  return {
    id: 'exp-1',
    title: 'Cena de prueba',
    status: 'completed',
    createdBy: 'yesica',
    photos: [],
    ratings,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('getRatingStatus', () => {
  // Guards the plan's §5.10 "no early read" rule: the app must never treat the viewer's own
  // rating as proof the partner's score is visible too.
  test('awaiting-self when neither profile has rated', () => {
    expect(getRatingStatus(makeExperience([]), 'yesica')).toBe('awaiting-self');
  });

  test('awaiting-partner when only the viewer has rated', () => {
    const experience = makeExperience([{ profileKey: 'yesica', score: 5, submittedAt: '2026-01-01T00:00:00.000Z' }]);
    expect(getRatingStatus(experience, 'yesica')).toBe('awaiting-partner');
  });

  test('awaiting-self when only the partner has rated (viewer still has not)', () => {
    const experience = makeExperience([{ profileKey: 'fabian', score: 5, submittedAt: '2026-01-01T00:00:00.000Z' }]);
    expect(getRatingStatus(experience, 'yesica')).toBe('awaiting-self');
  });

  test('revealed once both profiles have rated', () => {
    const experience = makeExperience([
      { profileKey: 'yesica', score: 5, submittedAt: '2026-01-01T00:00:00.000Z' },
      { profileKey: 'fabian', score: 4, submittedAt: '2026-01-01T00:05:00.000Z' },
    ]);
    expect(getRatingStatus(experience, 'yesica')).toBe('revealed');
    expect(getRatingStatus(experience, 'fabian')).toBe('revealed');
  });
});
