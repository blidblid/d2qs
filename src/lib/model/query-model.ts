import { Entity } from '@berglund/firebase';
import { Area, Preferences } from './user-model';

export interface Query extends Entity, Omit<Preferences, 'refreshMode'> {
  type: Type;
  difficulty: Difficulty;
  maxPlayers: number;
  playerId: string;
  timestamp: any;
  act?: Act;
  quest?: Quest;
  runArea?: Area;
}

export interface NamedEntity {
  id: string;
  name: string;
}

export type Difficulty = 'normal' | 'nightmare' | 'hell';
export const NORMAL = 'normal';
export const NIGHTMARE = 'nightmare';
export const HELL = 'hell';
export const DIFFICULTY_LOCALE: Record<Difficulty, string> = {
  normal: 'Normal',
  nightmare: 'Nightmare',
  hell: 'Hell',
};

export type Act = 'a1' | 'a2' | 'a3' | 'a4' | 'a5';
export const ACT_1 = 'a1';
export const ACT_2 = 'a2';
export const ACT_3 = 'a3';
export const ACT_4 = 'a4';
export const ACT_5 = 'a5';
export const ACT_LOCALE: Record<Act, string> = {
  a1: 'Act 1',
  a2: 'Act 2',
  a3: 'Act 3',
  a4: 'Act 4',
  a5: 'Act 5',
};

export type Quest = 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6';
export const QUEST_1 = 'q1';
export const QUEST_2 = 'q2';
export const QUEST_3 = 'q3';
export const QUEST_4 = 'q4';
export const QUEST_5 = 'q5';
export const QUEST_6 = 'q6';
export const QUEST_LOCALE: Record<Quest, string> = {
  q1: 'Quest 1',
  q2: 'Quest 2',
  q3: 'Quest 3',
  q4: 'Quest 4',
  q5: 'Quest 5',
  q6: 'Quest 6',
};

export type Type = 'farm' | 'run' | 'quest';
export const FARM = 'farm';
export const RUN = 'run';
export const QUEST = 'quest';
export const TYPE_LOCALE: Record<Type, string> = {
  farm: 'Farm',
  run: 'Run',
  quest: 'Quest',
};
