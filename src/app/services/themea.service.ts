import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeaService {
  private currentThemeSubject = new BehaviorSubject<Theme>('light');
  public currentTheme$ = this.currentThemeSubject.asObservable();

  private readonly linkId = 'dx-theme';
  private readonly hrefs = {
    light: 'https://cdn.jsdelivr.net/npm/devextreme@25.1.4/dist/css/dx.material.orange.light.compact.css',
    dark:  'https://cdn.jsdelivr.net/npm/devextreme@25.1.4/dist/css/dx.material.orange.dark.compact.css'
  };

  constructor() {
    this.loadInitialTheme();
  }

  getTheme(): Theme {
    const saved = (localStorage.getItem('theme') as Theme) || 'light';
    return saved === 'dark' ? 'dark' : 'light';
  }

  private loadInitialTheme(): void {
    this.setTheme(this.getTheme());
  }

  setTheme(theme: Theme): void {
    localStorage.setItem('theme', theme);
    this.ensureThemeLink(theme);
    this.applyThemeClasses(theme);
    this.currentThemeSubject.next(theme);
  }

  toggleTheme(): void {
    this.setTheme(this.currentThemeSubject.value === 'light' ? 'dark' : 'light');
  }

  // --- helpers ---
  private ensureThemeLink(theme: Theme): void {
    let link = document.getElementById(this.linkId) as HTMLLinkElement | null;
    const href = this.hrefs[theme] + `?v=${Date.now()}`; // bust cache for reliable reload

    if (!link) {
      link = document.createElement('link');
      link.id = this.linkId;
      link.rel = 'stylesheet';
      link.type = 'text/css';
      document.head.appendChild(link);
    }
    link.href = href;
  }

  private applyThemeClasses(theme: Theme): void {
    const body = document.body;
    body.classList.add('dx-viewport'); // required by DevExtreme
    body.classList.remove('light-theme', 'dark-theme');
    body.classList.add(`${theme}-theme`);
  }
}