/** Modèles du domaine "annonce" — alignés sur la maquette validée (phase 2). */

export type Transaction = 'louer' | 'acheter';

export const TYPES_LOUER = ['Chambre', 'Studio', 'Appartement', 'Maison', 'Villa'] as const;
export const TYPES_ACHETER = ['Terrain', 'Maison', 'Appartement', 'Villa', 'Immeuble', 'Local commercial'] as const;
export type TypeBienLouer = (typeof TYPES_LOUER)[number];
export type TypeBienAcheter = (typeof TYPES_ACHETER)[number];
export type TypeBien = TypeBienLouer | TypeBienAcheter;

/** Icône de vignette par type de bien (voir shared/components/property-card). */
export const TYPE_ICON: Record<string, string> = {
  Chambre: 'bed',
  Studio: 'studio',
  Appartement: 'house',
  Maison: 'house',
  Villa: 'villa',
  Terrain: 'land',
  Immeuble: 'shop',
  'Local commercial': 'shop',
};

export interface Annonce {
  id: number;
  transaction: Transaction;
  type: TypeBien;
  meuble?: boolean;
  region: string;
  departement: string;
  /** Arrondissement (= "ville" au sens administratif camerounais). */
  ville: string;
  quartier: string;
  prix: number;
  /** '/mois' pour une location, '' pour une vente au prix net, ignoré si uniteM2. */
  unite?: string;
  /** true pour un terrain vendu au m² (voir prixTotal). */
  uniteM2?: boolean;
  prixTotal?: number;
  titre: string;
  surface: number;
  pieces?: number | null;
  chambres?: number | null;
  desc: string;
  equip: string[];
  owner: string;
  initials: string;
  /** Téléphone réel du propriétaire — contact WhatsApp/appel direct. */
  ownerTelephone?: string | null;
  /** Identifiant du compte propriétaire (pour le lien admin vers sa fiche). */
  ownerUserId?: number | null;
  /** URLs des photos uploadées par le propriétaire (peut être vide — vignette générée sinon). */
  photos?: string[];
  /** Position GPS approximative (voir GeoCoordonnees côté backend) — pour la carte interactive. */
  latitude?: number | null;
  longitude?: number | null;
  /** Suspension par un administrateur — indépendant de l'abonnement (voir ci-dessous). */
  actif?: boolean;
  /** false si l'abonnement (phase 4, paiement par période) du propriétaire est expiré/jamais
   * souscrit — l'annonce n'est alors pas visible publiquement même si `actif` vaut true. */
  abonnementProprietaireActif?: boolean;
}
