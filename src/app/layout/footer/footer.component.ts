import { Component, effect, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxSwitchModule, DxButtonModule } from 'devextreme-angular';
import { AuthService } from '@app/services/auth.service';
import { signal } from '@angular/core';
import { WithDestroy } from '@app/common/WithDestroy';
import { takeUntil } from 'rxjs';
import { ThemeService } from '@app/services/theme.service';
import { Globals } from '@app/services/globals.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, DxSwitchModule, DxButtonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent extends WithDestroy() {
  currentYear = new Date().getFullYear();
  private themeService = inject(ThemeService)
  private auth = inject(AuthService);
  private globals = inject(Globals)
  username = signal<string | null>(null);
  administratie = "test";
  themeValue = true; // true for dark theme, false for light theme
  baseUrl='';

  constructor() {
    super();
    this.auth.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.username.set(user?.username ?? null);
      });

    // sync switch with current theme
    this.themeService.currentTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(t => {
        this.themeValue = t === 'dark';
      });

    effect(() => {
    const url = this.globals.apiBaseUrl(); // already trimmed & no trailing slash
    if (url) {
      this.baseUrl = url;
    }
    });
  }

  logout() {
    this.auth.logout();
  }

  themeChange(value: boolean) {
    this.themeService.switchTheme(value);
  }

}
