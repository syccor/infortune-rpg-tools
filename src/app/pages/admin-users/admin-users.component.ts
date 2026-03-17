import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { UsersService, AppUser } from '../../core/services/users.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
})
export class AdminUsersComponent {
  private readonly usersService = inject(UsersService);

  isSaving = false;
  actionMessage = '';

  readonly users$ = this.usersService.getUsers().pipe(
    map((users) =>
      [...users].sort((a, b) => {
        const roleA = a.role ?? '';
        const roleB = b.role ?? '';
        return (
          roleA.localeCompare(roleB) || (a.displayName ?? '').localeCompare(b.displayName ?? '')
        );
      }),
    ),
  );

  canAssignRole(user: AppUser): boolean {
    return !user.role;
  }

  async assignRole(user: AppUser, role: 'pj' | 'mj'): Promise<void> {
    if (!this.canAssignRole(user)) {
      return;
    }

    this.isSaving = true;
    this.actionMessage = '';

    try {
      await this.usersService.assignRole(user.uid, role);
      this.actionMessage = `Rôle "${role}" attribué à ${user.displayName || user.email || user.uid}.`;
    } catch (error) {
      console.error(error);
      this.actionMessage = 'Erreur lors de l’attribution du rôle.';
    } finally {
      this.isSaving = false;
    }
  }

  getRoleLabel(role: AppUser['role']): string {
    if (role === 'dev') return 'Dev';
    if (role === 'mj') return 'MJ';
    if (role === 'pj') return 'PJ';
    return 'En attente';
  }
}
