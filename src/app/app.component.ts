import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanComponent } from './plan/plan.component';
import { FuelComponent } from './fuel/fuel.component';

type Tab = 'plan' | 'overview';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, PlanComponent, FuelComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  activeTab = signal<Tab>('overview');
  today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  switchTab(tab: Tab) {
    this.activeTab.set(tab);
  }
}
