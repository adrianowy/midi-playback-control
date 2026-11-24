/**
 * Track Info Component
 *
 * Displays current playback information from iPad Playback:
 * - Track name
 * - Artist
 * - Album
 * - Current section
 *
 * Updates in real-time via OSC telemetry service.
 */

import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { OscService } from '../../../core/services/osc.service';
import { OscPlaybackStatus } from '../../../core/models/osc.types';

@Component({
  selector: 'app-track-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './track-info.component.html',
  styleUrls: ['./track-info.component.scss'],
})
export class TrackInfoComponent implements OnInit, OnDestroy {
  /**
   * Optional CSS classes to apply to the component
   */
  @Input() cssClass: string = '';

  /**
   * Current track information
   */
  trackName: string = 'Aguardando conexão...';
  trackArtist: string = '';
  trackAlbum: string = '';
  currentSection: string = '';

  /**
   * Visual indicators
   */
  isLoading: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';

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
        this.updateTrackInfo(status);
        this.isLoading = false;
      });

    this.oscService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => {
        this.hasError = true;
        this.errorMessage = `OSC Error: ${error.message}`;
        console.error('Track Info Error:', error);
      });
  }

  /**
   * Update displayed track information
   */
  private updateTrackInfo(status: OscPlaybackStatus): void {
    if (status.trackName) {
      this.trackName = status.trackName;
    }
    if (status.trackArtist) {
      this.trackArtist = status.trackArtist;
    }
    if (status.trackAlbum) {
      this.trackAlbum = status.trackAlbum;
    }
    if (status.currentSection) {
      this.currentSection = status.currentSection;
    }

    this.hasError = false;
    this.errorMessage = '';
  }

  /**
   * Check if track info is available
   */
  get isTrackAvailable(): boolean {
    return this.trackName !== 'Aguardando conexão...' && !this.isLoading;
  }

  /**
   * Get display class for track name section
   */
  get trackNameClass(): string {
    return this.isTrackAvailable ? 'track-info__name--available' : 'track-info__name--loading';
  }

  /**
   * Cleanup on destroy
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
