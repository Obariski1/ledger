import { Injectable, signal, computed } from '@angular/core';
import { AppState, SetEntry, Session, Food, LocationKey, DayKey, Goals } from './models';
import { DEFAULT_PROGRAM } from './default-program';
import { SupabaseService } from './supabase.service';
import { RemoteProgramExercise, RemoteSession, RemoteFood, RemoteGoals } from './supabase.types';

const DEFAULT_STATE: AppState = {
  sets: [],
  sessions: [],
  foods: [],
  goals: { cal: 2200, pro: 160 },
  program: structuredClone(DEFAULT_PROGRAM)
};

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function parseTarget(t: string): { sets: number; reps: number } {
  const m = t.match(/^(\d+)\s*[x×]\s*(\d+)/i);
  return { sets: m ? parseInt(m[1], 10) : 3, reps: m ? parseInt(m[2], 10) : 10 };
}

@Injectable({ providedIn: 'root' })
export class DataService {
  readonly today = todayStr();

  private state = signal<AppState>(structuredClone(DEFAULT_STATE));

  readonly sets = computed(() => this.state().sets);
  readonly sessions = computed(() => this.state().sessions);
  readonly foods = computed(() => this.state().foods);
  readonly goals = computed(() => this.state().goals);
  readonly program = computed(() => this.state().program);

  readonly todaysSets = computed(() => this.sets().filter(s => s.date === this.today));
  readonly todaysFoods = computed(() => this.foods().filter(f => f.date === this.today));

  constructor(private supabase: SupabaseService) {
    this.loadRemoteState();
  }

  private update(mutator: (draft: AppState) => void) {
    const clone = structuredClone(this.state());
    mutator(clone);
    this.state.set(clone);
  }

  private mapRemoteExercises(rows: RemoteProgramExercise[]): AppState['program'] {
    const program = structuredClone(DEFAULT_PROGRAM);
    if (!rows.length) {
      return program;
    }

    for (const loc of Object.keys(program) as LocationKey[]) {
      program[loc].push.exercises = [];
      program[loc].pull.exercises = [];
      program[loc].core.exercises = [];
    }

    rows.forEach(row => {
      const exercise = {
        id: row.id,
        name: row.name,
        target: row.target,
        note: row.note ?? '',
        load: Number(row.load),
        completedAt: row.completed_at
      };
      program[row.location as LocationKey][row.day as DayKey].exercises.push(exercise);
    });

    return program;
  }

  private mapRemoteSession(row: RemoteSession): Session {
    return { id: row.id, date: row.date, mins: row.mins, ts: Date.now() };
  }

  private mapRemoteFood(row: RemoteFood): Food {
    return { id: row.id, name: row.name, cal: row.cal, pro: row.pro, date: row.date, ts: Date.now() };
  }

  private async loadRemoteState() {
    try {
      const [exRes, sessRes, foodRes, goalsRes] = await Promise.all([
        this.supabase.getProgramExercises(),
        this.supabase.getSessions(),
        this.supabase.getFoods(),
        this.supabase.getGoals()
      ]);

      if (exRes.error || sessRes.error || foodRes.error || goalsRes.error) {
        console.warn('Supabase load failed', exRes.error || sessRes.error || foodRes.error || goalsRes.error);
        return;
      }

      const program = this.mapRemoteExercises(exRes.data ?? []);
      const sessions = (sessRes.data ?? []).map(row => this.mapRemoteSession(row));
      const foods = (foodRes.data ?? []).map(row => this.mapRemoteFood(row));
      const goals = Array.isArray(goalsRes.data) && goalsRes.data.length
        ? { id: goalsRes.data[0].id, cal: goalsRes.data[0].cal, pro: goalsRes.data[0].pro }
        : this.state().goals;

      this.state.set({ ...this.state(), program, sessions, foods, goals });
    } catch (e) {
      console.error('Error loading remote state', e);
    }
  }

  private async syncExerciseToRemote(exercise: { id?: string; location: LocationKey; day: DayKey; idx: number }) {
    const ex = this.state().program[exercise.location][exercise.day].exercises[exercise.idx];
    if (!ex) return;

    if (!ex.id) {
      console.warn('Remote sync skipped: missing exercise id');
      return;
    }

    await this.supabase.updateProgramExercise({
      id: ex.id,
      load: ex.load,
      completed_at: ex.completedAt ?? null
    } as any);
  }

  private async syncSessionToRemote(session: Session) {
    if (session.id) return;
    const res = await this.supabase.addSession(session.date, session.mins);
    if (!res.error && res.data) {
      this.update(s => {
        const existing = s.sessions.find(x => x.ts === session.ts);
        if (existing) existing.id = res.data.id;
      });
    }
  }

  private async syncFoodToRemote(food: Food) {
    if (food.id) {
      await this.supabase.updateFood(food.id, food.name, food.cal, food.pro, food.date);
      return;
    }

    const res = await this.supabase.addFood(food.name, food.cal, food.pro, food.date);
    if (!res.error && res.data) {
      this.update(s => {
        const existing = s.foods.find(x => x.ts === food.ts);
        if (existing) existing.id = res.data.id;
      });
    }
  }

  private async deleteFoodFromRemote(food: Food) {
    if (!food.id) return;
    await this.supabase.deleteFood(food.id);
  }

  private async deleteSessionFromRemote(session: Session) {
    if (!session.id) return;
    await this.supabase.deleteSession(session.id);
  }

  private async syncGoalsToRemote(goals: Goals) {
    await this.supabase.upsertGoals(goals.cal, goals.pro, goals.id);
  }

  // ---- Lift: sets ----
  addSet(name: string, weight: number, reps: number, sets: number) {
    if (!name || !reps) return;
    const entry: SetEntry = { name, weight, reps, sets, date: this.today, ts: Date.now() };
    this.update(s => { s.sets.unshift(entry); });
  }
  deleteSet(ts: number) {
    this.update(s => { s.sets = s.sets.filter(x => x.ts !== ts); });
  }

  // ---- Lift: gym time ----
  addSession(date: string, mins: number) {
    if (!mins) return;
    const session: Session = { date, mins, ts: Date.now() };
    this.update(s => { s.sessions.unshift(session); });
    void this.syncSessionToRemote(session);
  }
  deleteSession(ts: number) {
    const session = this.state().sessions.find(x => x.ts === ts);
    if (session) {
      void this.deleteSessionFromRemote(session);
    }
    this.update(s => { s.sessions = s.sessions.filter(x => x.ts !== ts); });
  }

  // ---- Fuel ----
  addFood(name: string, cal: number, pro: number, date: string = this.today) {
    if (!name) return;
    const food: Food = { name, cal, pro, date, ts: Date.now() };
    this.update(s => { s.foods.unshift(food); });
    void this.syncFoodToRemote(food);
  }
  setDailyTotals(cal: number, pro: number, date: string = this.today) {
    let targetEntry: Food | undefined;
    this.update(s => {
      const existing = s.foods.find(x => x.date === date && x.name === 'Daily total');
      if (existing) {
        existing.cal = cal;
        existing.pro = pro;
        existing.date = date;
        targetEntry = existing;
      } else {
        targetEntry = { name: 'Daily total', cal, pro, date, ts: Date.now() };
        s.foods.unshift(targetEntry);
      }
    });
    if (targetEntry) {
      void this.syncFoodToRemote(targetEntry);
    }
  }

  setDailyCalories(cal: number, date: string = this.today) {
    this.setDailyTotals(cal, 0, date);
  }
  updateFoodEntry(ts: number, name: string, cal: number, pro: number, date: string) {
    this.update(s => {
      const food = s.foods.find(x => x.ts === ts);
      if (!food) return;
      food.name = name;
      food.cal = cal;
      food.pro = pro;
      food.date = date;
    });
    const food = this.state().foods.find(x => x.ts === ts);
    if (food) {
      void this.syncFoodToRemote(food);
    }
  }

  deleteFood(ts: number) {
    const food = this.state().foods.find(x => x.ts === ts);
    if (food) {
      void this.deleteFoodFromRemote(food);
    }
    this.update(s => { s.foods = s.foods.filter(x => x.ts !== ts); });
  }
  saveGoals(cal: number | null, pro: number | null) {
    this.update(s => {
      if (cal) s.goals.cal = cal;
      if (pro) s.goals.pro = pro;
    });
    this.syncGoalsToRemote(this.state().goals);
  }

  // ---- Plan ----
  adjustLoad(loc: LocationKey, day: DayKey, idx: number, delta: number) {
    this.update(s => {
      const ex = s.program[loc][day].exercises[idx];
      ex.load = Math.max(0, Math.round((ex.load + delta) * 10) / 10);
    });
    this.syncExerciseToRemote({ location: loc, day, idx });
  }

  setLoad(loc: LocationKey, day: DayKey, idx: number, load: number) {
    this.update(s => {
      const ex = s.program[loc][day].exercises[idx];
      ex.load = Math.max(0, Math.round(load * 10) / 10);
    });
    this.syncExerciseToRemote({ location: loc, day, idx });
  }

  setExerciseComplete(loc: LocationKey, day: DayKey, idx: number, completedAt: string | null) {
    this.update(s => {
      const ex = s.program[loc][day].exercises[idx];
      ex.completedAt = completedAt;
    });
    this.syncExerciseToRemote({ location: loc, day, idx });
  }
}
