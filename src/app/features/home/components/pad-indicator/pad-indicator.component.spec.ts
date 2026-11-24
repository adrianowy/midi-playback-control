/**
 * Pad Indicator Component Unit Tests
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PadIndicatorComponent } from './pad-indicator.component';
import { OscService } from '@core/services/osc.service';
import { BehaviorSubject } from 'rxjs';

describe('PadIndicatorComponent', () => {
  let component: PadIndicatorComponent;
  let fixture: ComponentFixture<PadIndicatorComponent>;
  let oscService: jasmine.SpyObj<OscService>;

  beforeEach(async () => {
    const oscServiceSpy = jasmine.createSpyObj('OscService', ['startListening'], {
      playbackStatus$: new BehaviorSubject({}),
    });

    await TestBed.configureTestingModule({
      imports: [PadIndicatorComponent],
      providers: [{ provide: OscService, useValue: oscServiceSpy }],
    }).compileComponents();

    oscService = TestBed.inject(OscService) as jasmine.SpyObj<OscService>;
    fixture = TestBed.createComponent(PadIndicatorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize 8 pads', () => {
    expect(component.pads.length).toBe(8);
  });

  it('should initialize all pads as inactive', () => {
    expect(component.pads.every((pad) => !pad.isActive)).toBe(true);
  });

  it('should label pads correctly', () => {
    expect(component.pads[0].label).toBe('P1');
    expect(component.pads[7].label).toBe('P8');
  });

  it('should have correct pad IDs', () => {
    component.pads.forEach((pad, index) => {
      expect(pad.id).toBe(index);
    });
  });

  it('should update pad states from telemetry', () => {
    const padStates = [true, false, true, false, true, false, true, false];
    const status = { padStates };
    (oscService.playbackStatus$ as BehaviorSubject<any>).next(status);

    expect(component.pads[0].isActive).toBe(true);
    expect(component.pads[1].isActive).toBe(false);
    expect(component.pads[2].isActive).toBe(true);
    expect(component.pads[7].isActive).toBe(false);
  });

  it('should handle partial pad state updates', () => {
    const padStates = [true, true];
    const status = { padStates };
    (oscService.playbackStatus$ as BehaviorSubject<any>).next(status);

    expect(component.pads[0].isActive).toBe(true);
    expect(component.pads[1].isActive).toBe(true);
    expect(component.pads[2].isActive).toBe(false);
  });

  it('should return correct CSS class for active pad', () => {
    const activePad = { id: 0, isActive: true, label: 'P1' };
    const cssClass = component.getPadClass(activePad);

    expect(cssClass).toContain('pad-indicator__pad--active');
    expect(cssClass).not.toContain('pad-indicator__pad--inactive');
  });

  it('should return correct CSS class for inactive pad', () => {
    const inactivePad = { id: 1, isActive: false, label: 'P2' };
    const cssClass = component.getPadClass(inactivePad);

    expect(cssClass).toContain('pad-indicator__pad--inactive');
    expect(cssClass).not.toContain('pad-indicator__pad--active');
  });

  it('should return correct icon for active pad', () => {
    const activePad = { id: 0, isActive: true, label: 'P1' };
    expect(component.getPadIcon(activePad)).toBe('🔴');
  });

  it('should return correct icon for inactive pad', () => {
    const inactivePad = { id: 1, isActive: false, label: 'P2' };
    expect(component.getPadIcon(inactivePad)).toBe('⭕');
  });

  it('should handle non-array pad states gracefully', () => {
    const status = { padStates: null };
    expect(() => {
      (oscService.playbackStatus$ as BehaviorSubject<any>).next(status);
    }).not.toThrow();
  });

  it('should clean up on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });

  it('should maintain pad state after multiple updates', () => {
    let status = { padStates: [true, false, true, false, true, false, true, false] };
    (oscService.playbackStatus$ as BehaviorSubject<any>).next(status);

    status = { padStates: [false, true, false, true, false, true, false, true] };
    (oscService.playbackStatus$ as BehaviorSubject<any>).next(status);

    expect(component.pads[0].isActive).toBe(false);
    expect(component.pads[1].isActive).toBe(true);
  });
});
