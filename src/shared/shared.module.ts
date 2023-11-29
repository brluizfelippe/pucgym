// shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ExerciseComponent } from '../app/components/exercise/exercise.component';
import { HistoryComponent } from 'src/app/components/history/history.component';
import { HistoryByMonthComponent } from 'src/app/components/history-by-month/history-by-month.component';
import { StatsComponent } from 'src/app/components/stats/stats.component';

@NgModule({
  declarations: [
    ExerciseComponent,
    HistoryComponent,
    HistoryByMonthComponent,
    StatsComponent,
  ],
  imports: [CommonModule, IonicModule],
  exports: [
    ExerciseComponent,
    HistoryComponent,
    HistoryByMonthComponent,
    StatsComponent,
  ], // Export the component so it can be used in other modules
})
export class SharedModule {}
