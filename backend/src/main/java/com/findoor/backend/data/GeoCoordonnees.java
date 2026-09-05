package com.findoor.backend.data;

import java.util.Map;
import java.util.Random;

/**
 * Coordonnées GPS approximatives des principales villes camerounaises (chefs-lieux de région et
 * quelques grandes villes), avec repli sur le centre de la région pour les arrondissements non
 * répertoriés précisément. Utilisé par le DataSeeder pour donner à chaque annonce une position réelle
 * sur la carte (voir listing-detail — carte interactive cliquable).
 */
public final class GeoCoordonnees {

    private GeoCoordonnees() {}

    /** {latitude, longitude} du centre de chaque région (repli). */
    private static final Map<String, double[]> REGIONS = Map.ofEntries(
            Map.entry("Adamaoua", new double[] {7.3167, 13.5833}),
            Map.entry("Centre", new double[] {3.8480, 11.5021}),
            Map.entry("Est", new double[] {4.5768, 13.6849}),
            Map.entry("Extrême-Nord", new double[] {10.5913, 14.3153}),
            Map.entry("Littoral", new double[] {4.0511, 9.7679}),
            Map.entry("Nord", new double[] {9.3017, 13.3921}),
            Map.entry("Nord-Ouest", new double[] {5.9631, 10.1591}),
            Map.entry("Ouest", new double[] {5.4737, 10.4176}),
            Map.entry("Sud", new double[] {2.9167, 11.1500}),
            Map.entry("Sud-Ouest", new double[] {4.1560, 9.2320}));

    /** {latitude, longitude} des villes connues avec précision (clé = nom sans le suffixe I/II/III…). */
    private static final Map<String, double[]> VILLES = Map.ofEntries(
            Map.entry("Yaoundé", new double[] {3.8480, 11.5021}),
            Map.entry("Douala", new double[] {4.0511, 9.7679}),
            Map.entry("Bafoussam", new double[] {5.4737, 10.4176}),
            Map.entry("Garoua", new double[] {9.3017, 13.3921}),
            Map.entry("Maroua", new double[] {10.5913, 14.3153}),
            Map.entry("Bamenda", new double[] {5.9631, 10.1591}),
            Map.entry("Ngaoundéré", new double[] {7.3167, 13.5833}),
            Map.entry("Bertoua", new double[] {4.5768, 13.6849}),
            Map.entry("Ebolowa", new double[] {2.9167, 11.1500}),
            Map.entry("Buea", new double[] {4.1560, 9.2320}),
            Map.entry("Kribi", new double[] {2.9500, 9.9167}),
            Map.entry("Limbé", new double[] {4.0167, 9.2000}),
            Map.entry("Kumba", new double[] {4.6363, 9.4469}),
            Map.entry("Nkongsamba", new double[] {4.9547, 9.9401}),
            Map.entry("Édéa", new double[] {3.8000, 10.1333}),
            Map.entry("Foumban", new double[] {5.7263, 10.9022}),
            Map.entry("Dschang", new double[] {5.4500, 10.0500}),
            Map.entry("Bafang", new double[] {5.1667, 10.1833}),
            Map.entry("Mbalmayo", new double[] {3.5167, 11.5000}),
            Map.entry("Sangmélima", new double[] {2.9333, 11.9833}),
            Map.entry("Batouri", new double[] {4.4333, 14.3667}),
            Map.entry("Kumbo", new double[] {6.2000, 10.6667}),
            Map.entry("Wum", new double[] {6.3833, 10.0667}),
            Map.entry("Mamfé Central", new double[] {5.7667, 9.3167}),
            Map.entry("Tiko", new double[] {4.0833, 9.3667}),
            Map.entry("Mokolo", new double[] {10.7333, 13.8000}),
            Map.entry("Kousséri", new double[] {12.0833, 15.0333}),
            Map.entry("Yagoua", new double[] {10.3333, 15.2333}),
            Map.entry("Kaélé", new double[] {10.1000, 14.4500}),
            Map.entry("Tibati", new double[] {6.4667, 12.6333}),
            Map.entry("Meiganga", new double[] {6.5167, 14.2833}),
            Map.entry("Banyo", new double[] {6.7500, 11.8167}));

    /** Position approximative (latitude, longitude) pour une annonce, avec un petit décalage aléatoire
     * (quartier) autour de la ville connue, ou un décalage plus large autour du centre de la région
     * quand la ville précise n'est pas répertoriée. */
    public static double[] pour(String region, String ville, Random rnd) {
        String base = ville.replaceAll("\\s+(VII|VI|V|IV|III|II|I)$", "");
        double[] centre = VILLES.get(base);
        double amplitude = 0.01; // ± ~1 km autour d'une ville connue (précision quartier)
        if (centre == null) {
            centre = REGIONS.getOrDefault(region, new double[] {5.0, 12.0});
            amplitude = 0.07; // ± ~7 km autour du centre régional (ville non répertoriée précisément)
        }
        double lat = centre[0] + (rnd.nextDouble() - 0.5) * amplitude;
        double lon = centre[1] + (rnd.nextDouble() - 0.5) * amplitude;
        return new double[] {lat, lon};
    }
}
