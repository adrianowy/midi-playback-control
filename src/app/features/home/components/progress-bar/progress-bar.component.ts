/**
 * Progress Bar Component
 *
 * Displays playback progress with:
 * - Progress bar visualization
 * - Current time / Total time
 * - Real-time updates from OSC telemetry
 */

import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { OscService } from '../../../core/services/osc.service';
import { OscPlaybackStatus } from '../../../core/models/osc.types';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
})
export class ProgressBarComponent implements OnInit, OnDestroy {
  /**
   * Optional CSS classes
   */
  @Input() cssClass: string = '';

  /**
   * Time information
   */
  currentTime: number = 0;
  totalTime: number = 0;

  /**
   * Playback state
   */
  isPlaying: boolean = false;

  /**
   * Cleanup subject
   */
  private destroy$ = new Subject<void>();

  constructor(private oscService: OscService) {}

  ngOnInit(): void {
    this.subscribeToTelemetry();
  }

  /**
   * Subscribe to playback status updates
   */
  private subscribeToTelemetry(): void {
    this.oscService.playbackStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe((status: OscPlaybackStatus) => {
        this.updateProgress(status);
      });
  }

  /**
   * Update progress information
   */
  private updateProgress(status: OscPlaybackStatus): void {
    if (status.timePosition !== undefined) {
      this.currentTime = status.timePosition;
    }
    if (status.timeDuration !== undefined) {
      this.totalTime = status.timeDuration;
    }
    if (status.isPlaying !== undefined) {
      this.isPlaying = status.isPlaying;
    }
  }

  /**
   * Get progress percentage (0-100)
   */
  get progressPercentage(): number {
    if (this.totalTime === 0) return 0;
    return Math.min((this.currentTime / this.totalTime) * 100, 100);
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
   * Get play/pause indicator
   */
  get playbackIndicator(): string {
    return this.isPlaying ? '▶ Reproduzindo' : '⏸ Pausado';
  }

  /**
   * Get play/pause icon
   */
  get playbackIcon(): string {
    return this.isPlaying ? '▶' : '⏸';
  }

  /**
   * Cleanup on destroy
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
