package com.findoor.backend.config;

import com.findoor.backend.data.GeoCameroun;
import com.findoor.backend.domain.Annonce;
import com.findoor.backend.domain.Role;
import com.findoor.backend.domain.User;
import com.findoor.backend.data.GeoCoordonnees;
import com.findoor.backend.repository.AnnonceRepository;
import com.findoor.backend.repository.UserRepository;
import com.findoor.backend.service.SeedPhotoPool;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Jeu de données de démonstration : une vingtaine de comptes propriétaires réels + 220+ annonces
 * réparties sur toute la géographie camerounaise, pour visualiser l'application "comme si elle
 * fonctionnait déjà" avant le branchement d'un vrai flux de création d'annonces (phase 3).
 * Ne s'exécute qu'une fois (idempotent : ignoré si la table `annonces` n'est pas vide).
 */
@Component
@Order(10)
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

    private static final int NB_ANNONCES = 224;
    private static final String MOT_DE_PASSE_DEMO = "Findoor2026!";

    private static final String[][] PROPRIETAIRES = {
        {"Ngo", "Marie"}, {"Etoundi", "Paul"}, {"Fouda", "Jean"}, {"Mballa", "Alice"},
        {"Nkolo", "Emmanuel"}, {"Abena", "Sandrine"}, {"Tchoumi", "Christian"}, {"Fotso", "Josiane"},
        {"Meka", "Roger"}, {"Ateba", "Bernadette"}, {"Nana", "Serge"}, {"Belinga", "Carine"},
        {"Njoya", "Patrick"}, {"Manga", "Odette"}, {"Kamdem", "Yves"}, {"Bello", "Aïcha"},
        {"Fongang", "Hervé"}, {"Ekwalla", "Solange"}, {"Mvondo", "Georges"}, {"Talla", "Nadège"},
    };

    private static final String[] TYPES_LOUER = {"Chambre", "Studio", "Appartement", "Maison", "Villa"};
    private static final String[] TYPES_ACHETER = {"Terrain", "Maison", "Appartement", "Villa", "Immeuble", "Local commercial"};

    private static final String[] QUARTIERS_YAOUNDE = {
        "Bastos", "Bonanjo", "Odza", "Nkolbisson", "Biyem-Assi", "Essos", "Ngousso", "Mendong",
        "Nkoabang", "Mvan", "Emombo", "Nsimeyong", "Tsinga", "Ekounou", "Mvog-Mbi", "Etoug-Ebe",
    };
    private static final String[] QUARTIERS_DOUALA = {
        "Bonapriso", "Akwa", "Bonanjo", "Bali", "Deido", "Bonamoussadi", "Makepe", "Ndogbong",
        "New-Bell", "Kotto", "Logbessou", "PK14",
    };
    private static final String[] QUARTIERS_GENERIQUES = {
        "Centre-ville", "Marché", "Carrefour", "Château d'eau", "Nouvelle route", "Aéroport", "Résidentiel",
    };
    private static final List<String> VILLES_COTIERES = List.of("Kribi I", "Kribi II", "Limbé I", "Limbé II", "Limbé III");

    private static final String[] EQUIP_LOCATION = {
        "Climatisation", "Eau courante", "Internet inclus", "Sécurité 24h/24", "Parking privé",
        "Groupe électrogène", "Cuisine équipée", "Forage à eau", "Cour commune", "Portail sécurisé",
        "Gardiennage", "Balcon",
    };
    private static final String[] EQUIP_VENTE_BATI = {
        "Ascenseur", "Parking souterrain", "Jardin paysager", "Piscine", "Garage 2 voitures",
        "Système de sécurité", "Véranda", "Forage à eau", "Panneaux solaires", "Mur de clôture",
    };
    private static final String[] EQUIP_TERRAIN = {
        "Titre foncier disponible", "Route bitumée à proximité", "Terrain plat", "Eau et électricité en bordure",
        "Terrain viabilisé", "Bornage réalisé",
    };

    private static final String[] CLOTURES_LOCATION = {
        "Idéal pour un jeune actif ou une petite famille.",
        "Quartier calme et bien desservi, à proximité des commerces.",
        "Accès facile aux transports en commun et aux axes principaux.",
        "Résidence sécurisée avec gardiennage permanent.",
        "Cadre agréable, proche des écoles et du marché.",
    };
    private static final String[] CLOTURES_VENTE_BATI = {
        "Idéal pour une résidence principale ou un investissement locatif.",
        "Quartier résidentiel calme, en pleine expansion.",
        "Proche des commodités : écoles, marché, axes bitumés.",
        "Bien à visiter rapidement, forte demande dans le secteur.",
    };
    private static final String[] CLOTURES_TERRAIN = {
        "Idéal pour un projet de construction résidentielle ou commerciale.",
        "Terrain viabilisé, accès facile toute l'année.",
        "Situé dans une zone en plein développement.",
        "Dossier foncier à jour, transaction sécurisée.",
    };

    private final UserRepository userRepository;
    private final AnnonceRepository annonceRepository;
    private final PasswordEncoder passwordEncoder;
    private final SeedPhotoPool seedPhotoPool;

    private static final String ADMIN_EMAIL = "admin@findoor.cm";
    private static final String ADMIN_TELEPHONE = "+237 695 63 75 55";

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedAdmin();

        if (annonceRepository.count() > 0) {
            log.info("DataSeeder : {} annonces déjà en base, jeu de données ignoré.", annonceRepository.count());
            return;
        }

        List<User> proprietaires = seedProprietaires();
        seedAnnonces(proprietaires);
        log.info("DataSeeder : {} comptes propriétaires et {} annonces créés.", proprietaires.size(), NB_ANNONCES);
    }

    /** Compte administrateur principal (back-office) — créé une seule fois, numéro tenu à jour ensuite. */
    private void seedAdmin() {
        userRepository.findByEmail(ADMIN_EMAIL).ifPresentOrElse(
                admin -> {
                    if (!ADMIN_TELEPHONE.equals(admin.getTelephone())) {
                        admin.setTelephone(ADMIN_TELEPHONE);
                    }
                },
                () -> {
                    userRepository.save(User.builder()
                            .nom("Findoor")
                            .prenom("Admin")
                            .email(ADMIN_EMAIL)
                            .telephone(ADMIN_TELEPHONE)
                            .motDePasse(passwordEncoder.encode(MOT_DE_PASSE_DEMO))
                            .role(Role.ADMIN)
                            .actif(true)
                            .emailVerifie(true)
                            .build());
                    log.info("DataSeeder : compte administrateur {} créé.", ADMIN_EMAIL);
                });
    }

    private List<User> seedProprietaires() {
        List<User> proprietaires = new ArrayList<>();
        String motDePasseHache = passwordEncoder.encode(MOT_DE_PASSE_DEMO);

        for (String[] p : PROPRIETAIRES) {
            String nom = p[0];
            String prenom = p[1];
            String email = sansAccents(prenom) + "." + sansAccents(nom) + "@demo.findoor.cm";

            User user = userRepository.findByEmail(email).orElseGet(() -> userRepository.save(User.builder()
                    .nom(nom)
                    .prenom(prenom)
                    .email(email)
                    .telephone(telephoneDemo(proprietaires.size()))
                    .motDePasse(motDePasseHache)
                    .role(Role.PROPRIETAIRE)
                    .actif(true)
                    .emailVerifie(true)
                    .build()));
            // Comptes de démonstration : abonnement (phase 4) toujours maintenu valide (backfill
            // inclus, pour les comptes créés avant l'introduction de l'abonnement) afin que les
            // annonces seedées restent visibles sans avoir à payer.
            if (!user.abonnementActif()) {
                user.setDateAccesExpire(java.time.LocalDate.now().plusYears(1));
            }
            proprietaires.add(user);
        }
        return proprietaires;
    }

    private void seedAnnonces(List<User> proprietaires) {
        Random rnd = new Random(2026);
        List<String[]> lieux = GeoCameroun.LIEUX;
        List<Annonce> annonces = new ArrayList<>();

        for (int i = 0; i < NB_ANNONCES; i++) {
            String[] lieu = lieux.get(rnd.nextInt(lieux.size()));
            String region = lieu[0];
            String departement = lieu[1];
            String ville = lieu[2];
            boolean grandeVille = estGrandeVille(ville);

            boolean louer = rnd.nextInt(10) < 6; // ~60% location / 40% vente
            String transaction = louer ? "louer" : "acheter";
            String type = louer ? TYPES_LOUER[rnd.nextInt(TYPES_LOUER.length)] : TYPES_ACHETER[rnd.nextInt(TYPES_ACHETER.length)];
            String quartier = quartierPour(ville, rnd);
            User proprietaire = proprietaires.get(i % proprietaires.size());

            double[] position = GeoCoordonnees.pour(region, ville, rnd);

            Annonce.AnnonceBuilder b = Annonce.builder()
                    .transaction(transaction)
                    .type(type)
                    .region(region)
                    .departement(departement)
                    .ville(ville)
                    .quartier(quartier)
                    .latitude(position[0])
                    .longitude(position[1])
                    .ownerNom(proprietaire.getPrenom() + " " + proprietaire.getNom())
                    .ownerInitials(("" + proprietaire.getPrenom().charAt(0) + proprietaire.getNom().charAt(0)).toUpperCase(Locale.FRENCH))
                    .ownerTelephone(proprietaire.getTelephone())
                    .ownerUserId(proprietaire.getId())
                    .actif(true)
                    .vedette(i % 28 == 0);

            if (louer) {
                remplirLocation(b, type, quartier, ville, grandeVille, rnd);
            } else {
                remplirVente(b, type, quartier, ville, grandeVille, rnd);
            }

            Annonce annonce = b.build();
            annonce.setDateCreation(LocalDateTime.now().minusDays(rnd.nextInt(180)));
            annonce.setDateMaj(annonce.getDateCreation());
            annonce.setPhotos(choisirPhotos(annonce.getType(), rnd));
            annonces.add(annonce);
        }

        annonceRepository.saveAll(annonces);
    }

    /** Au moins 3 vraies photos (Wikimedia Commons, libres de droits) piochées dans le lot embarqué
     * sous src/main/resources/seed-photos/, réutilisées au besoin d'une annonce à l'autre. */
    private List<String> choisirPhotos(String type, Random rnd) {
        List<String> disponibles = new ArrayList<>(seedPhotoPool.urlsPour(type));
        if (disponibles.isEmpty()) return List.of();
        java.util.Collections.shuffle(disponibles, rnd);
        int n = Math.min(disponibles.size(), 3 + rnd.nextInt(2));
        return new ArrayList<>(disponibles.subList(0, n));
    }

    private void remplirLocation(Annonce.AnnonceBuilder b, String type, String quartier, String ville, boolean grandeVille, Random rnd) {
        boolean meuble = rnd.nextBoolean();
        int surface;
        int pieces;
        int chambres;
        long prixBase;

        switch (type) {
            case "Chambre" -> { surface = 10 + rnd.nextInt(11); pieces = 1; chambres = 1; prixBase = 15000 + rnd.nextInt(45000); }
            case "Studio" -> { surface = 20 + rnd.nextInt(16); pieces = 1; chambres = 1; prixBase = 40000 + rnd.nextInt(110000); }
            case "Appartement" -> { pieces = 2 + rnd.nextInt(3); chambres = pieces - 1; surface = 45 + rnd.nextInt(76); prixBase = 80000 + rnd.nextInt(270000); }
            case "Maison" -> { pieces = 3 + rnd.nextInt(4); chambres = pieces - 1; surface = 90 + rnd.nextInt(131); prixBase = 100000 + rnd.nextInt(300000); }
            default -> { pieces = 4 + rnd.nextInt(5); chambres = pieces - 2; surface = 150 + rnd.nextInt(301); prixBase = 200000 + rnd.nextInt(600000); } // Villa
        }

        long prix = grandeVille ? prixBase : Math.round(prixBase * 0.5);
        String accordMeuble = ("Chambre".equals(type) || "Maison".equals(type) || "Villa".equals(type))
                ? (meuble ? "meublée" : "non meublée")
                : (meuble ? "meublé" : "non meublé");
        String titre = "%s %s à %s".formatted(type, accordMeuble, quartier);
        String desc = "%s %s %s à %s, %s. %s".formatted(
                articleType(type), type.toLowerCase(Locale.FRENCH), situe(type), quartier, ville, pick(CLOTURES_LOCATION, rnd));

        b.meuble(meuble)
                .prix(prix)
                .unite("/mois")
                .uniteM2(false)
                .titre(titre)
                .surface(surface)
                .pieces(pieces)
                .chambres(chambres)
                .description(desc)
                .equipements(equip(EQUIP_LOCATION, rnd));
    }

    private void remplirVente(Annonce.AnnonceBuilder b, String type, String quartier, String ville, boolean grandeVille, Random rnd) {
        if ("Terrain".equals(type)) {
            int surface = 200 + rnd.nextInt(1801);
            long prixM2 = Math.round((grandeVille ? 3000 + rnd.nextInt(12000) : 1000 + rnd.nextInt(4000)) * 1.0);
            long prixTotal = prixM2 * surface;
            String titre = "Terrain titré %d m² à %s".formatted(surface, quartier.equals(ville) ? ville : quartier + ", " + ville);
            String desc = "Terrain constructible situé à %s, %s. %s".formatted(quartier, ville, pick(CLOTURES_TERRAIN, rnd));

            b.prix(prixM2).uniteM2(true).prixTotal(prixTotal).titre(titre).surface(surface)
                    .description(desc).equipements(equip(EQUIP_TERRAIN, rnd));
            return;
        }

        int surface;
        Integer pieces;
        Integer chambres;
        long prixBase;
        switch (type) {
            case "Appartement" -> { pieces = 2 + rnd.nextInt(3); chambres = pieces - 1; surface = 55 + rnd.nextInt(96); prixBase = 20_000_000 + rnd.nextInt(60_000_000); }
            case "Maison" -> { pieces = 3 + rnd.nextInt(5); chambres = pieces - 1; surface = 90 + rnd.nextInt(161); prixBase = 15_000_000 + rnd.nextInt(45_000_000); }
            case "Villa" -> { pieces = 4 + rnd.nextInt(6); chambres = pieces - 2; surface = 180 + rnd.nextInt(371); prixBase = 40_000_000 + rnd.nextInt(210_000_000); }
            case "Immeuble" -> { pieces = null; chambres = null; surface = 150 + rnd.nextInt(451); prixBase = 80_000_000 + rnd.nextInt(320_000_000); }
            default -> { pieces = null; chambres = null; surface = 30 + rnd.nextInt(171); prixBase = 10_000_000 + rnd.nextInt(90_000_000); } // Local commercial
        }

        long prix = grandeVille ? prixBase : Math.round(prixBase * 0.55);
        String titre = "%s à vendre à %s".formatted(type, quartier);
        String desc = "%s %s à vendre à %s, %s. %s".formatted(articleType(type), type.toLowerCase(Locale.FRENCH), quartier, ville, pick(CLOTURES_VENTE_BATI, rnd));

        b.prix(prix).unite("").uniteM2(false).titre(titre).surface(surface).pieces(pieces).chambres(chambres)
                .description(desc).equipements(equip(EQUIP_VENTE_BATI, rnd));
    }

    private String quartierPour(String ville, Random rnd) {
        if (ville.startsWith("Yaoundé")) return pick(QUARTIERS_YAOUNDE, rnd);
        if (ville.startsWith("Douala")) return pick(QUARTIERS_DOUALA, rnd);
        if (VILLES_COTIERES.contains(ville)) return rnd.nextBoolean() ? "Plage" : pick(QUARTIERS_GENERIQUES, rnd);
        return pick(QUARTIERS_GENERIQUES, rnd);
    }

    private static boolean estGrandeVille(String ville) {
        return ville.startsWith("Yaoundé") || ville.startsWith("Douala") || ville.startsWith("Bafoussam")
                || ville.startsWith("Garoua") || ville.startsWith("Maroua") || ville.startsWith("Bamenda")
                || ville.startsWith("Kribi") || ville.startsWith("Limbé") || ville.equals("Buea")
                || ville.startsWith("Ngaoundéré") || ville.startsWith("Bertoua") || ville.startsWith("Ebolowa");
    }

    private static List<String> equip(String[] pool, Random rnd) {
        List<String> options = new ArrayList<>(List.of(pool));
        java.util.Collections.shuffle(options, rnd);
        int n = 3 + rnd.nextInt(3);
        return new ArrayList<>(options.subList(0, Math.min(n, options.size())));
    }

    private static String pick(String[] pool, Random rnd) {
        return pool[rnd.nextInt(pool.length)];
    }

    private static String articleType(String type) {
        return switch (type) {
            case "Appartement", "Immeuble" -> "Bel";
            case "Villa", "Maison", "Chambre" -> "Belle";
            default -> "Beau";
        };
    }

    /** Accord de "situé(e)" — Chambre, Maison, Villa sont féminins ; les autres types masculins. */
    private static String situe(String type) {
        return switch (type) {
            case "Chambre", "Maison", "Villa" -> "située";
            default -> "situé";
        };
    }

    private static String telephoneDemo(int index) {
        return "+237 6%02d %03d %03d".formatted(70 + (index % 30), (index * 37) % 1000, (index * 91) % 1000);
    }

    private static String sansAccents(String s) {
        String normalise = Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return normalise.replace("'", "").toLowerCase(Locale.FRENCH);
    }
}
