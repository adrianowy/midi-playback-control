/**
 * Track Info Component Unit Tests
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrackInfoComponent } from './track-info.component';
import { OscService } from '../../../core/services/osc.service';
import { BehaviorSubject } from 'rxjs';

describe('TrackInfoComponent', () => {
  let component: TrackInfoComponent;
  let fixture: ComponentFixture<TrackInfoComponent>;
  let oscService: jasmine.SpyObj<OscService>;

  beforeEach(async () => {
    const oscServiceSpy = jasmine.createSpyObj('OscService', ['startListening'], {
      playbackStatus$: new BehaviorSubject({}),
      error$: new BehaviorSubject(null),
    });

    await TestBed.configureTestingModule({
      imports: [TrackInfoComponent],
      providers: [{ provide: OscService, useValue: oscServiceSpy }],
    }).compileComponents();

    oscService = TestBed.inject(OscService) as jasmine.SpyObj<OscService>;
    fixture = TestBed.createComponent(TrackInfoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display loading state initially', () => {
    expect(component.isLoading).toBe(true);
    expect(component.trackName).toBe('Aguardando conexão...');
  });

  it('should update track name from telemetry', () => {
    const status = { trackName: 'Amazing Grace' };
    (oscService.playbackStatus$ as BehaviorSubject<any>).next(status);

    fixture.detectChanges();

    expect(component.trackName).toBe('Amazing Grace');
    expect(component.isLoading).toBe(false);
  });

  it('should update artist from telemetry', () => {
    const status = { trackArtist: 'John Newton' };
    (oscService.playbackStatus$ as BehaviorSubject<any>).next(status);

    expect(component.trackArtist).toBe('John Newton');
  });

  it('should update album from telemetry', () => {
    const status = { trackAlbum: 'Hymns' };
    (oscService.playbackStatus$ as BehaviorSubject<any>).next(status);

    expect(component.trackAlbum).toBe('Hymns');
  });

  it('should update section from telemetry', () => {
    const status = { currentSection: 'Verso 1' };
    (oscService.playbackStatus$ as BehaviorSubject<any>).next(status);

    expect(component.currentSection).toBe('Verso 1');
  });

  it('should handle errors from service', () => {
    const error = { message: 'Connection failed' };
    (oscService.error$ as any).next(error);

    expect(component.hasError).toBe(true);
    expect(component.errorMessage).toContain('OSC Error');
  });

  it('should track availability correctly', () => {
    expect(component.isTrackAvailable).toBe(false);

    const status = { trackName: 'Test Song' };
    (oscService.playbackStatus$ as BehaviorSubject<any>).next(status);

    expect(component.isTrackAvailable).toBe(true);
  });

  it('should clean up on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
