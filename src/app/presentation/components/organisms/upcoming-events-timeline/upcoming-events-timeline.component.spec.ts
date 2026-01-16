import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpcomingEventsTimelineComponent } from './upcoming-events-timeline.component';
import { describe, it, expect, beforeEach } from 'vitest';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';

describe('UpcomingEventsTimelineComponent', () => {
  let component: UpcomingEventsTimelineComponent;
  let fixture: ComponentFixture<UpcomingEventsTimelineComponent>;

  beforeEach(async () => {
    TestBed.overrideComponent(UpcomingEventsTimelineComponent, {
      set: { inputs: [] },
    });

    await TestBed.configureTestingModule({
      imports: [UpcomingEventsTimelineComponent, NoopAnimationsModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UpcomingEventsTimelineComponent);
    component = fixture.componentInstance;

    // Hack: Manually set the signal property
    Object.defineProperty(component, 'events', { value: signal([]) });
    Object.defineProperty(component, 'title', { value: signal('Title') });
    Object.defineProperty(component, 'maxEvents', { value: signal(10) });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
