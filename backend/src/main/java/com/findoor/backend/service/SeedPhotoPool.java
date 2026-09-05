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
 * Référence le petit lot de vraies photos immobilières (chambre à coucher, façade de villa, terrain
 * nu…) embarqué dans le jar sous {@code src/main/resources/seed-photos/<catégorie>/}, servi
 * directement sous /seed-media/** (cf. WebConfig) — réutilisé par le {@code DataSeeder} sur plusieurs
 * annonces. Sert les fichiers du classpath tels quels (pas de copie vers le disque local via
 * FileStorageService) : sur un hébergement gratuit comme Render, ce disque est effacé à chaque
 * redémarrage/réveil du service, alors que le contenu du jar, lui, survit toujours — les photos de
 * démonstration restent donc visibles indéfiniment, sans dépendre d'un stockage externe.
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

    private Map<String, List<String>> urlsParCategorie;

    /** Retourne les URLs /seed-media/** disponibles pour le type de bien donné (chargées à la demande, une seule fois). */
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
                    urls.add("/seed-media/" + categorie + "/" + nom);
                }
                resultat.put(categorie, urls);
            } catch (IOException e) {
                throw new UncheckedIOException("Échec du chargement des photos de démonstration pour " + categorie, e);
            }
        }
        return resultat;
    }
}
