import { Session, Food, Exercise, Goals } from './models';

export interface RemoteProgramExercise {
  id: string;
  location: string;
  day: string;
  name: string;
  target: string;
  note: string | null;
  load: number;
  completed_at: string | null;
  sort_order: number;
}

export interface RemoteSession {
  id: string;
  date: string;
  mins: number;
  created_at: string;
}

export interface RemoteFood {
  id: string;
  name: string;
  cal: number;
  pro: number;
  date: string;
  created_at: string;
}

export interface RemoteGoals {
  id: string;
  cal: number;
  pro: number;
  created_at: string;
}
