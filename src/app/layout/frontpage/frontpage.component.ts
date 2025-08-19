
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '../../components/login/login.component';
import { ThemeService } from '@app/services/theme.service';

@Component({
  selector: 'app-frontpage',
  standalone: true,
  imports: [CommonModule, LoginComponent  ],
  templateUrl: './frontpage.component.html',
  styleUrls: ['./frontpage.component.scss']
})
export class FrontpageComponent {
 themeService = inject(ThemeService);

constructor() {

}
}