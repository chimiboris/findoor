package com.findoor.backend.service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;

/**
 * Charge le petit lot de vraies photos immobilières (chambre à coucher, façade de villa, terrain nu…)
 * embarqué sous {@code src/main/resources/seed-photos/<catégorie>/} et les enregistre une seule fois
 * via {@link FileStorageService} pour obtenir des URLs /media/** stables, réutilisées par le
 * {@code DataSeeder} sur plusieurs annonces. Remplace l'ancien rendu généré ({@code ListingImageGenerator})
 * par de vraies photographies (voir retour utilisateur phase 3).
 */
@Component
public class SeedPhotoPool {

    private static final Map<String, String> TYPE_TO_CATEGORIE = Map.of(
            "Chambre", "chambre",
            "Studio", "studio",
            "Appartement", "appartement",
            "Maison", "maison",
            "Villa", "villa",
            "Terrain", "terrain",
            "Immeuble", "immeuble",
            "Local commercial", "local");

    private final FileStorageService fileStorageService;
    private Map<String, List<String>> urlsParCategorie;

    public SeedPhotoPool(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    /** Retourne les URLs /media/** disponibles pour le type de bien donné (chargées à la demande, une seule fois). */
    public List<String> urlsPour(String typeBien) {
        if (urlsParCategorie == null) {
            urlsParCategorie = chargerToutesLesCategories();
        }
        String categorie = TYPE_TO_CATEGORIE.getOrDefault(typeBien, "appartement");
        return urlsParCategorie.getOrDefault(categorie, List.of());
    }

    private Map<String, List<String>> chargerToutesLesCategories() {
        Map<String, List<String>> resultat = new LinkedHashMap<>();
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        for (String categorie : Set.copyOf(TYPE_TO_CATEGORIE.values())) {
            try {
                Resource[] resources = resolver.getResources("classpath:seed-photos/" + categorie + "/*");
                List<String> urls = new ArrayList<>();
                for (Resource r : resources) {
                    String nom = r.getFilename();
                    if (nom == null) continue;
                    String ext = nom.substring(nom.lastIndexOf('.') + 1);
                    byte[] bytes = r.getInputStream().readAllBytes();
                    urls.add(fileStorageService.storeBytes(bytes, ext));
                }
                resultat.put(categorie, urls);
            } catch (IOException e) {
                throw new UncheckedIOException("Échec du chargement des photos de démonstration pour " + categorie, e);
            }
        }
        return resultat;
    }
}
