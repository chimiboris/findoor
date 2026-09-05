import { Role } from './auth.models';

/** Miroir de UserAdminDTO (backend) — vue "back-office" d'un compte utilisateur. */
export interface UserAdmin {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: Role;
  actif: boolean;
  emailVerifie: boolean;
  dateCreation: string;
  /** Abonnement propriétaire (phase 4, paiement par période) — null si jamais souscrit. */
  dateAccesExpire?: string | null;
  abonnementActif: boolean;
}

/** Miroir de AdminUserCreateRequest (backend). */
export interface AdminUserCreateRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  motDePasse: string;
  role: Role;
  /** Optionnel — date ISO pour accorder immédiatement l'accès (phase 4) au compte créé. */
  dateAccesExpire?: string;
}

/** Miroir de AdminUserUpdateRequest (backend). */
export interface AdminUserUpdateRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: Role;
  nouveauMotDePasse?: string;
  /** Date ISO ("2027-03-15") jusqu'à laquelle l'accès (phase 4) est valide, ou '' pour le couper —
   * permet à l'admin de corriger manuellement un paiement en échec (réseau, etc.). */
  dateAccesExpire?: string;
}

/** Miroir de AdminStatsDTO (backend). */
export interface AdminStats {
  annoncesTotal: number;
  annoncesActives: number;
  annoncesInactives: number;
  utilisateursTotal: number;
  proprietaires: number;
  admins: number;
  comptesInactifs: number;
}
