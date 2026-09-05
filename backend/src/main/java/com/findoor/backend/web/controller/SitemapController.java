package com.findoor.backend.web.controller;

import com.findoor.backend.domain.Annonce;
import com.findoor.backend.service.AnnonceService;
import java.time.format.DateTimeFormatter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Sitemap XML (phase 7 — SEO) : pages statiques + une entrée par annonce publiquement visible.
 * Généré à la demande (pas de cache) — le volume d'annonces reste modeste, une régénération à
 * chaque requête est largement suffisante et évite tout risque de sitemap périmé.
 */
@RestController
@RequiredArgsConstructor
public class SitemapController {

    private static final DateTimeFormatter DATE = DateTimeFormatter.ISO_LOCAL_DATE;

    private final AnnonceService annonceService;

    @Value("${findoor.frontend-url:http://localhost:4200}")
    private String frontendUrl;

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> sitemap() {
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        url(xml, frontendUrl + "/", null, "daily", "1.0");
        url(xml, frontendUrl + "/recherche?transaction=louer", null, "daily", "0.9");
        url(xml, frontendUrl + "/recherche?transaction=acheter", null, "daily", "0.9");

        for (Annonce a : annonceService.visiblesPourSitemap()) {
            String lastmod = a.getDateCreation() != null ? a.getDateCreation().format(DATE) : null;
            url(xml, frontendUrl + "/annonce/" + a.getId(), lastmod, "weekly", "0.7");
        }

        xml.append("</urlset>\n");
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_XML).body(xml.toString());
    }

    private void url(StringBuilder xml, String loc, String lastmod, String changefreq, String priority) {
        xml.append("  <url>\n");
        xml.append("    <loc>").append(escape(loc)).append("</loc>\n");
        if (lastmod != null) xml.append("    <lastmod>").append(lastmod).append("</lastmod>\n");
        xml.append("    <changefreq>").append(changefreq).append("</changefreq>\n");
        xml.append("    <priority>").append(priority).append("</priority>\n");
        xml.append("  </url>\n");
    }

    private String escape(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
