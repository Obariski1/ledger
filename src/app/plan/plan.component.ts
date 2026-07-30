import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { DayKey, LocationKey } from '../models';

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plan.component.html'
})
export class PlanComponent {
  currentLocation = signal<LocationKey>('gym');
  currentDay = signal<DayKey>('push');
  showAddExercise = signal(false);
  showDeleteExercise = signal(false);
  newExerciseName = '';
  newExerciseTarget = '';
  newExerciseLoad: number | null = null;
  newExerciseNote = '';
  selectedDeleteExerciseIndex: number | null = null;
  dayKeys: DayKey[] = ['push', 'pull', 'core'];
  locationKeys: LocationKey[] = ['gym', 'home'];

  constructor(public data: DataService) {}

  locations(): LocationKey[] {
    return this.locationKeys;
  }

  currentExercises() {
    return this.data.program()[this.currentLocation()][this.currentDay()].exercises;
  }

  isComplete(idx: number) {
    return this.currentExercises()[idx]?.completedAt === this.data.today;
  }

  toggleComplete(idx: number) {
    const completed = this.isComplete(idx);
    this.data.setExerciseComplete(this.currentLocation(), this.currentDay(), idx, completed ? null : this.data.today);
    if (!completed && !this.data.sessions().some(s => s.date === this.data.today)) {
      this.data.addSession(this.data.today, 30);
    }
  }

  updateLoad(idx: number, value: string) {
    const load = Number(value);
    if (!Number.isNaN(load)) {
      this.data.setLoad(this.currentLocation(), this.currentDay(), idx, load);
    }
  }

  switchLocation(loc: LocationKey) { this.currentLocation.set(loc); }
  switchDay(day: DayKey) { this.currentDay.set(day); }

  toggleAddExercise() {
    this.showAddExercise.set(!this.showAddExercise());
  }

  toggleDeleteExercise() {
    this.showDeleteExercise.set(!this.showDeleteExercise());
    if (!this.showDeleteExercise()) {
      this.selectedDeleteExerciseIndex = null;
    }
  }

  createExercise() {
    this.data.addExercise(
      this.currentLocation(),
      this.currentDay(),
      this.newExerciseName,
      this.newExerciseTarget,
      this.newExerciseLoad ?? 0,
      this.newExerciseNote
    );

    this.newExerciseName = '';
    this.newExerciseTarget = '';
    this.newExerciseLoad = null;
    this.newExerciseNote = '';
    this.showAddExercise.set(false);
  }

  deleteSelectedExercise() {
    if (this.selectedDeleteExerciseIndex === null) return;
    this.data.deleteExercise(this.currentLocation(), this.currentDay(), this.selectedDeleteExerciseIndex);
    this.selectedDeleteExerciseIndex = null;
    this.showDeleteExercise.set(false);
  }

  loadLabel(load: number): string {
    return load ? `${load} kg` : 'BW';
  }
}
