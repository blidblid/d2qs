import { Entity } from '@berglund/firebase';
import { Area, Preferences } from './user-model';

export interface Query
  extends Entity,
    Omit<Preferences, 'refreshMode' | 'areas'>,
    Pick<Partial<Preferences>, 'areas'> {
  type: Type;
  difficulty: Difficulty;
  maxPlayers: number;
  playerId: string;
  timestamp: any;
  act?: Act;
  quest?: Quest;
  runArea?: Area;
  maxLevel?: number;
}

export interface NamedEntity {
  id: string;
  name: string;
}

export type Difficulty = 'normal' | 'nightmare' | 'hell';
export const NORMAL: Difficulty = 'normal';
export const NIGHTMARE: Difficulty = 'nightmare';
export const HELL: Difficulty = 'hell';
export const DIFFICULTY_LOCALE: Record<Difficulty, string> = {
  normal: 'Normal',
  nightmare: 'Nightmare',
  hell: 'Hell',
};

export type Act = 'a1' | 'a2' | 'a3' | 'a4' | 'a5';
export const ACT_1: Act = 'a1';
export const ACT_2: Act = 'a2';
export const ACT_3: Act = 'a3';
export const ACT_4: Act = 'a4';
export const ACT_5: Act = 'a5';
export const ACT_LOCALE: Record<Act, string> = {
  a1: 'Act 1',
  a2: 'Act 2',
  a3: 'Act 3',
  a4: 'Act 4',
  a5: 'Act 5',
};

export type Quest = 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6';
export const QUEST_1: Quest = 'q1';
export const QUEST_2: Quest = 'q2';
export const QUEST_3: Quest = 'q3';
export const QUEST_4: Quest = 'q4';
export const QUEST_5: Quest = 'q5';
export const QUEST_6: Quest = 'q6';
export const QUEST_LOCALE: Record<Quest, string> = {
  q1: 'Quest 1',
  q2: 'Quest 2',
  q3: 'Quest 3',
  q4: 'Quest 4',
  q5: 'Quest 5',
  q6: 'Quest 6',
};

export type Type = 'duel' | 'farm' | 'run' | 'quest';
export const DUEL: Type = 'duel';
export const FARM: Type = 'farm';
export const RUN: Type = 'run';
export const QUEST: Type = 'quest';
export const ALL_TYPES = [DUEL, FARM, RUN, QUEST];
export const TYPE_LOCALE: Record<Type, string> = {
  duel: 'Duel',
  farm: 'Farm',
  run: 'Run',
  quest: 'Quest',
};
