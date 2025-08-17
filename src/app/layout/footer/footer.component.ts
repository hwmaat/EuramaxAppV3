import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxSwitchModule, DxButtonModule } from 'devextreme-angular';
import { AuthService } from '@app/services/auth.service';
import { signal } from '@angular/core';
import { WithDestroy } from '@app/common/WithDestroy';
import { takeUntil } from 'rxjs';
import { Theme } from '@app/services/themea.service';
import { ThemeaService } from '@app/services/themea.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, DxSwitchModule, DxButtonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent extends WithDestroy() {
  currentYear = new Date().getFullYear();
  private themeService = inject(ThemeaService)
  private auth = inject(AuthService);
  username = signal<string | null>(null);
  administratie = "test";
  themeValue = false;

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
  }

  logout() {
    this.auth.logout();
  }

  themeChange(value: boolean) {
    const theme: Theme = value ? 'dark' : 'light';
    this.themeService.setTheme(theme);
  }

}
