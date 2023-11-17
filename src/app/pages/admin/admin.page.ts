import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Auth } from 'src/app/classes/auth';
import { AuthService } from 'src/app/services/auth.service';
import { App } from '@capacitor/app';
import { ExerciseInfo } from 'src/app/classes/exercise-info';
import { ExerciseService } from 'src/app/services/exercise.service';
import { TrainingInfo } from 'src/app/classes/training-info';
import { MuscleInfo } from 'src/app/classes/muscle-info';
import { EquipmentInfo } from 'src/app/classes/equipment-info';
import { VideoInfo } from 'src/app/classes/video-info';
import { UserInfo } from 'src/app/classes/user-info';
import { ProgramInfo } from 'src/app/classes/program-info';
import { ProgramService } from 'src/app/services/program.service';
import { TrainingService } from 'src/app/services/training.service';
import { MuscleService } from 'src/app/services/muscle.service';
import { EquipmentService } from 'src/app/services/equipment.service';
import { VideoService } from 'src/app/services/video.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  authInfoStore = new Auth();
  exerciseInfoStore = new ExerciseInfo();
  trainingInfoStore = new TrainingInfo();
  programInfoStore = new ProgramInfo();
  muscleInfoStore = new MuscleInfo();
  equipmentInfoStore = new EquipmentInfo();
  videoInfoStore = new VideoInfo();
  userInfoStore = new UserInfo();
  private authSub = new Subscription();
  private exerciseSub = new Subscription();
  private trainingSub = new Subscription();
  private programSub = new Subscription();
  private muscleSub = new Subscription();
  private equipmentSub = new Subscription();
  private videoSub = new Subscription();
  private userSub = new Subscription();
  constructor(
    public authService: AuthService,
    public exerciseService: ExerciseService,
    public trainingService: TrainingService,
    public programService: ProgramService,
    public muscleService: MuscleService,
    public equipmentService: EquipmentService,
    public videoService: VideoService,
    public userService: UserService,
    public router: Router,
    private platform: Platform,
    private routerOutlet: IonRouterOutlet
  ) {
    this.platform.backButton.subscribeWithPriority(-1, () => {
      if (!this.routerOutlet.canGoBack()) {
        App.exitApp();
      }
    });
  }

  ngOnInit() {
    this.authSub = this.authService.authInfoListener().subscribe((data) => {
      this.authInfoStore.update(data);
    });
    this.authInfoStore.update(this.authService.authInfo);

    this.exerciseSub = this.exerciseService
      .setPropertyListener()
      .subscribe((exerciseData) => {
        this.exerciseInfoStore.update(exerciseData);
      });
    this.trainingSub = this.trainingService
      .setPropertyListener()
      .subscribe((trainingData) => {
        this.trainingInfoStore.update(trainingData);
      });
    this.programSub = this.programService
      .setPropertyListener()
      .subscribe((programData) => {
        this.programInfoStore.update(programData);
      });
    this.muscleSub = this.muscleService
      .setPropertyListener()
      .subscribe((muscleData) => {
        this.muscleInfoStore.update(muscleData);
      });
    this.equipmentSub = this.equipmentService
      .setPropertyListener()
      .subscribe((equipmentData) => {
        this.equipmentInfoStore.update(equipmentData);
      });
    this.videoSub = this.videoService
      .setPropertyListener()
      .subscribe((videoData) => {
        this.videoInfoStore.update(videoData);
      });
    this.userSub = this.userService
      .setPropertyListener()
      .subscribe((userData) => {
        this.userInfoStore.update(userData);
      });
  }

  ionViewWillEnter() {
    !this.authInfoStore.isLoggedIn
      ? this.router.navigateByUrl('/landing/login')
      : this.exerciseService.getExercises();
    this.trainingService.getTrainings();
    this.programService.getPrograms();
    this.muscleService.getMuscles();
    this.equipmentService.getEquipments();
    this.videoService.getVideos();
    this.userService.getUsers();
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
    this.exerciseSub.unsubscribe();
    this.trainingSub.unsubscribe();
    this.programSub.unsubscribe();
    this.muscleSub.unsubscribe();
    this.equipmentSub.unsubscribe();
    this.videoSub.unsubscribe();
    this.userSub.unsubscribe();
  }
}
