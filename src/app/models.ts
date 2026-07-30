export interface SetEntry {
  name: string;
  weight: number;
  reps: number;
  sets: number;
  date: string;
  ts: number;
}

export interface Session {
  id?: string;
  userId?: string;
  date: string;
  mins: number;
  ts: number;
}

export interface Food {
  id?: string;
  userId?: string;
  name: string;
  cal: number;
  pro: number;
  date: string;
  ts: number;
}

export interface Goals {
  id?: string;
  userId?: string;
  cal: number;
  pro: number;
}

export interface Exercise {
  id?: string;
  userId?: string;
  name: string;
  target: string;
  note: string;
  load: number;
  completedAt?: string | null;
}

export interface DayPlan {
  label: string;
  day: string;
  exercises: Exercise[];
}

export interface LocationProgram {
  label: string;
  sub: string;
  push: DayPlan;
  pull: DayPlan;
  core: DayPlan;
}

export interface Program {
  home: LocationProgram;
  gym: LocationProgram;
}

export interface AppState {
  sets: SetEntry[];
  sessions: Session[];
  foods: Food[];
  goals: Goals;
  program: Program;
}

export type LocationKey = 'home' | 'gym';
export type DayKey = 'push' | 'pull' | 'core';
