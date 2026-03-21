export type CompanyBuffId = 'none' | 'comforting-stew' | 'combat-rations';

export interface CompanyBuffDefinition {
  id: Exclude<CompanyBuffId, 'none'>;
  title: string;
  description: string;
}

export interface CompanyBuffState {
  activeBuff: CompanyBuffId;
  activatedAt?: unknown;
  updatedAt?: unknown;
}

export const COMPANY_BUFFS: CompanyBuffDefinition[] = [
  {
    id: 'comforting-stew',
    title: 'Ragoût réconfortant',
    description:
      'Augmente le maximum de PV des personnages de 15. Ce bonus change les seuils 10/25/50 en mission mais ne change pas la régénération quotidienne.',
  },
  {
    id: 'combat-rations',
    title: 'Rations de combat',
    description: "Augmente l'esquive de 5 sans dépasser la limite.",
  },
];
