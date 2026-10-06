import type { Repositories } from '@/storage/repositories';
import type { UserProfile, Subject, LearningGoal } from '@/domain/types';
import { buildDemoDna, DEMO_USER_ID, DEMO_NAME } from '@/constants/demo';
import { uid } from '@/utils/id';
import { nowIso } from '@/utils/date';

export interface OnboardingInput {
  name: string;
  goal: LearningGoal;
  interests: Subject[];
}

/** Create a real user profile from onboarding input (empty DNA — grows from use). */
export async function createRealProfile(
  repos: Repositories,
  input: OnboardingInput,
): Promise<UserProfile> {
  const profile: UserProfile = {
    userId: uid('user'),
    name: input.name.trim() || '학습자',
    goal: input.goal,
    interests: input.interests,
    isDemo: false,
    createdAt: nowIso(),
  };
  await repos.profile.save(profile);
  await repos.dna.save(profile.userId, []);
  return profile;
}

/**
 * Seed the demo profile + example Error DNA so a judge sees a populated app and
 * can run the full 2-minute flow immediately (R12). Idempotent.
 */
export async function seedDemo(repos: Repositories): Promise<UserProfile> {
  const existing = await repos.profile.get(DEMO_USER_ID);
  const profile: UserProfile =
    existing ?? {
      userId: DEMO_USER_ID,
      name: DEMO_NAME,
      goal: '대학교 전공',
      interests: ['공업수학', '일반물리', 'Python 프로그래밍'],
      isDemo: true,
      createdAt: nowIso(),
    };
  await repos.profile.save(profile);
  // (Re)seed DNA only if empty so repeated demos don't wipe progress mid-session.
  const dna = await repos.dna.get(DEMO_USER_ID);
  if (dna.length === 0) {
    await repos.dna.save(DEMO_USER_ID, buildDemoDna(DEMO_USER_ID));
  }
  return profile;
}
