/**
 * Pad State Indicator Component
 *
 * Displays the state of 8 pads received from iPad Playback via OSC:
 * - Visual representation of each pad (on/off)
 * - Updates in real-time
 * - Touch-friendly interface
 */

import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { OscService } from '../../../core/services/osc.service';
import { OscPlaybackStatus } from '../../../core/models/osc.types';

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
export class PadIndicatorComponent implements OnInit, OnDestroy {
  /**
   * Optional CSS classes
   */
  @Input() cssClass: string = '';

  /**
   * Array of 8 pad states
   */
  pads: PadState[] = this.initializePads();

  /**
   * Cleanup subject
   */
  private destroy$ = new Subject<void>();

  constructor(private oscService: OscService) {}

  ngOnInit(): void {
    this.subscribeToTelemetry();
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
   * Subscribe to playback status updates
   */
  private subscribeToTelemetry(): void {
    this.oscService.playbackStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe((status: OscPlaybackStatus) => {
        this.updatePadStates(status);
      });
  }

  /**
   * Update pad states from telemetry
   */
  private updatePadStates(status: OscPlaybackStatus): void {
    if (status.padStates && Array.isArray(status.padStates)) {
      status.padStates.forEach((isActive, index) => {
        if (index < this.pads.length) {
          this.pads[index].isActive = isActive;
        }
      });
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

  /**
   * Cleanup on destroy
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
