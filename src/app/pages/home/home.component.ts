import { Component, inject } from '@angular/core';
import { AsyncPipe,  } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ AsyncPipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  private readonly authService = inject(AuthService);

  readonly user$ = this.authService.user$;
  readonly appUser$ = this.authService.appUser$;

  async login(): Promise<void> {
    await this.authService.loginWithGoogle();
  }
}