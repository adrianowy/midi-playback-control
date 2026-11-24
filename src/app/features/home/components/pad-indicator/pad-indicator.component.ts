/**
 * Pad State Indicator Component
 *
 * Displays the state of 8 pads received from iPad Playback via OSC:
 * - Visual representation of each pad (on/off)
 * - Updates in real-time
 * - Touch-friendly interface
 *
 * Uses Angular Signals for reactive state.
 */

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OscService } from '@core/services/osc.service';
import { OscPlaybackStatus } from '@core/models/osc.types';

/**
 * Pad state interface
 */
interface PadState {
  id: number;
  isActive: boolean;
  label: string;
}

@Component({
  selector: 'app-pad-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pad-indicator.component.html',
  styleUrls: ['./pad-indicator.component.scss'],
})
export class PadIndicatorComponent implements OnInit {
  /**
   * Array of 8 pad states
   */
  pads = signal<PadState[]>(this.initializePads());

  constructor(private oscService: OscService) {}

  ngOnInit(): void {
    this.watchTelemetry();
  }

  /**
   * Initialize 8 empty pads
   */
  private initializePads(): PadState[] {
    return Array.from({ length: 8 }, (_, index) => ({
      id: index,
      isActive: false,
      label: `P${index + 1}`,
    }));
  }

  /**
   * Watch playback status updates
   */
  private watchTelemetry(): void {
    const status = this.oscService.playbackStatus();
    this.updatePadStates(status);
  }

  /**
   * Update pad states from telemetry
   */
  private updatePadStates(status: OscPlaybackStatus): void {
    if (status.padStates && Array.isArray(status.padStates)) {
      const currentPads = this.pads();
      const updated = currentPads.map((pad, index) => ({
        ...pad,
        isActive: status.padStates![index] || false,
      }));
      this.pads.set(updated);
    }
  }

  /**
   * Get CSS class for a pad
   */
  getPadClass(pad: PadState): string {
    return `pad-indicator__pad ${
      pad.isActive ? 'pad-indicator__pad--active' : 'pad-indicator__pad--inactive'
    }`;
  }

  /**
   * Get pad indicator icon
   */
  getPadIcon(pad: PadState): string {
    return pad.isActive ? '🔴' : '⭕';
  }
}

