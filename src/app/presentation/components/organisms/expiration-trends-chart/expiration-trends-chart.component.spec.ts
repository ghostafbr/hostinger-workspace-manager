import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpirationTrendsChartComponent } from './expiration-trends-chart.component';
import { describe, it, expect, beforeEach } from 'vitest';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';

describe('ExpirationTrendsChartComponent', () => {
  let component: ExpirationTrendsChartComponent;
  let fixture: ComponentFixture<ExpirationTrendsChartComponent>;

  beforeEach(async () => {
    // Hack: Override inputs to avoid "Input is required" error in JIT
    TestBed.overrideComponent(ExpirationTrendsChartComponent, {
      set: { inputs: [] },
    });

    await TestBed.configureTestingModule({
      imports: [ExpirationTrendsChartComponent, NoopAnimationsModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpirationTrendsChartComponent);
    component = fixture.componentInstance;

    // Hack: Manually set the signal property
    Object.defineProperty(component, 'data', { value: signal([]) });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
