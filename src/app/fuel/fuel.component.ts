import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { Food } from '../models';

@Component({
  selector: 'app-fuel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fuel.component.html'
})
export class FuelComponent {
  today = new Date().toISOString().slice(0, 10);
  intakeDate = new Date().toISOString().slice(0, 10);
  intakeCalories: number | null = null;
  intakeProtein: number | null = null;
  showIntakeModal = signal(false);
  hoveredDay = signal<string | null>(null);
  showTargetEditor = signal(false);
  showSessionModal = signal(false);
  selectedSessionDate = signal<string | null>(null);
  selectedFood = signal<Food | null>(null);
  editDate = signal(new Date().toISOString().slice(0, 10));
  editCalories = signal<number | null>(null);
  editProtein = signal<number | null>(null);

  goalCalMin = signal(1900);
  goalCalMax = signal(2200);
  goalProMin = signal(120);
  goalProMax = signal(150);

  weekDays = computed(() => {
    const days: string[] = [];
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);

    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  });

  weekDayTotals = computed((): Array<{date:string; label:string; calories:number; protein:number; calHeight:number; proHeight:number; hasSession:boolean; isToday:boolean; calTooHigh:boolean; proTooHigh:boolean}> => {
    const days = this.weekDays();
    const foods = this.data.foods();
    const sessions = this.data.sessions();
    const dayTotals = days.map(date => {
      const entries = foods.filter(f => f.date === date);
      const calories = entries.reduce((sum, f) => sum + f.cal, 0);
      const protein = entries.reduce((sum, f) => sum + f.pro, 0);
      const hasSession = sessions.some(s => s.date === date);
      return {
        date,
        label: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'narrow' }),
        calories,
        protein,
        hasSession,
        isToday: date === this.today,
        calHeight: calories,
        proHeight: protein,
        calTooHigh: calories > this.goalCalMax(),
        proTooHigh: protein > this.goalProMax()
      };
    });
    const maxCal = Math.max(...dayTotals.map(t => t.calories), 1);
    return dayTotals.map(t => ({
      ...t,
      calHeight: t.calories > 0 ? Math.max(24, (t.calories / maxCal) * 100) : 0,
      proHeight: t.protein > 0 ? Math.max(28, Math.min(100, (t.protein * 3 / maxCal) * 100)) : 0
    }));
  });

  weekCalories = computed<number>(() => this.weekDayTotals().reduce((sum, day) => sum + day.calories, 0));
  weekProtein = computed<number>(() => this.weekDayTotals().reduce((sum, day) => sum + day.protein, 0));

  todayCalories = computed(() => this.data.foods().filter(f => f.date === this.today).reduce((sum, f) => sum + f.cal, 0));
  todayProtein = computed(() => this.data.foods().filter(f => f.date === this.today).reduce((sum, f) => sum + f.pro, 0));

  caloriesStatus = computed(() => {
    if (this.todayCalories() > this.goalCalMax()) return 'Too many calories';
    if (this.todayCalories() < this.goalCalMin()) return 'Calories below target';
    return 'Calories in range';
  });

  proteinStatus = computed(() => {
    if (this.todayProtein() < this.goalProMin()) return 'Protein below target';
    if (this.todayProtein() > this.goalProMax()) return 'Protein above target';
    return 'Protein in range';
  });

  sessionDayTotals = computed(() => {
    const days = this.weekDays();
    const totals = days.map(date => {
      const count = this.data.sessions().filter(s => s.date === date).length;
      return {
        date,
        label: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'narrow' }),
        count,
        isToday: date === this.today
      };
    });
    const max = Math.max(...totals.map(t => t.count), 1);
    return totals.map(t => ({
      ...t,
      barHeight: t.count > 0 ? Math.max(20, (t.count / max) * 100) : 0
    }));
  });

  sessionEntries = computed(() => {
    const date = this.selectedSessionDate();
    return date ? this.data.sessions().filter(s => s.date === date) : [];
  });

  weekSessionCount = computed(() => this.sessionDayTotals().reduce((sum, day) => sum + day.count, 0));
  weekDaysWithSessions = computed(() => this.sessionDayTotals().filter(day => day.count > 0).length);

  setHoveredDay(day: string | null) {
    this.hoveredDay.set(day);
  }

  openSessionModal(date: string) {
    this.selectedSessionDate.set(date);
    this.showSessionModal.set(true);
  }

  closeSessionModal() {
    this.showSessionModal.set(false);
    this.selectedSessionDate.set(null);
  }

  deleteSession(ts: number) {
    this.data.deleteSession(ts);
  }

  toggleTargetEditor() {
    this.showTargetEditor.set(!this.showTargetEditor());
  }

  weekRange = computed(() => {
    const days = this.weekDays();
    const start = new Date(days[0] + 'T00:00:00');
    const end = new Date(days[6] + 'T00:00:00');
    const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
    return `${fmt.format(start)} — ${fmt.format(end)}`;
  });

  constructor(public data: DataService) {}

  openIntakeModal(date?: string, food?: Food) {
    const entryDate = date ?? this.today;
    const selected = food ?? this.data.foods().find(f => f.date === entryDate && f.name === 'Daily total');
    if (selected) {
      this.selectedFood.set(selected);
      this.editDate.set(selected.date);
      this.editCalories.set(selected.cal);
      this.editProtein.set(selected.pro);
    } else {
      this.selectedFood.set(null);
      this.editDate.set(entryDate);
      this.editCalories.set(null);
      this.editProtein.set(null);
    }
    this.showIntakeModal.set(true);
  }

  closeIntakeModal() {
    this.showIntakeModal.set(false);
  }

  saveFoodEntry() {
    const calories = this.editCalories();
    if (calories === null || calories <= 0) return;
    const cal = calories;
    const pro = this.editProtein() ?? 0;
    const date = this.editDate();

    this.data.setDailyTotals(cal, pro, date);

    this.selectedFood.set(null);
    this.closeIntakeModal();
  }

  deleteSelectedEntry() {
    if (!this.selectedFood()) return;
    this.data.deleteFood(this.selectedFood()!.ts);
    this.selectedFood.set(null);
    this.closeIntakeModal();
  }

  editFoodEntry(food: Food) {
    this.openIntakeModal(food.date, food);
  }
}
