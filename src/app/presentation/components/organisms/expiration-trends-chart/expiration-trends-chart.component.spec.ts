import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpirationTrendsChartComponent } from './expiration-trends-chart.component';
import { describe, it, expect, beforeEach } from 'vitest';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ChartCardComponent } from '../../molecules/chart-card/chart-card.component';

describe('ExpirationTrendsChartComponent', () => {
  let component: ExpirationTrendsChartComponent;
  let fixture: ComponentFixture<ExpirationTrendsChartComponent>;

  beforeEach(async () => {
    // Override ChartCardComponent to remove required inputs during tests
    TestBed.overrideComponent(ChartCardComponent, {
      set: { template: '<div></div>', inputs: [] },
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
