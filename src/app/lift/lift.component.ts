import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { DayKey } from '../models';

@Component({
  selector: 'app-lift',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lift.component.html'
})
export class LiftComponent {
  currentDay = signal<DayKey>('push');
  dayKeys: DayKey[] = ['push', 'pull', 'core'];

  // Log-a-session form fields
  sessionDate = '';
  sessionMins: number | null = null;

  currentExercises = computed(() => this.data.program().gym[this.currentDay()].exercises);

  plateCount = computed(() => {
    const total = this.data.todaysSets().reduce((a, s) => a + s.sets, 0);
    return Math.min(total, 14);
  });
  plates = computed(() => Array.from({ length: this.plateCount() }));

  weekDays = computed(() => {
    const days: string[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  });

  weekBars = computed(() => {
    const days = this.weekDays();
    const sessions = this.data.sessions();
    const totals = days.map(d => sessions.filter(s => s.date === d).reduce((a, s) => a + s.mins, 0));
    const max = Math.max(...totals, 30);
    return days.map((d, i) => ({
      date: d,
      mins: totals[i],
      heightPct: Math.max(4, (totals[i] / max) * 100),
      label: new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'narrow' })
    }));
  });

  weekSessionCount = computed(() => {
    const days = this.weekDays();
    return this.data.sessions().filter(s => days.includes(s.date)).length;
  });
  weekMinutes = computed(() => {
    const days = this.weekDays();
    return this.data.sessions().filter(s => days.includes(s.date)).reduce((a, s) => a + s.mins, 0);
  });

  isComplete(idx: number) {
    return this.currentExercises()[idx]?.completedAt === this.data.today;
  }

  toggleComplete(idx: number) {
    const completed = this.isComplete(idx);
    this.data.setExerciseComplete('gym', this.currentDay(), idx, completed ? null : this.data.today);
    if (!completed && !this.data.sessions().some(s => s.date === this.data.today)) {
      this.data.addSession(this.data.today, 30);
    }
  }

  recentSessions = computed(() => this.data.sessions().slice(0, 8));

  constructor(public data: DataService) {
    this.sessionDate = data.today;
  }

  deleteSet(ts: number) { this.data.deleteSet(ts); }

  switchDay(day: DayKey) { this.currentDay.set(day); }

  addSession() {
    this.data.addSession(this.sessionDate || this.data.today, this.sessionMins || 0);
    this.sessionMins = null;
  }
  deleteSession(ts: number) { this.data.deleteSession(ts); }
}
