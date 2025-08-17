import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Globals } from '@app/services/globals.service';
import { WithDestroy } from '@app/common/WithDestroy';
import { takeUntil } from 'rxjs';
import { DxButtonModule } from 'devextreme-angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, DxButtonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent extends WithDestroy() {
  @Output() toggleMenu = new EventEmitter<void>();

  logo = '';
  private globals = inject(Globals);

  constructor() {
    super();
    this.globals.settings$
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => {
        this.logo = 'assets/' + (config.logo || 'EuramaxLogo_light.png');
      });
  }
}
