package com.findoor.backend.repository;

import com.findoor.backend.domain.Annonce;
import jakarta.persistence.criteria.Expression;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

/** Prédicats dynamiques pour la recherche publique d'annonces (voir AnnonceService.search). */
public final class AnnonceSpecifications {

    private AnnonceSpecifications() {}

    /** Non suspendue par un administrateur. */
    public static Specification<Annonce> actives() {
        return (root, query, cb) -> cb.isTrue(root.get("actif"));
    }

    /**
     * L'abonnement du propriétaire (phase 4 — paiement par période) est actuellement valide, ou
     * l'annonce n'a pas de propriétaire réel (données de démonstration créées sans compte). La liste
     * `ownerIdsValides` vient de {@code UserRepository.findIdsAvecAccesValide()}, calculée une seule
     * fois par recherche.
     */
    public static Specification<Annonce> ownerAvecAccesValide(List<Long> ownerIdsValides) {
        return (root, query, cb) -> {
            if (ownerIdsValides.isEmpty()) {
                return cb.isNull(root.get("ownerUserId"));
            }
            return cb.or(cb.isNull(root.get("ownerUserId")), root.get("ownerUserId").in(ownerIdsValides));
        };
    }

    public static Specification<Annonce> transaction(String transaction) {
        return (root, query, cb) -> cb.equal(root.get("transaction"), transaction);
    }

    public static Specification<Annonce> region(String region) {
        return (root, query, cb) -> cb.equal(root.get("region"), region);
    }

    public static Specification<Annonce> departement(String departement) {
        return (root, query, cb) -> cb.equal(root.get("departement"), departement);
    }

    public static Specification<Annonce> arrondissement(String arrondissement) {
        return (root, query, cb) -> cb.equal(root.get("ville"), arrondissement);
    }

    public static Specification<Annonce> quartierContains(String quartier) {
        return (root, query, cb) -> cb.like(cb.lower(root.get("quartier")), "%" + quartier.toLowerCase() + "%");
    }

    public static Specification<Annonce> typeIn(List<String> types) {
        return (root, query, cb) -> root.get("type").in(types);
    }

    public static Specification<Annonce> meuble(boolean valeur) {
        return (root, query, cb) -> cb.equal(root.get("meuble"), valeur);
    }

    public static Specification<Annonce> vedette() {
        return (root, query, cb) -> cb.isTrue(root.get("vedette"));
    }

    public static Specification<Annonce> idNot(Long id) {
        return (root, query, cb) -> cb.notEqual(root.get("id"), id);
    }

    /** Publiée strictement après {@code moment} — sert au digest des alertes de recherche (phase 6). */
    public static Specification<Annonce> creeeApres(LocalDateTime moment) {
        return (root, query, cb) -> cb.greaterThan(root.get("dateCreation"), moment);
    }

    /** Prix "effectif" : prix au m² total (prixTotal) pour un terrain, sinon prix. */
    private static Expression<Long> prixEffectif(jakarta.persistence.criteria.Root<Annonce> root, jakarta.persistence.criteria.CriteriaBuilder cb) {
        return cb.<Long>selectCase()
                .when(cb.isTrue(root.get("uniteM2")), root.<Long>get("prixTotal"))
                .otherwise(root.get("prix"));
    }

    public static Specification<Annonce> prixMin(long min) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(prixEffectif(root, cb), min);
    }

    public static Specification<Annonce> prixMax(long max) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(prixEffectif(root, cb), max);
    }
}
