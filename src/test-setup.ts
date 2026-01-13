import { expect, afterEach, vi, beforeAll } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

// Initialize Angular testing environment
beforeAll(() => {
  TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
});

// Cleanup after each test
afterEach(() => {
  TestBed.resetTestingModule();
  vi.clearAllMocks();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = sessionStorageMock as any;

// Extend expect matchers
expect.extend({
  toHaveBeenCalledOnceWith(received: any, ...expected: any[]) {
    const pass = received.mock.calls.length === 1 &&
                 JSON.stringify(received.mock.calls[0]) === JSON.stringify(expected);
    return {
      pass,
      message: () =>
        pass
          ? `Expected function not to have been called once with ${JSON.stringify(expected)}`
          : `Expected function to have been called once with ${JSON.stringify(expected)}, but was called ${received.mock.calls.length} times`,
    };
  },
});
