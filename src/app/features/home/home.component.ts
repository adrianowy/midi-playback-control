import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>MIDI Playback Control</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Welcome to Phase 1</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>Remote control application for MultiTracks Playback on iPad</p>
          <p><strong>Status:</strong> Phase 1 Foundation Complete ✅</p>
          <p><strong>Next:</strong> Phase 2 (RTP-MIDI Implementation)</p>
        </ion-card-content>
      </ion-card>

      <ion-button expand="full" color="primary">
        Connect to iPad
      </ion-button>
    </ion-content>
  `,
  styles: `
    ion-card {
      margin-bottom: 20px;
    }
  `,
})
export class HomeComponent {}
