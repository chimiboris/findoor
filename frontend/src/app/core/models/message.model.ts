/** Miroir de MessageDTO (backend) — un message envoyé depuis une fiche annonce à son propriétaire. */
export interface MessageAnnonce {
  id: number;
  annonceId: number;
  annonceTitre: string;
  expediteurNom: string;
  expediteurEmail: string;
  expediteurTelephone?: string | null;
  contenu: string;
  lu: boolean;
  dateCreation: string;
}

/** Miroir de MessageCreateRequest (backend). */
export interface MessageCreateRequest {
  nom: string;
  email: string;
  telephone?: string;
  contenu: string;
}
