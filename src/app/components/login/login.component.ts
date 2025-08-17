import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { takeUntil } from 'rxjs';
import { WithDestroy } from '../../common/WithDestroy';
import { FormsModule } from '@angular/forms'; // <-- Add this import
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent extends WithDestroy() {
  auth = inject(AuthService);
  error = signal('');
  loginData = { username: '', password: '' };

  login() {
    const { username, password } = this.loginData;
    this.auth.login({ username, password })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.error.set(''),
        error: () => this.error.set('Login failed'),
      });
  }
}