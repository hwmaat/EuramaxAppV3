
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '../../components/login/login.component';

@Component({
  selector: 'app-frontpage',
  standalone: true,
  imports: [CommonModule, LoginComponent  ],
  templateUrl: './frontpage.component.html',
  styleUrls: ['./frontpage.component.scss']
})
export class FrontpageComponent {

}