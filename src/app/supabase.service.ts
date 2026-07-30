import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

export interface SupabaseExercise {
  id: string;
  location: string;
  day: string;
  name: string;
  target: string;
  note?: string | null;
  load: number;
  completed_at: string | null;
  sort_order: number;
}

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey
  );

  async getProgramExercises() {
    return this.supabase
      .from('program_exercises')
      .select('*')
      .order('sort_order', { ascending: true });
  }

  async updateProgramExercise(exercise: Partial<SupabaseExercise> & { id: string }) {
    return this.supabase.from('program_exercises').upsert(exercise);
  }

  async getSessions() {
    return this.supabase.from('sessions').select('*').order('created_at', { ascending: false });
  }

  async addSession(date: string, mins: number) {
    return this.supabase.from('sessions').insert({ date, mins }).select('*').single();
  }

  async getFoods() {
    return this.supabase.from('foods').select('*').order('created_at', { ascending: false });
  }

  async addFood(name: string, cal: number, pro: number, date: string) {
    return this.supabase.from('foods').insert({ name, cal, pro, date }).select('*').single();
  }

  async updateFood(id: string, name: string, cal: number, pro: number, date: string) {
    return this.supabase.from('foods').update({ name, cal, pro, date }).eq('id', id).select('*').single();
  }

  async deleteFood(id: string) {
    return this.supabase.from('foods').delete().eq('id', id);
  }

  async deleteSession(id: string) {
    return this.supabase.from('sessions').delete().eq('id', id);
  }

  async getGoals() {
    return this.supabase.from('goals').select('id,cal,pro').limit(1);
  }

  async upsertGoals(cal: number, pro: number, id?: string) {
    return this.supabase.from('goals').upsert({ id, cal, pro });
  }
}
