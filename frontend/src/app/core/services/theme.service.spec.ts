import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let prefersDark = false;

  beforeEach(() => {
    localStorage.clear();
    prefersDark = false;

    // Spy on window.matchMedia before injecting the service
    spyOn(window, 'matchMedia').and.callFake((query: string) => {
      return {
        matches: prefersDark,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      } as any;
    });
  });

  function initService() {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  }

  it('should be created', () => {
    initService();
    expect(service).toBeTruthy();
  });

  it('should default to light if storage is clear and system doesn\'t prefer dark', () => {
    prefersDark = false;
    initService();
    expect(service.isDark).toBeFalse();
  });

  it('should default to dark if storage is clear and system prefers dark', () => {
    prefersDark = true;
    initService();
    expect(service.isDark).toBeTrue();
  });

  it('should toggle theme correctly', () => {
    initService();
    const initial = service.isDark;
    service.toggleTheme();
    expect(service.isDark).toBe(!initial);
    service.toggleTheme();
    expect(service.isDark).toBe(initial);
  });

  it('should set theme and persist in localStorage', () => {
    initService();
    service.setTheme('dark');
    expect(service.isDark).toBeTrue();
    expect(localStorage.getItem('ecotrack_theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
