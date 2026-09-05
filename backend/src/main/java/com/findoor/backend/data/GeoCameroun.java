package com.findoor.backend.data;

import java.util.ArrayList;
import java.util.List;

/**
 * Découpage administratif du Cameroun (région / département / arrondissement), porté à l'identique
 * depuis frontend/src/app/core/data/geo-cameroun.ts — réservé au jeu de données de démonstration
 * (voir DataSeeder). Le frontend a sa propre copie pour les listes déroulantes.
 */
public final class GeoCameroun {

    /** Chaque élément : {région, département, arrondissement}. */
    public static final List<String[]> LIEUX = build();

    private GeoCameroun() {}

    private static List<String[]> build() {
        List<String[]> out = new ArrayList<>();

        // Adamaoua
        dept(out, "Adamaoua", "Djérem", "Ngaoundal", "Tibati");
        dept(out, "Adamaoua", "Faro-et-Déo", "Galim-Tignère", "Kontcha", "Mayo-Baléo", "Tignère");
        dept(out, "Adamaoua", "Mayo-Banyo", "Bankim", "Banyo", "Mayo-Darlé");
        dept(out, "Adamaoua", "Mbéré", "Dir", "Djohong", "Meiganga", "Ngaoui");
        dept(out, "Adamaoua", "Vina", "Belel", "Martap", "Mbe", "Nganha", "Ngaoundéré I", "Ngaoundéré II", "Ngaoundéré III", "Nyambaka");

        // Centre
        dept(out, "Centre", "Haute-Sanaga", "Bibey", "Lembe-Yezoum", "Mbandjock", "Minta", "Nanga-Eboko", "Nkoteng", "Nsem");
        dept(out, "Centre", "Lekié", "Batchenga", "Ebebda", "Elig-Mfomo", "Evodoula", "Lobo", "Monatélé", "Obala", "Okola", "Sa'a");
        dept(out, "Centre", "Mbam-et-Inoubou", "Bafia", "Bokito", "Deuk", "Kiiki", "Kon-Yambetta", "Makénéné", "Ndikiniméki", "Nitoukou", "Ombessa");
        dept(out, "Centre", "Mbam-et-Kim", "Mbangassina", "Ngambè-Tikar", "Ngoro", "Ntui", "Yoko");
        dept(out, "Centre", "Méfou-et-Afamba", "Afanloum", "Assamba", "Awaé", "Edzendouan", "Esse", "Mfou", "Nkolafamba", "Soa");
        dept(out, "Centre", "Méfou-et-Akono", "Akono", "Bikok", "Mbankomo", "Ngoumou");
        dept(out, "Centre", "Mfoundi", "Yaoundé I", "Yaoundé II", "Yaoundé III", "Yaoundé IV", "Yaoundé V", "Yaoundé VI", "Yaoundé VII");
        dept(out, "Centre", "Nyong-et-Kéllé", "Biyouha", "Bondjock", "Bot-Makak", "Dibang", "Éséka", "Makak", "Matomb", "Messondo", "Ngog-Mapubi", "Nguibassal");
        dept(out, "Centre", "Nyong-et-Mfoumou", "Akonolinga", "Ayos", "Endom", "Mengang", "Nyakokombo");
        dept(out, "Centre", "Nyong-et-So'o", "Akoeman", "Dzeng", "Mbalmayo", "Mengueme", "Ngomedzap", "Nkolmetet");

        // Est
        dept(out, "Est", "Boumba-et-Ngoko", "Gari-Gombo", "Moloundou", "Salapoumbé", "Yokadouma");
        dept(out, "Est", "Haut-Nyong", "Abong-Mbang", "Bebend", "Dimako", "Dja", "Doumaintang", "Doumé", "Lomié", "Mboanz", "Mboma", "Messamena", "Messok", "Ngoyla", "Nguelemendouka", "Somalomo");
        dept(out, "Est", "Kadey", "Batouri", "Bombé", "Kette", "Mbang", "Mbotoro", "Ndelele", "Ndem-Nam");
        dept(out, "Est", "Lom-et-Djérem", "Bélabo", "Bertoua I", "Bertoua II", "Bétaré-Oya", "Diang", "Garoua-Boulaï", "Mandjou", "Ngoura");

        // Extrême-Nord
        dept(out, "Extrême-Nord", "Diamaré", "Bogo", "Dargala", "Gazawa", "Maroua I", "Maroua II", "Maroua III", "Meri", "Ndoukoula", "Petté");
        dept(out, "Extrême-Nord", "Logone-et-Chari", "Blangoua", "Darak", "Fotokol", "Goulfey", "Hile-Alifa", "Kousséri", "Logone-Birni", "Makary", "Waza", "Zina");
        dept(out, "Extrême-Nord", "Mayo-Danay", "Datcheka", "Gobo", "Guéré", "Kaï-Kaï", "Kalfou", "Kar-Hay", "Maga", "Tchati-Bali", "Vele", "Wina", "Yagoua");
        dept(out, "Extrême-Nord", "Mayo-Kani", "Guidiguis", "Kaélé", "Mindif", "Moulvoudaye", "Moutourwa", "Porhi", "Taibong");
        dept(out, "Extrême-Nord", "Mayo-Sava", "Kolofata", "Mora", "Tokombéré");
        dept(out, "Extrême-Nord", "Mayo-Tsanaga", "Bourrha", "Hina", "Koza", "Mayo-Moskota", "Mogode", "Mokolo", "Soulédé-Roua");

        // Littoral
        dept(out, "Littoral", "Moungo", "Abo Fiko", "Baré-Bakem", "Dibombari", "Loum", "Manjo", "Mbanga", "Melong", "Mombo", "Njombe-Penja", "Nkongsamba I", "Nkongsamba II", "Nkongsamba III", "Nlonako");
        dept(out, "Littoral", "Nkam", "Nkondjock", "Nord-Makombé", "Yabassi", "Yingui");
        dept(out, "Littoral", "Sanaga-Maritime", "Dibamba", "Dizangué", "Édéa I", "Édéa II", "Massock-Songloulou", "Mouanko", "Ndom", "Ngambe", "Ngwei", "Nyanon", "Pouma");
        dept(out, "Littoral", "Wouri", "Douala I", "Douala II", "Douala III", "Douala IV", "Douala V", "Douala VI");

        // Nord
        dept(out, "Nord", "Bénoué", "Baschéo", "Bibemi", "Dembo", "Demsa", "Garoua I", "Garoua II", "Garoua III", "Lagdo", "Mayo-Hourna", "Pitoa", "Tcheboa", "Touroua");
        dept(out, "Nord", "Faro", "Beka", "Poli");
        dept(out, "Nord", "Mayo-Louti", "Figuil", "Guider", "Mayo-Oulo");
        dept(out, "Nord", "Mayo-Rey", "Madingring", "Rey-Bouba", "Tcholliré", "Touboro");

        // Nord-Ouest
        dept(out, "Nord-Ouest", "Boyo", "Belo", "Bum", "Fundong", "Njinikom");
        dept(out, "Nord-Ouest", "Bui", "Jakiri", "Kumbo", "Mbven", "Nkum", "Noni", "Oku");
        dept(out, "Nord-Ouest", "Donga-Mantung", "Ako", "Misaje", "Ndu", "Nkambé", "Nwa");
        dept(out, "Nord-Ouest", "Menchum", "Fungom", "Furu-Awa", "Menchum Valley", "Wum");
        dept(out, "Nord-Ouest", "Mezam", "Bafut", "Bali", "Bamenda I", "Bamenda II", "Bamenda III", "Santa", "Tubah");
        dept(out, "Nord-Ouest", "Momo", "Batibo", "Mbengwi", "Ngie", "Njikwa", "Widikum-Menka");
        dept(out, "Nord-Ouest", "Ngo-Ketunjia", "Babessi", "Balikumbat", "Ndop");

        // Ouest
        dept(out, "Ouest", "Bamboutos", "Babadjou", "Batcham", "Galim", "Mbouda");
        dept(out, "Ouest", "Haut-Nkam", "Bafang", "Bakou", "Bana", "Bandja", "Banka", "Banwa", "Kékem");
        dept(out, "Ouest", "Hauts-Plateaux", "Baham", "Bamendjou", "Bangou", "Batié");
        dept(out, "Ouest", "Koung-Khi", "Bandjoun", "Bayangam", "Djebem", "Poumougne");
        dept(out, "Ouest", "Menoua", "Dschang", "Fokoué", "Fongo-Tongo", "Nkong-Ni", "Penka-Michel", "Santchou");
        dept(out, "Ouest", "Mifi", "Bafoussam I", "Bafoussam II", "Bafoussam III");
        dept(out, "Ouest", "Ndé", "Bangangté", "Bassamba", "Bazou", "Tonga");
        dept(out, "Ouest", "Noun", "Bangourain", "Foumban", "Foumbot", "Kouoptamo", "Koutaba", "Magba", "Malentouen", "Massangam", "Njimom");

        // Sud
        dept(out, "Sud", "Dja-et-Lobo", "Bengbis", "Djoum", "Meyomessala", "Meyomessi", "Mintom", "Oveng", "Sangmélima", "Zoétélé");
        dept(out, "Sud", "Mvila", "Biwong-Bane", "Biwong-Bulu", "Ebolowa I", "Ebolowa II", "Efoulan", "Mengong", "Mvangan", "Ngoulemakong");
        dept(out, "Sud", "Océan", "Akom II", "Bipindi", "Campo", "Kribi I", "Kribi II", "Lokoundje", "Lolodorf", "Mvengue", "Niete");
        dept(out, "Sud", "Vallée-du-Ntem", "Ambam", "Kyé-Ossi", "Ma'an", "Olamze");

        // Sud-Ouest
        dept(out, "Sud-Ouest", "Fako", "Buea", "Limbé I", "Limbé II", "Limbé III", "Muyuka", "Tiko", "West Coast");
        dept(out, "Sud-Ouest", "Koupé-Manengouba", "Bangem", "Nguti", "Tombel");
        dept(out, "Sud-Ouest", "Lebialem", "Alou", "Fontem", "Menji", "Wabane");
        dept(out, "Sud-Ouest", "Manyu", "Akwaya", "Eyumodjock", "Mamfé Central", "Upper Banyang");
        dept(out, "Sud-Ouest", "Meme", "Konye", "Kumba I", "Kumba II", "Kumba III", "Mbonge");
        dept(out, "Sud-Ouest", "Ndian", "Bamusso", "Dikome-Balue", "Ekondo-Titi", "Idabato", "Isanguele", "Kombo-Abedimo", "Kombo-Itindi", "Mundemba", "Toko");

        return out;
    }

    private static void dept(List<String[]> out, String region, String departement, String... arrondissements) {
        for (String arr : arrondissements) {
            out.add(new String[] {region, departement, arr});
        }
    }
}
