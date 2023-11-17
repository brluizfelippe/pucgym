import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MusclePage } from './muscle.page';

const routes: Routes = [
  {
    path: '',
    component: MusclePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MusclePageRoutingModule {}
