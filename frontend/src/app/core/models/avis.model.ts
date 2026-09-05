/** Miroir de AvisDTO (backend) — un avis déposé sur une annonce, visible publiquement une fois modéré. */
export interface Avis {
  id: number;
  annonceId: number;
  annonceTitre: string;
  nom: string;
  email?: string | null;
  note: number;
  commentaire: string;
  statut: 'EN_ATTENTE' | 'PUBLIE' | 'REJETE';
  dateCreation: string;
}

/** Miroir de AvisCreateRequest (backend). */
export interface AvisCreateRequest {
  nom: string;
  email?: string;
  note: number;
  commentaire: string;
}

/** Miroir de AvisResumeDTO (backend) — moyenne + total des avis publiés d'une annonce. */
export interface AvisResume {
  moyenne: number;
  total: number;
}
