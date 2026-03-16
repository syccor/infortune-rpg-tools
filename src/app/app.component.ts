import { Component, inject } from '@angular/core';
import { NgIf, AsyncPipe } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, AsyncPipe, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  menuOpen = true;
  private readonly authService = inject(AuthService);
  readonly user$ = this.authService.user$;

  async login(): Promise<void> {
    await this.authService.loginWithGoogle();
  }

  async logout(): Promise<void> {
    await this.authService.logout();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
