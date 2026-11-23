import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';

interface Pad {
  id: number;
  active: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  pads: Pad[] = [];

  ngOnInit(): void {
    this.initializePads();
  }

  /**
   * Initialize 8 pads with OFF state
   */
  private initializePads(): void {
    this.pads = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      active: false,
    }));
  }

  // ============================================================
  // PLAYBACK CONTROLS
  // ============================================================

  onPlayClick(): void {
    console.log('Play clicked');
    // TODO: Send MIDI Note On: C3 (0x3C) velocity 127
  }

  onPauseClick(): void {
    console.log('Pause clicked');
    // TODO: Send MIDI Note On: D3 (0x3E) velocity 127
  }

  onStopClick(): void {
    console.log('Stop clicked');
    // TODO: Send MIDI Note On: E3 (0x40) velocity 127
  }

  onNextClick(): void {
    console.log('Next clicked');
    // TODO: Send MIDI Note On: F3 (0x41) velocity 127
  }

  onPreviousClick(): void {
    console.log('Previous clicked');
    // TODO: Send MIDI Note On: G3 (0x43) velocity 127
  }

  // ============================================================
  // LOOP CONTROLS
  // ============================================================

  onLoopSectionClick(): void {
    console.log('Loop Section clicked');
    // TODO: Send MIDI Control Change: CC number for loop section
  }

  onRepeatClick(): void {
    console.log('Repeat clicked');
    // TODO: Send MIDI Control Change: CC number for repeat mode
  }

  // ============================================================
  // INFINITY LOOP - BONUS
  // ============================================================

  onInfinityLoopClick(): void {
    console.log('Infinity Loop clicked');
    // TODO: Send MIDI Note On: A3 (0x45) velocity 127
  }

  // ============================================================
  // PAD CONTROLS
  // ============================================================

  onPadClick(padIndex: number): void {
    const pad = this.pads[padIndex];
    pad.active = !pad.active;

    const velocity = pad.active ? 127 : 0;
    const midiNote = 0x3c + padIndex; // C4 (0x3C) + offset

    console.log(`Pad ${pad.id} toggled - ${pad.active ? 'ON' : 'OFF'}`);
    // TODO: Send MIDI Note On: midiNote velocity
  }

  // ============================================================
  // AUDIO CONTROLS
  // ============================================================

  onFadeInClick(): void {
    console.log('Fade In clicked');
    // TODO: Send MIDI Control Change: CC for fade in
  }

  onFadeOutClick(): void {
    console.log('Fade Out clicked');
    // TODO: Send MIDI Control Change: CC for fade out
  }
}

