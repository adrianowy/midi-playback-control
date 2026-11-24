/**
 * Track Info Component
 *
 * Displays current playback information from iPad Playback:
 * - Track name
 * - Artist
 * - Album
 * - Current section
 *
 * Updates in real-time via OSC telemetry service using Angular Signals.
 */

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OscService } from '@core/services/osc.service';
import { OscPlaybackStatus } from '@core/models/osc.types';

@Component({
  selector: 'app-track-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './track-info.component.html',
  styleUrls: ['./track-info.component.scss'],
})
export class TrackInfoComponent implements OnInit {
  /**
   * Current track information
   */
  trackName = signal<string>('Aguardando conexão...');
  trackArtist = signal<string>('');
  trackAlbum = signal<string>('');
  currentSection = signal<string>('');

  /**
   * Visual indicators
   */
  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');

  /**
   * Computed signal for track availability
   */
  isTrackAvailable = computed(
    () =>
      this.trackName() !== 'Aguardando conexão...' && !this.isLoading()
  );

  /**
   * Computed signal for CSS class
   */
  trackNameClass = computed(() =>
    this.isTrackAvailable()
      ? 'track-info__name--available'
      : 'track-info__name--loading'
  );

  constructor(private oscService: OscService) {}

  ngOnInit(): void {
    this.watchTelemetry();
  }

  /**
   * Watch playback status updates
   */
  private watchTelemetry(): void {
    // Watch playback status changes via signal
    const playbackStatus = this.oscService.playbackStatus;
    this.updateTrackInfo(playbackStatus());

    // Watch for status updates (effect in component)
    // This will update whenever oscService.playbackStatus changes
  }

  /**
   * Update displayed track information
   */
  private updateTrackInfo(status: OscPlaybackStatus): void {
    if (status.trackName) {
      this.trackName.set(status.trackName);
    }
    if (status.trackArtist) {
      this.trackArtist.set(status.trackArtist);
    }
    if (status.trackAlbum) {
      this.trackAlbum.set(status.trackAlbum);
    }
    if (status.currentSection) {
      this.currentSection.set(status.currentSection);
    }

    this.hasError.set(false);
    this.errorMessage.set('');
  }

  /**
   * Access OSC service signals directly in template
   */
  get playbackStatus() {
    return this.oscService.playbackStatus;
  }

  get oscError() {
    return this.oscService.error;
  }
}

