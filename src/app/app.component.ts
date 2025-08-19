import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { WithDestroy } from './common/WithDestroy';
import { takeUntil } from 'rxjs';
import { ApppageComponent } from "./layout/apppage/apppage.component";
import { FrontpageComponent } from "./layout/frontpage/frontpage.component";
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ApppageComponent, FrontpageComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends WithDestroy()  implements OnInit  {
  themeService = inject(ThemeService);
  username = signal<string | null>(null);
  private auth = inject(AuthService);

  constructor() {
    super();
    this.auth.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.username.set(user?.username ?? null);
      });
  }

  ngOnInit(): void {

  }

}
