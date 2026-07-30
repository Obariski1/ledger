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

  async addProgramExercise(exercise: Omit<SupabaseExercise, 'id'>) {
    return this.supabase.from('program_exercises').insert(exercise).select('*').single();
  }

  async deleteProgramExercise(id: string) {
    return this.supabase.from('program_exercises').delete().eq('id', id);
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

  async deleteFoodVerified(id: string): Promise<boolean> {
    const delRes = await this.supabase.from('foods').delete().eq('id', id);
    if (delRes.error) return false;
    const checkRes = await this.supabase.from('foods').select('id').eq('id', id).maybeSingle();
    if (checkRes.error) return false;
    return !checkRes.data;
  }

  async deleteFoodsByDateAndName(date: string, name: string) {
    return this.supabase.from('foods').delete().eq('date', date).eq('name', name);
  }

  async deleteFoodsByDateAndNameVerified(date: string, name: string): Promise<boolean> {
    const delRes = await this.supabase.from('foods').delete().eq('date', date).eq('name', name);
    if (delRes.error) return false;
    const checkRes = await this.supabase
      .from('foods')
      .select('id')
      .eq('date', date)
      .eq('name', name)
      .limit(1);
    if (checkRes.error) return false;
    return (checkRes.data ?? []).length === 0;
  }

  async deleteSession(id: string) {
    return this.supabase.from('sessions').delete().eq('id', id);
  }

  async deleteSessionVerified(id: string): Promise<boolean> {
    const delRes = await this.supabase.from('sessions').delete().eq('id', id);
    if (delRes.error) return false;
    const checkRes = await this.supabase.from('sessions').select('id').eq('id', id).maybeSingle();
    if (checkRes.error) return false;
    return !checkRes.data;
  }

  async getGoals() {
    return this.supabase.from('goals').select('id,cal,pro').limit(1);
  }

  async upsertGoals(cal: number, pro: number, id?: string) {
    return this.supabase.from('goals').upsert({ id, cal, pro });
  }
}
