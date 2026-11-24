/**
 * Progress Bar Component
 *
 * Displays playback progress with:
 * - Progress bar visualization
 * - Current time / Total time
 * - Real-time updates from OSC telemetry
 *
 * Uses Angular Signals for reactive state.
 */

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OscService } from '@core/services/osc.service';
import { OscPlaybackStatus } from '@core/models/osc.types';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
})
export class ProgressBarComponent implements OnInit {
  /**
   * Time information
   */
  currentTime = signal<number>(0);
  totalTime = signal<number>(0);

  /**
   * Playback state
   */
  isPlaying = signal<boolean>(false);

  /**
   * Computed signal for progress percentage (0-100)
   */
  progressPercentage = computed(() => {
    const total = this.totalTime();
    if (total === 0) return 0;
    return Math.min((this.currentTime() / total) * 100, 100);
  });

  /**
   * Computed signal for playback indicator text
   */
  playbackIndicator = computed(() =>
    this.isPlaying() ? '▶ Reproduzindo' : '⏸ Pausado'
  );

  /**
   * Computed signal for playback icon
   */
  playbackIcon = computed(() => (this.isPlaying() ? '▶' : '⏸'));

  /**
   * Computed signal for time remaining
   */
  timeRemaining = computed(() =>
    this.formatTime(Math.max(0, this.totalTime() - this.currentTime()))
  );

  constructor(private oscService: OscService) {}

  ngOnInit(): void {
    this.watchTelemetry();
  }

  /**
   * Watch playback status updates
   */
  private watchTelemetry(): void {
    const status = this.oscService.playbackStatus();
    this.updateProgress(status);
  }

  /**
   * Update progress information
   */
  private updateProgress(status: OscPlaybackStatus): void {
    if (status.timePosition !== undefined) {
      this.currentTime.set(status.timePosition);
    }
    if (status.timeDuration !== undefined) {
      this.totalTime.set(status.timeDuration);
    }
    if (status.isPlaying !== undefined) {
      this.isPlaying.set(status.isPlaying);
    }
  }

  /**
   * Format time to MM:SS
   */
  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';

    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Access OSC service signals directly in template
   */
  get playbackStatus() {
    return this.oscService.playbackStatus;
  }
}

