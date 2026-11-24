import { Component, signal, computed, effect, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
} from '@ionic/angular/standalone';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RtpMidiService } from '@core/services/rtp-midi.service';
import { ConnectionStatus } from '@core/models/connection.types';

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
export class HomeComponent {
  // Static iPad configuration for MVP testing
  private readonly IPAD_IP = '192.168.68.54';
  private readonly CONTROL_PORT = 5004;
  private readonly DATA_PORT = 5005;

  private destroyRef = inject(DestroyRef);

  // State Signals
  readonly connectionStatus = signal(ConnectionStatus.IDLE);
  readonly pads = signal<Pad[]>([]);
  readonly errorMessage = signal<string | null>(null);

  // Computed Signals
  readonly isConnected = computed(
    () => this.connectionStatus() === ConnectionStatus.CONNECTED
  );

  readonly isLoading = computed(() => {
    const status = this.connectionStatus();
    return status === ConnectionStatus.CONNECTING || status === ConnectionStatus.DISCONNECTING;
  });

  readonly controlsDisabled = computed(() => !this.isConnected());

  private rtpMidiService = inject(RtpMidiService);

  constructor() {
    this.setupConnectionMonitoring();
    this.initializePads();
  }

  /**
   * Monitor connection status from RtpMidiService
   */
  private setupConnectionMonitoring(): void {
    effect(() => {
      const status = this.rtpMidiService.connectionStatus();
      this.connectionStatus.set(status);
    });
  }

  /**
   * Initialize 8 pads with OFF state
   */
  private initializePads(): void {
    this.pads.set(
      Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        active: false,
      }))
    );
    this.connectToPlayback();
  }

  /**
   * Establish connection to Playback on iPad
   */
  private connectToPlayback(): void {
    this.rtpMidiService
      .connect(this.IPAD_IP, this.CONTROL_PORT, this.DATA_PORT)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          console.log('[Home] Connected to Playback');
          this.errorMessage.set(null);
        },
        error: (error) => {
          console.error('[Home] Connection error:', error);
          this.errorMessage.set(error.message || 'Failed to connect to Playback');
        },
      });
  }

  /**
   * Send MIDI command and update error state
   */
  private sendMidiCommand(
    noteOrCC: number,
    velocity: number,
    isControlChange: boolean = false,
    actionName: string = 'Command'
  ): void {
    if (this.controlsDisabled()) {
      this.errorMessage.set('Not connected to Playback');
      return;
    }

    const observable = isControlChange
      ? this.rtpMidiService.sendControlChange(noteOrCC, velocity)
      : this.rtpMidiService.sendNoteOn(noteOrCC, velocity);

    observable
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          console.log(`${actionName} sent`);
          this.errorMessage.set(null);
        },
        error: (error) => {
          console.error(`${actionName} error:`, error);
          this.errorMessage.set(error.message);
        },
      });
  }

  // ============================================================
  // PLAYBACK CONTROLS
  // ============================================================

  onPlayClick(): void {
    this.sendMidiCommand(0x3c, 0x7f, false, 'Play');
  }

  onPauseClick(): void {
    this.sendMidiCommand(0x3d, 0x7f, false, 'Pause');
  }

  onStopClick(): void {
    this.sendMidiCommand(0x3e, 0x7f, false, 'Stop');
  }

  // ============================================================
  // LOOP CONTROLS
  // ============================================================

  onLoopSectionClick(): void {
    this.sendMidiCommand(0x41, 0x7f, false, 'Loop Section');
  }

  onRepeatClick(): void {
    this.sendMidiCommand(0x42, 0x7f, false, 'Repeat');
  }

  onInfinityLoopClick(): void {
    this.sendMidiCommand(0x43, 0x7f, false, 'Infinity Loop');
  }

  // ============================================================
  // PAD CONTROLS
  // ============================================================

  onPadClick(padIndex: number): void {
    if (this.controlsDisabled()) {
      this.errorMessage.set('Not connected to Playback');
      return;
    }

    const pads = this.pads();
    const pad = pads[padIndex];
    const wasActive = pad.active;

    pad.active = !pad.active;
    this.pads.set([...pads]);

    const velocity = pad.active ? 0x7f : 0x00;
    const midiNote = 0x48 + padIndex;

    this.rtpMidiService
      .sendNoteOn(midiNote, velocity)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          console.log(`Pad ${pad.id} toggled - ${pad.active ? 'ON' : 'OFF'}`);
          this.errorMessage.set(null);
        },
        error: (error) => {
          console.error('Pad error:', error);
          this.errorMessage.set(error.message);
          pad.active = wasActive;
          this.pads.set([...pads]);
        },
      });
  }

  // ============================================================
  // AUDIO CONTROLS
  // ============================================================

  onFadeInClick(): void {
    this.sendMidiCommand(0x07, 0x7f, true, 'Fade In');
  }

  onFadeOutClick(): void {
    this.sendMidiCommand(0x07, 0x00, true, 'Fade Out');
  }
}

