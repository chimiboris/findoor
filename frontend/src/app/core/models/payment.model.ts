/** Miroir de FormuleAbonnement (backend) — durées d'abonnement propriétaire proposées (phase 4). */
export type Formule = 'DEUX_MOIS' | 'QUATRE_MOIS' | 'SIX_MOIS' | 'HUIT_MOIS' | 'DIX_MOIS' | 'DOUZE_MOIS';

/** Miroir de MoyenPaiement (backend). */
export type Moyen = 'MTN_MOMO' | 'ORANGE_MONEY' | 'CARTE';

export interface FormuleOption {
  id: Formule;
  mois: number;
  prix: number;
  label: string;
}

/** Barème — doit rester synchronisé avec FormuleAbonnement.java (backend, source de vérité pour le prix facturé). */
export const FORMULES: FormuleOption[] = [
  { id: 'DEUX_MOIS', mois: 2, prix: 5000, label: '2 mois' },
  { id: 'QUATRE_MOIS', mois: 4, prix: 10000, label: '4 mois' },
  { id: 'SIX_MOIS', mois: 6, prix: 14000, label: '6 mois' },
  { id: 'HUIT_MOIS', mois: 8, prix: 18000, label: '8 mois' },
  { id: 'DIX_MOIS', mois: 10, prix: 21000, label: '10 mois' },
  { id: 'DOUZE_MOIS', mois: 12, prix: 24000, label: '12 mois' },
];

export const MOYENS: { id: Moyen; label: string }[] = [
  { id: 'MTN_MOMO', label: 'MTN Mobile Money' },
  { id: 'ORANGE_MONEY', label: 'Orange Money' },
  { id: 'CARTE', label: 'Carte bancaire' },
];

/** Miroir de PaiementDTO (backend). */
export interface Paiement {
  id: number;
  formule: Formule;
  moyen: Moyen;
  montant: number;
  statut: 'EN_ATTENTE' | 'REUSSI' | 'ECHOUE';
  reference: string;
  dateCreation: string;
  dateConfirmation?: string | null;
}

/** Miroir de AbonnementDTO (backend). */
export interface Abonnement {
  dateAccesExpire: string | null;
  actif: boolean;
}
