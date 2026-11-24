/**
 * Progress Bar Component Unit Tests
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressBarComponent } from './progress-bar.component';
import { OscService } from '@core/services/osc.service';
import { BehaviorSubject } from 'rxjs';

describe('ProgressBarComponent', () => {
  let component: ProgressBarComponent;
  let fixture: ComponentFixture<ProgressBarComponent>;
  let oscService: jasmine.SpyObj<OscService>;

  beforeEach(async () => {
    const oscServiceSpy = jasmine.createSpyObj('OscService', ['startListening'], {
      playbackStatus$: new BehaviorSubject({}),
    });

    await TestBed.configureTestingModule({
      imports: [ProgressBarComponent],
      providers: [{ provide: OscService, useValue: oscServiceSpy }],
    }).compileComponents();

    oscService = TestBed.inject(OscService) as jasmine.SpyObj<OscService>;
    fixture = TestBed.createComponent(ProgressBarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with zero time', () => {
    expect(component.currentTime).toBe(0);
    expect(component.totalTime).toBe(0);
    expect(component.isPlaying).toBe(false);
  });

  it('should update current time from telemetry', () => {
    const status = { timePosition: 45.5 };
    (oscService.playbackStatus$ as BehaviorSubject<any>).next(status);

    expect(component.currentTime).toBe(45.5);
  });

  it('should update total time from telemetry', () => {
    const status = { timeDuration: 300.0 };
    (oscService.playbackStatus$ as BehaviorSubject<any>).next(status);

    expect(component.totalTime).toBe(300.0);
  });

  it('should update playing state from telemetry', () => {
    const status = { isPlaying: true };
    (oscService.playbackStatus$ as BehaviorSubject<any>).next(status);

    expect(component.isPlaying).toBe(true);
  });

  it('should format time correctly', () => {
    expect(component.formatTime(0)).toBe('0:00');
    expect(component.formatTime(60)).toBe('1:00');
    expect(component.formatTime(90)).toBe('1:30');
    expect(component.formatTime(300)).toBe('5:00');
  });

  it('should format time with leading zeros', () => {
    expect(component.formatTime(5)).toBe('0:05');
    expect(component.formatTime(125)).toBe('2:05');
  });

  it('should handle invalid time', () => {
    expect(component.formatTime(NaN)).toBe('0:00');
    expect(component.formatTime(undefined as any)).toBe('0:00');
  });

  it('should calculate progress percentage correctly', () => {
    component.totalTime = 100;
    component.currentTime = 0;
    expect(component.progressPercentage).toBe(0);

    component.currentTime = 50;
    expect(component.progressPercentage).toBe(50);

    component.currentTime = 100;
    expect(component.progressPercentage).toBe(100);
  });

  it('should cap progress percentage at 100', () => {
    component.totalTime = 100;
    component.currentTime = 150;
    expect(component.progressPercentage).toBe(100);
  });

  it('should handle zero total time', () => {
    component.totalTime = 0;
    component.currentTime = 0;
    expect(component.progressPercentage).toBe(0);
  });

  it('should return correct playback indicator text', () => {
    component.isPlaying = true;
    expect(component.playbackIndicator).toContain('Reproduzindo');

    component.isPlaying = false;
    expect(component.playbackIndicator).toContain('Pausado');
  });

  it('should return correct playback icon', () => {
    component.isPlaying = true;
    expect(component.playbackIcon).toBe('▶');

    component.isPlaying = false;
    expect(component.playbackIcon).toBe('⏸');
  });

  it('should clean up on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
