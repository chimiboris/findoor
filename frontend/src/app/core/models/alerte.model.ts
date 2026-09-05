/** Miroir de AlerteCreateRequest (backend) — critères de recherche + email, sans le tri. */
export interface AlerteCreateRequest {
  transaction: 'louer' | 'acheter';
  region: string;
  departement: string;
  arrondissement: string;
  quartier: string;
  types: string[];
  meubleOui: boolean;
  meubleNon: boolean;
  prixMin: number | null;
  prixMax: number | null;
  email: string;
}

/** Miroir de AlerteDTO (backend). */
export interface Alerte extends AlerteCreateRequest {
  id: number;
  actif: boolean;
  dateCreation: string;
}
