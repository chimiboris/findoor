import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap } from 'rxjs';
import { API_BASE } from './api-base';
import { Annonce, Transaction } from '../models/property.model';

export interface Stats {
  annonces: number;
  villes: number;
  regions: number;
  proprietairesVerifiesPct: number;
}

export type Sort = 'pertinence' | 'prix-asc' | 'prix-desc';

export interface Filters {
  transaction: Transaction;
  region: string;
  departement: string;
  arrondissement: string;
  quartier: string;
  meubleOui: boolean;
  meubleNon: boolean;
  types: string[];
  prixMin: number | null;
  prixMax: number | null;
  sort: Sort;
}

export function emptyFilters(transaction: Transaction = 'louer'): Filters {
  return {
    transaction,
    region: '',
    departement: '',
    arrondissement: '',
    quartier: '',
    meubleOui: false,
    meubleNon: false,
    types: [],
    prixMin: null,
    prixMax: null,
    sort: 'pertinence',
  };
}

/**
 * État de recherche partagé entre l'accueil et l'écran de résultats (signals), branché sur la vraie
 * API publique du backend (phase 3 — remplace les données bouchonnées de la phase 2).
 */
@Injectable({ providedIn: 'root' })
export class ListingsService {
  private readonly http = inject(HttpClient);

  readonly filters = signal<Filters>(emptyFilters());
  readonly loading = signal(false);

  readonly results = toSignal(
    toObservable(this.filters).pipe(
      tap(() => this.loading.set(true)),
      switchMap((f) =>
        this.http.get<Annonce[]>(`${API_BASE}/public/annonces`, { params: this.toParams(f) }).pipe(
          catchError(() => of<Annonce[]>([])),
        ),
      ),
      tap(() => this.loading.set(false)),
    ),
    { initialValue: [] as Annonce[] },
  );

  private readonly featuredResource = toSignal(
    this.http.get<Annonce[]>(`${API_BASE}/public/annonces/vedettes`).pipe(catchError(() => of<Annonce[]>([]))),
    { initialValue: [] as Annonce[] },
  );

  private readonly statsResource = toSignal(
    this.http.get<Stats>(`${API_BASE}/public/annonces/stats`).pipe(
      catchError(() => of<Stats>({ annonces: 0, villes: 0, regions: 0, proprietairesVerifiesPct: 0 })),
    ),
    { initialValue: { annonces: 0, villes: 0, regions: 0, proprietairesVerifiesPct: 0 } as Stats },
  );

  setFilters(patch: Partial<Filters>): void {
    this.filters.update((f) => ({ ...f, ...patch }));
  }

  resetFilters(): void {
    this.filters.update((f) => emptyFilters(f.transaction));
  }

  getById$(id: number) {
    return this.http.get<Annonce>(`${API_BASE}/public/annonces/${id}`).pipe(catchError(() => of<Annonce | undefined>(undefined)));
  }

  similarTo$(id: number) {
    return this.http.get<Annonce[]>(`${API_BASE}/public/annonces/${id}/similaires`).pipe(catchError(() => of<Annonce[]>([])));
  }

  featured(): Annonce[] {
    return this.featuredResource();
  }

  stats(): Stats {
    return this.statsResource();
  }

  private toParams(f: Filters): HttpParams {
    let params = new HttpParams().set('transaction', f.transaction).set('sort', f.sort);
    if (f.region) params = params.set('region', f.region);
    if (f.departement) params = params.set('departement', f.departement);
    if (f.arrondissement) params = params.set('arrondissement', f.arrondissement);
    if (f.quartier.trim()) params = params.set('quartier', f.quartier.trim());
    for (const t of f.types) params = params.append('types', t);
    if (f.meubleOui) params = params.set('meubleOui', 'true');
    if (f.meubleNon) params = params.set('meubleNon', 'true');
    if (f.prixMin != null) params = params.set('prixMin', f.prixMin);
    if (f.prixMax != null) params = params.set('prixMax', f.prixMax);
    return params;
  }
}
