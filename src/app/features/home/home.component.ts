import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
} from '@ionic/angular/standalone';
import { RtpMidiService } from '../../core/services/rtp-midi.service';
import { ConnectionStatus } from '../../core/models/connection.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    IonButton,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  pads: Pad[] = [];
  connectionStatus = ConnectionStatus.IDLE;
  isConnected = false;
  isLoading = false;
  errorMessage: string | null = null;

  private destroy$ = new Subject<void>();

  // Static iPad configuration for MVP testing
  private readonly IPAD_IP = '192.168.1.100'; // Replace with actual iPad IP
  private readonly CONTROL_PORT = 5004;
  private readonly DATA_PORT = 5005;

  constructor(private rtpMidiService: RtpMidiService) {}

  ngOnInit(): void {
    this.initializePads();
    this.setupConnectionMonitoring();
    this.connectToPlayback();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  /**
   * Monitor connection status and errors
   */
  private setupConnectionMonitoring(): void {
    this.rtpMidiService.connectionStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.connectionStatus = status;
        this.isConnected = status === ConnectionStatus.CONNECTED;
        this.isLoading = status === ConnectionStatus.CONNECTING || status === ConnectionStatus.DISCONNECTING;
      });
  }

  /**
   * Establish connection to Playback on iPad
   */
  private connectToPlayback(): void {
    this.rtpMidiService
      .connect(this.IPAD_IP, this.CONTROL_PORT, this.DATA_PORT)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('[Home] Connected to Playback');
          this.errorMessage = null;
        },
        error: (error) => {
          console.error('[Home] Connection error:', error);
          this.errorMessage = error.message || 'Failed to connect to Playback';
        },
      });
  }

  // ============================================================
  // PLAYBACK CONTROLS
  // ============================================================

  onPlayClick(): void {
    if (!this.isConnected) {
      this.errorMessage = 'Not connected to Playback';
      return;
    }

    this.rtpMidiService
      .sendNoteOn(0x3c, 0x7f) // Middle C, velocity 127
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => console.log('Play command sent'),
        error: (error) => {
          console.error('Play error:', error);
          this.errorMessage = error.message;
        },
      });
  }

  onPauseClick(): void {
    if (!this.isConnected) {
      this.errorMessage = 'Not connected to Playback';
      return;
    }

    this.rtpMidiService
      .sendNoteOn(0x3d, 0x7f) // C#, velocity 127
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => console.log('Pause command sent'),
        error: (error) => {
          console.error('Pause error:', error);
          this.errorMessage = error.message;
        },
      });
  }

  onStopClick(): void {
    if (!this.isConnected) {
      this.errorMessage = 'Not connected to Playback';
      return;
    }

    this.rtpMidiService
      .sendNoteOn(0x3e, 0x7f) // D, velocity 127
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => console.log('Stop command sent'),
        error: (error) => {
          console.error('Stop error:', error);
          this.errorMessage = error.message;
        },
      });
  }

  onNextClick(): void {
    if (!this.isConnected) {
      this.errorMessage = 'Not connected to Playback';
      return;
    }

    this.rtpMidiService
      .sendNoteOn(0x3f, 0x7f) // D#, velocity 127
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => console.log('Next command sent'),
        error: (error) => {
          console.error('Next error:', error);
          this.errorMessage = error.message;
        },
      });
  }

  onPreviousClick(): void {
    if (!this.isConnected) {
      this.errorMessage = 'Not connected to Playback';
      return;
    }

    this.rtpMidiService
      .sendNoteOn(0x40, 0x7f) // E, velocity 127
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => console.log('Previous command sent'),
        error: (error) => {
          console.error('Previous error:', error);
          this.errorMessage = error.message;
        },
      });
  }

  // ============================================================
  // LOOP CONTROLS
  // ============================================================

  onLoopSectionClick(): void {
    if (!this.isConnected) {
      this.errorMessage = 'Not connected to Playback';
      return;
    }

    this.rtpMidiService
      .sendNoteOn(0x41, 0x7f) // F, velocity 127
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => console.log('Loop Section command sent'),
        error: (error) => {
          console.error('Loop Section error:', error);
          this.errorMessage = error.message;
        },
      });
  }

  onRepeatClick(): void {
    if (!this.isConnected) {
      this.errorMessage = 'Not connected to Playback';
      return;
    }

    this.rtpMidiService
      .sendNoteOn(0x42, 0x7f) // F#, velocity 127
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => console.log('Repeat command sent'),
        error: (error) => {
          console.error('Repeat error:', error);
          this.errorMessage = error.message;
        },
      });
  }

  // ============================================================
  // INFINITY LOOP - BONUS
  // ============================================================

  onInfinityLoopClick(): void {
    if (!this.isConnected) {
      this.errorMessage = 'Not connected to Playback';
      return;
    }

    this.rtpMidiService
      .sendNoteOn(0x43, 0x7f) // G, velocity 127
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => console.log('Infinity Loop command sent'),
        error: (error) => {
          console.error('Infinity Loop error:', error);
          this.errorMessage = error.message;
        },
      });
  }

  // ============================================================
  // PAD CONTROLS
  // ============================================================

  onPadClick(padIndex: number): void {
    if (!this.isConnected) {
      this.errorMessage = 'Not connected to Playback';
      return;
    }

    const pad = this.pads[padIndex];
    pad.active = !pad.active;

    const velocity = pad.active ? 0x7f : 0x00;
    const midiNote = 0x48 + padIndex; // Start from A4 (0x48)

    this.rtpMidiService
      .sendNoteOn(midiNote, velocity)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => console.log(`Pad ${pad.id} toggled - ${pad.active ? 'ON' : 'OFF'}`),
        error: (error) => {
          console.error('Pad error:', error);
          this.errorMessage = error.message;
          // Revert on error
          pad.active = !pad.active;
        },
      });
  }

  // ============================================================
  // AUDIO CONTROLS
  // ============================================================

  onFadeInClick(): void {
    if (!this.isConnected) {
      this.errorMessage = 'Not connected to Playback';
      return;
    }

    this.rtpMidiService
      .sendControlChange(0x07, 0x7f) // CC 7 (Volume), max value
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => console.log('Fade In command sent'),
        error: (error) => {
          console.error('Fade In error:', error);
          this.errorMessage = error.message;
        },
      });
  }

  onFadeOutClick(): void {
    if (!this.isConnected) {
      this.errorMessage = 'Not connected to Playback';
      return;
    }

    this.rtpMidiService
      .sendControlChange(0x07, 0x00) // CC 7 (Volume), min value
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => console.log('Fade Out command sent'),
        error: (error) => {
          console.error('Fade Out error:', error);
          this.errorMessage = error.message;
        },
      });
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

