import { Annonce } from '../models/property.model';

export type StatutVisibilite = 'visible' | 'suspendue' | 'abonnement-expire';

/**
 * Distingue les 3 états réels d'une annonce (phase 4 — abonnement par période, pas par annonce) :
 * `actif` = suspension par un admin (indépendante du paiement) ; `abonnementProprietaireActif` =
 * le compte du propriétaire a un accès payé valide en ce moment. Les deux causes d'invisibilité sont
 * distinguées pour que le propriétaire (et l'admin) sachent précisément quoi faire.
 */
export function statutVisibilite(a: Pick<Annonce, 'actif' | 'abonnementProprietaireActif'>): StatutVisibilite {
  if (a.actif === false) return 'suspendue';
  if (a.abonnementProprietaireActif === false) return 'abonnement-expire';
  return 'visible';
}
