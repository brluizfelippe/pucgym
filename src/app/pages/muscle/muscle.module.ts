import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MusclePageRoutingModule } from './muscle-routing.module';

import { MusclePage } from './muscle.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MusclePageRoutingModule
  ],
  declarations: [MusclePage]
})
export class MusclePageModule {}
