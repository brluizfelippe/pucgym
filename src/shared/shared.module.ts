// shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExerciseComponent } from '../app/components/exercise/exercise.component';
import { HistoryComponent } from 'src/app/components/history/history.component';
import { HistoryByMonthComponent } from 'src/app/components/history-by-month/history-by-month.component';

@NgModule({
  declarations: [ExerciseComponent, HistoryComponent, HistoryByMonthComponent],
  imports: [CommonModule],
  exports: [ExerciseComponent, HistoryComponent, HistoryByMonthComponent], // Export the component so it can be used in other modules
})
export class SharedModule {}
