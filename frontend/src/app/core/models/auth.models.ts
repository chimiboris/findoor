/** Miroir des DTOs du backend (com.findoor.backend.web.dto). */

export type Role = 'VISITEUR' | 'PROPRIETAIRE' | 'ADMIN';

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  telephoneSecondaire?: string;
  motDePasse: string;
}

export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface UserResponse {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: Role;
  emailVerifie: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  utilisateur: UserResponse;
}
