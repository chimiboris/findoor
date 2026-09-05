/** Saisie du formulaire propriétaire — miroir de AnnonceCreateRequest (backend). */
export interface AnnonceFormValue {
  transaction: 'louer' | 'acheter';
  type: string;
  meuble: boolean | null;
  region: string;
  departement: string;
  ville: string;
  quartier: string;
  prix: number;
  unite: string;
  uniteM2: boolean;
  prixTotal: number | null;
  titre: string;
  surface: number;
  pieces: number | null;
  chambres: number | null;
  desc: string;
  equip: string[];
  /** Édition uniquement : URLs des photos existantes conservées. */
  keepPhotos?: string[];
  /** Réservé aux endpoints admin : propriétaire auquel rattacher/réassigner l'annonce. */
  ownerUserId?: number | null;
}

export function emptyAnnonceForm(): AnnonceFormValue {
  return {
    transaction: 'louer',
    type: 'Chambre',
    meuble: true,
    region: '',
    departement: '',
    ville: '',
    quartier: '',
    prix: 0,
    unite: '/mois',
    uniteM2: false,
    prixTotal: null,
    titre: '',
    surface: 0,
    pieces: null,
    chambres: null,
    desc: '',
    equip: [],
  };
}
