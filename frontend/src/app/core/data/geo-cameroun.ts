/**
 * Découpage administratif complet du Cameroun : 10 régions, 58 départements, ~360 arrondissements
 * (chefs-lieux). Source : Wikipédia (départements du Cameroun) + citypopulation.de (arrondissements),
 * recoupées. Porté à l'identique depuis la maquette validée (phase 2).
 */

export interface Departement {
  chefLieu: string;
  arr: string[];
}

export interface Region {
  chefLieu: string;
  departements: Record<string, Departement>;
}

export const GEO_CM: Record<string, Region> = {
  Adamaoua: { chefLieu: 'Ngaoundéré', departements: {
    'Djérem': { chefLieu: 'Tibati', arr: ['Ngaoundal', 'Tibati'] },
    'Faro-et-Déo': { chefLieu: 'Tignère', arr: ['Galim-Tignère', 'Kontcha', 'Mayo-Baléo', 'Tignère'] },
    'Mayo-Banyo': { chefLieu: 'Banyo', arr: ['Bankim', 'Banyo', 'Mayo-Darlé'] },
    'Mbéré': { chefLieu: 'Meiganga', arr: ['Dir', 'Djohong', 'Meiganga', 'Ngaoui'] },
    'Vina': { chefLieu: 'Ngaoundéré', arr: ['Belel', 'Martap', 'Mbe', 'Nganha', 'Ngaoundéré I', 'Ngaoundéré II', 'Ngaoundéré III', 'Nyambaka'] },
  }},
  Centre: { chefLieu: 'Yaoundé', departements: {
    'Haute-Sanaga': { chefLieu: 'Nanga-Eboko', arr: ['Bibey', 'Lembe-Yezoum', 'Mbandjock', 'Minta', 'Nanga-Eboko', 'Nkoteng', 'Nsem'] },
    'Lekié': { chefLieu: 'Monatélé', arr: ['Batchenga', 'Ebebda', 'Elig-Mfomo', 'Evodoula', 'Lobo', 'Monatélé', 'Obala', 'Okola', "Sa'a"] },
    'Mbam-et-Inoubou': { chefLieu: 'Bafia', arr: ['Bafia', 'Bokito', 'Deuk', 'Kiiki', 'Kon-Yambetta', 'Makénéné', 'Ndikiniméki', 'Nitoukou', 'Ombessa'] },
    'Mbam-et-Kim': { chefLieu: 'Ntui', arr: ['Mbangassina', 'Ngambè-Tikar', 'Ngoro', 'Ntui', 'Yoko'] },
    'Méfou-et-Afamba': { chefLieu: 'Mfou', arr: ['Afanloum', 'Assamba', 'Awaé', 'Edzendouan', 'Esse', 'Mfou', 'Nkolafamba', 'Soa'] },
    'Méfou-et-Akono': { chefLieu: 'Ngoumou', arr: ['Akono', 'Bikok', 'Mbankomo', 'Ngoumou'] },
    'Mfoundi': { chefLieu: 'Yaoundé', arr: ['Yaoundé I', 'Yaoundé II', 'Yaoundé III', 'Yaoundé IV', 'Yaoundé V', 'Yaoundé VI', 'Yaoundé VII'] },
    'Nyong-et-Kéllé': { chefLieu: 'Éséka', arr: ['Biyouha', 'Bondjock', 'Bot-Makak', 'Dibang', 'Éséka', 'Makak', 'Matomb', 'Messondo', 'Ngog-Mapubi', 'Nguibassal'] },
    'Nyong-et-Mfoumou': { chefLieu: 'Akonolinga', arr: ['Akonolinga', 'Ayos', 'Endom', 'Mengang', 'Nyakokombo'] },
    "Nyong-et-So'o": { chefLieu: 'Mbalmayo', arr: ['Akoeman', 'Dzeng', 'Mbalmayo', 'Mengueme', 'Ngomedzap', 'Nkolmetet'] },
  }},
  Est: { chefLieu: 'Bertoua', departements: {
    'Boumba-et-Ngoko': { chefLieu: 'Yokadouma', arr: ['Gari-Gombo', 'Moloundou', 'Salapoumbé', 'Yokadouma'] },
    'Haut-Nyong': { chefLieu: 'Abong-Mbang', arr: ['Abong-Mbang', 'Bebend', 'Dimako', 'Dja', 'Doumaintang', 'Doumé', 'Lomié', 'Mboanz', 'Mboma', 'Messamena', 'Messok', 'Ngoyla', 'Nguelemendouka', 'Somalomo'] },
    'Kadey': { chefLieu: 'Batouri', arr: ['Batouri', 'Bombé', 'Kette', 'Mbang', 'Mbotoro', 'Ndelele', 'Ndem-Nam'] },
    'Lom-et-Djérem': { chefLieu: 'Bertoua', arr: ['Bélabo', 'Bertoua I', 'Bertoua II', 'Bétaré-Oya', 'Diang', 'Garoua-Boulaï', 'Mandjou', 'Ngoura'] },
  }},
  'Extrême-Nord': { chefLieu: 'Maroua', departements: {
    'Diamaré': { chefLieu: 'Maroua', arr: ['Bogo', 'Dargala', 'Gazawa', 'Maroua I', 'Maroua II', 'Maroua III', 'Meri', 'Ndoukoula', 'Petté'] },
    'Logone-et-Chari': { chefLieu: 'Kousséri', arr: ['Blangoua', 'Darak', 'Fotokol', 'Goulfey', 'Hile-Alifa', 'Kousséri', 'Logone-Birni', 'Makary', 'Waza', 'Zina'] },
    'Mayo-Danay': { chefLieu: 'Yagoua', arr: ['Datcheka', 'Gobo', 'Guéré', 'Kaï-Kaï', 'Kalfou', 'Kar-Hay', 'Maga', 'Tchati-Bali', 'Vele', 'Wina', 'Yagoua'] },
    'Mayo-Kani': { chefLieu: 'Kaélé', arr: ['Guidiguis', 'Kaélé', 'Mindif', 'Moulvoudaye', 'Moutourwa', 'Porhi', 'Taibong'] },
    'Mayo-Sava': { chefLieu: 'Mora', arr: ['Kolofata', 'Mora', 'Tokombéré'] },
    'Mayo-Tsanaga': { chefLieu: 'Mokolo', arr: ['Bourrha', 'Hina', 'Koza', 'Mayo-Moskota', 'Mogode', 'Mokolo', 'Soulédé-Roua'] },
  }},
  Littoral: { chefLieu: 'Douala', departements: {
    'Moungo': { chefLieu: 'Nkongsamba', arr: ['Abo Fiko', 'Baré-Bakem', 'Dibombari', 'Loum', 'Manjo', 'Mbanga', 'Melong', 'Mombo', 'Njombe-Penja', 'Nkongsamba I', 'Nkongsamba II', 'Nkongsamba III', 'Nlonako'] },
    'Nkam': { chefLieu: 'Yabassi', arr: ['Nkondjock', 'Nord-Makombé', 'Yabassi', 'Yingui'] },
    'Sanaga-Maritime': { chefLieu: 'Édéa', arr: ['Dibamba', 'Dizangué', 'Édéa I', 'Édéa II', 'Massock-Songloulou', 'Mouanko', 'Ndom', 'Ngambe', 'Ngwei', 'Nyanon', 'Pouma'] },
    'Wouri': { chefLieu: 'Douala', arr: ['Douala I', 'Douala II', 'Douala III', 'Douala IV', 'Douala V', 'Douala VI'] },
  }},
  Nord: { chefLieu: 'Garoua', departements: {
    'Bénoué': { chefLieu: 'Garoua', arr: ['Baschéo', 'Bibemi', 'Dembo', 'Demsa', 'Garoua I', 'Garoua II', 'Garoua III', 'Lagdo', 'Mayo-Hourna', 'Pitoa', 'Tcheboa', 'Touroua'] },
    'Faro': { chefLieu: 'Poli', arr: ['Beka', 'Poli'] },
    'Mayo-Louti': { chefLieu: 'Guider', arr: ['Figuil', 'Guider', 'Mayo-Oulo'] },
    'Mayo-Rey': { chefLieu: 'Tcholliré', arr: ['Madingring', 'Rey-Bouba', 'Tcholliré', 'Touboro'] },
  }},
  'Nord-Ouest': { chefLieu: 'Bamenda', departements: {
    'Boyo': { chefLieu: 'Fundong', arr: ['Belo', 'Bum', 'Fundong', 'Njinikom'] },
    'Bui': { chefLieu: 'Kumbo', arr: ['Jakiri', 'Kumbo', 'Mbven', 'Nkum', 'Noni', 'Oku'] },
    'Donga-Mantung': { chefLieu: 'Nkambé', arr: ['Ako', 'Misaje', 'Ndu', 'Nkambé', 'Nwa'] },
    'Menchum': { chefLieu: 'Wum', arr: ['Fungom', 'Furu-Awa', 'Menchum Valley', 'Wum'] },
    'Mezam': { chefLieu: 'Bamenda', arr: ['Bafut', 'Bali', 'Bamenda I', 'Bamenda II', 'Bamenda III', 'Santa', 'Tubah'] },
    'Momo': { chefLieu: 'Mbengwi', arr: ['Batibo', 'Mbengwi', 'Ngie', 'Njikwa', 'Widikum-Menka'] },
    'Ngo-Ketunjia': { chefLieu: 'Ndop', arr: ['Babessi', 'Balikumbat', 'Ndop'] },
  }},
  Ouest: { chefLieu: 'Bafoussam', departements: {
    'Bamboutos': { chefLieu: 'Mbouda', arr: ['Babadjou', 'Batcham', 'Galim', 'Mbouda'] },
    'Haut-Nkam': { chefLieu: 'Bafang', arr: ['Bafang', 'Bakou', 'Bana', 'Bandja', 'Banka', 'Banwa', 'Kékem'] },
    'Hauts-Plateaux': { chefLieu: 'Baham', arr: ['Baham', 'Bamendjou', 'Bangou', 'Batié'] },
    'Koung-Khi': { chefLieu: 'Bandjoun', arr: ['Bandjoun', 'Bayangam', 'Djebem', 'Poumougne'] },
    'Menoua': { chefLieu: 'Dschang', arr: ['Dschang', 'Fokoué', 'Fongo-Tongo', 'Nkong-Ni', 'Penka-Michel', 'Santchou'] },
    'Mifi': { chefLieu: 'Bafoussam', arr: ['Bafoussam I', 'Bafoussam II', 'Bafoussam III'] },
    'Ndé': { chefLieu: 'Bangangté', arr: ['Bangangté', 'Bassamba', 'Bazou', 'Tonga'] },
    'Noun': { chefLieu: 'Foumban', arr: ['Bangourain', 'Foumban', 'Foumbot', 'Kouoptamo', 'Koutaba', 'Magba', 'Malentouen', 'Massangam', 'Njimom'] },
  }},
  Sud: { chefLieu: 'Ebolowa', departements: {
    'Dja-et-Lobo': { chefLieu: 'Sangmélima', arr: ['Bengbis', 'Djoum', 'Meyomessala', 'Meyomessi', 'Mintom', 'Oveng', 'Sangmélima', 'Zoétélé'] },
    'Mvila': { chefLieu: 'Ebolowa', arr: ['Biwong-Bane', 'Biwong-Bulu', 'Ebolowa I', 'Ebolowa II', 'Efoulan', 'Mengong', 'Mvangan', 'Ngoulemakong'] },
    'Océan': { chefLieu: 'Kribi', arr: ['Akom II', 'Bipindi', 'Campo', 'Kribi I', 'Kribi II', 'Lokoundje', 'Lolodorf', 'Mvengue', 'Niete'] },
    'Vallée-du-Ntem': { chefLieu: 'Ambam', arr: ['Ambam', 'Kyé-Ossi', "Ma'an", 'Olamze'] },
  }},
  'Sud-Ouest': { chefLieu: 'Buea', departements: {
    'Fako': { chefLieu: 'Limbé', arr: ['Buea', 'Limbé I', 'Limbé II', 'Limbé III', 'Muyuka', 'Tiko', 'West Coast'] },
    'Koupé-Manengouba': { chefLieu: 'Bangem', arr: ['Bangem', 'Nguti', 'Tombel'] },
    'Lebialem': { chefLieu: 'Menji', arr: ['Alou', 'Fontem', 'Menji', 'Wabane'] },
    'Manyu': { chefLieu: 'Mamfé', arr: ['Akwaya', 'Eyumodjock', 'Mamfé Central', 'Upper Banyang'] },
    'Meme': { chefLieu: 'Kumba', arr: ['Konye', 'Kumba I', 'Kumba II', 'Kumba III', 'Mbonge'] },
    'Ndian': { chefLieu: 'Mundemba', arr: ['Bamusso', 'Dikome-Balue', 'Ekondo-Titi', 'Idabato', 'Isanguele', 'Kombo-Abedimo', 'Kombo-Itindi', 'Mundemba', 'Toko'] },
  }},
};

export const REGIONS = Object.keys(GEO_CM);

/** Toutes les villes/arrondissements d'une région, tous départements confondus, triés. */
export function allArrOfRegion(region: string): string[] {
  const depts = GEO_CM[region]?.departements ?? {};
  return Object.values(depts)
    .flatMap((d) => d.arr)
    .sort((a, b) => a.localeCompare(b, 'fr'));
}

/** Arrondissements d'un département donné, triés (ou tous ceux de la région si département vide). */
export function arrOf(region: string, departement: string): string[] {
  if (region && departement) {
    return [...(GEO_CM[region]?.departements?.[departement]?.arr ?? [])].sort((a, b) => a.localeCompare(b, 'fr'));
  }
  return region ? allArrOfRegion(region) : [];
}

export function departementsOf(region: string): string[] {
  return region ? Object.keys(GEO_CM[region]?.departements ?? {}) : [];
}
