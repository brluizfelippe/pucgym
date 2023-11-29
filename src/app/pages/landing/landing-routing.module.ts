import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LandingPage } from './landing.page';

const routes: Routes = [
  {
    path: '',
    component: LandingPage,
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('../home/home.module').then((m) => m.HomePageModule),
      },
      {
        path: 'register',
        loadChildren: () =>
          import('../register/register.module').then(
            (m) => m.RegisterPageModule
          ),
      },
      {
        path: 'login',
        loadChildren: () =>
          import('../login/login.module').then((m) => m.LoginPageModule),
      },
      {
        path: 'logout',
        loadChildren: () =>
          import('../logout/logout.module').then((m) => m.LogoutPageModule),
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('../admin/admin.module').then((m) => m.AdminPageModule),
      },
      {
        path: 'muscle',
        loadChildren: () =>
          import('../muscle/muscle.module').then((m) => m.MusclePageModule),
      },
      {
        path: 'exercise',
        loadChildren: () =>
          import('../exercise/exercise.module').then(
            (m) => m.ExercisePageModule
          ),
      },
      {
        path: 'training',
        loadChildren: () =>
          import('../training/training.module').then(
            (m) => m.TrainingPageModule
          ),
      },
      {
        path: 'program',
        loadChildren: () =>
          import('../program/program.module').then((m) => m.ProgramPageModule),
      },
      {
        path: 'video',
        loadChildren: () =>
          import('../video/video.module').then((m) => m.VideoPageModule),
      },
      {
        path: 'equipment',
        loadChildren: () =>
          import('../equipment/equipment.module').then(
            (m) => m.EquipmentPageModule
          ),
      },
      {
        path: 'user',
        loadChildren: () =>
          import('../user/user.module').then((m) => m.UserPageModule),
      },
      {
        path: 'payment',
        loadChildren: () =>
          import('../payment/payment.module').then((m) => m.PaymentPageModule),
      },
      {
        path: 'success',
        loadChildren: () =>
          import('../success/success.module').then((m) => m.SuccessPageModule),
      },
      {
        path: 'cancel',
        loadChildren: () =>
          import('../cancel/cancel.module').then((m) => m.CancelPageModule),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LandingPageRoutingModule {}
