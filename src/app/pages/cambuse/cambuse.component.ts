import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs';

import { COMPANY_BUFFS, CompanyBuffDefinition, CompanyBuffId } from '../../core/models/company-buff.model';
import { CompanyBuffService } from '../../core/services/company-buff.service';

@Component({
  selector: 'app-cambuse',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cambuse.component.html',
  styleUrls: ['./cambuse.component.scss'],
})
export class CambuseComponent {
  private readonly companyBuffService = inject(CompanyBuffService);

  readonly buffs: CompanyBuffDefinition[] = COMPANY_BUFFS;
  readonly activeBuff$ = this.companyBuffService
    .getBuffState()
    .pipe(map((state) => state.activeBuff));

  isSaving = false;
  message = '';

  async activateBuff(buffId: CompanyBuffId): Promise<void> {
    this.isSaving = true;
    this.message = '';

    try {
      await this.companyBuffService.setActiveBuff(buffId);
      this.message = 'Buff activé.';
    } catch (error) {
      console.error(error);
      this.message = "Erreur lors de l'activation du buff.";
    } finally {
      this.isSaving = false;
    }
  }

  async clearBuff(): Promise<void> {
    this.isSaving = true;
    this.message = '';

    try {
      await this.companyBuffService.clearBuff();
      this.message = 'Aucun buff actif.';
    } catch (error) {
      console.error(error);
      this.message = 'Erreur lors de la désactivation du buff.';
    } finally {
      this.isSaving = false;
    }
  }
}
