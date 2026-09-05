package com.findoor.backend.service;

import com.findoor.backend.data.GeoCoordonnees;
import com.findoor.backend.domain.Annonce;
import com.findoor.backend.domain.User;
import com.findoor.backend.exception.ApiException;
import com.findoor.backend.repository.AnnonceRepository;
import com.findoor.backend.repository.AnnonceSpecifications;
import com.findoor.backend.repository.UserRepository;
import com.findoor.backend.web.dto.AnnonceCreateRequest;
import com.findoor.backend.web.dto.AnnonceDTO;
import com.findoor.backend.web.dto.StatsDTO;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Random;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class AnnonceService {

    private final AnnonceRepository annonceRepository;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;

    private static final int PHOTOS_MIN = 2;
    private static final int PHOTOS_MAX = 5;

    @Transactional(readOnly = true)
    public List<AnnonceDTO> search(AnnonceSearchCriteria c) {
        Specification<Annonce> spec = Specification.where(AnnonceSpecifications.actives())
                .and(AnnonceSpecifications.ownerAvecAccesValide(userRepository.findIdsAvecAccesValide()))
                .and(AnnonceSpecifications.transaction(c.transaction()));

        if (hasText(c.region())) spec = spec.and(AnnonceSpecifications.region(c.region()));
        if (hasText(c.departement())) spec = spec.and(AnnonceSpecifications.departement(c.departement()));
        if (hasText(c.arrondissement())) spec = spec.and(AnnonceSpecifications.arrondissement(c.arrondissement()));
        if (hasText(c.quartier())) spec = spec.and(AnnonceSpecifications.quartierContains(c.quartier()));
        if (c.types() != null && !c.types().isEmpty()) spec = spec.and(AnnonceSpecifications.typeIn(c.types()));
        if ("louer".equals(c.transaction())) {
            if (c.meubleOui() && !c.meubleNon()) spec = spec.and(AnnonceSpecifications.meuble(true));
            if (c.meubleNon() && !c.meubleOui()) spec = spec.and(AnnonceSpecifications.meuble(false));
        }
        if (c.prixMin() != null) spec = spec.and(AnnonceSpecifications.prixMin(c.prixMin()));
        if (c.prixMax() != null) spec = spec.and(AnnonceSpecifications.prixMax(c.prixMax()));

        List<Annonce> resultats = annonceRepository.findAll(spec);

        Comparator<Annonce> comparateur = switch (c.sort() == null ? "" : c.sort()) {
            case "prix-asc" -> Comparator.comparingLong(this::prixEffectif);
            case "prix-desc" -> Comparator.comparingLong(this::prixEffectif).reversed();
            default -> (a, b) -> 0;
        };
        List<Annonce> tries = new ArrayList<>(resultats);
        tries.sort(comparateur.thenComparing(Annonce::getDateCreation, Comparator.reverseOrder()));

        return tries.stream().map(AnnonceDTO::from).toList();
    }

    /** Fiche publique — 404 si suspendue par un admin OU si l'abonnement du propriétaire est expiré/inexistant. */
    @Transactional(readOnly = true)
    public AnnonceDTO getById(Long id) {
        Annonce annonce = annonceRepository.findById(id)
                .filter(Annonce::isActif)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Annonce introuvable"));
        if (!abonnementProprietaireValide(annonce.getOwnerUserId())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Annonce introuvable");
        }
        return AnnonceDTO.from(annonce, true);
    }

    /** Toutes les annonces publiquement visibles (suspension admin + abonnement propriétaire), pour le sitemap XML. */
    @Transactional(readOnly = true)
    public List<Annonce> visiblesPourSitemap() {
        Specification<Annonce> spec = Specification.where(AnnonceSpecifications.actives())
                .and(AnnonceSpecifications.ownerAvecAccesValide(userRepository.findIdsAvecAccesValide()));
        return annonceRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "dateCreation"));
    }

    @Transactional(readOnly = true)
    public StatsDTO stats() {
        long annonces = annonceRepository.countByActifTrue();
        long villes = annonceRepository.countDistinctVilleByActifTrue();
        long regions = annonceRepository.countDistinctRegionByActifTrue();
        long proprietaires = annonceRepository.countDistinctOwnerUserIdByActifTrue();
        long verifies = annonceRepository.countDistinctVerifiedOwnerByActifTrue();
        int pct = proprietaires == 0 ? 0 : (int) Math.round(100.0 * verifies / proprietaires);
        return new StatsDTO(annonces, villes, regions, pct);
    }

    @Transactional(readOnly = true)
    public List<AnnonceDTO> featured() {
        Specification<Annonce> spec = Specification.where(AnnonceSpecifications.actives())
                .and(AnnonceSpecifications.vedette())
                .and(AnnonceSpecifications.ownerAvecAccesValide(userRepository.findIdsAvecAccesValide()));
        return annonceRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "dateCreation")).stream()
                .map(AnnonceDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AnnonceDTO> similar(Long id, int limit) {
        Annonce reference = annonceRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Annonce introuvable"));
        Specification<Annonce> spec = Specification.where(AnnonceSpecifications.actives())
                .and(AnnonceSpecifications.transaction(reference.getTransaction()))
                .and(AnnonceSpecifications.idNot(id))
                .and(AnnonceSpecifications.ownerAvecAccesValide(userRepository.findIdsAvecAccesValide()));
        return annonceRepository
                .findAll(spec, PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "dateCreation")))
                .stream()
                .map(AnnonceDTO::from)
                .toList();
    }

    /** Tableau de bord propriétaire — toutes SES annonces, quel que soit l'état de son abonnement
     * (il doit pouvoir les voir/éditer même invisibles publiquement, pour pouvoir se réabonner). */
    @Transactional(readOnly = true)
    public List<AnnonceDTO> findByOwner(Long ownerUserId) {
        boolean abonnementActif = userRepository.findById(ownerUserId).map(User::abonnementActif).orElse(false);
        return annonceRepository.findByOwnerUserIdOrderByDateCreationDesc(ownerUserId).stream()
                .map(a -> AnnonceDTO.from(a, abonnementActif))
                .toList();
    }

    @Transactional(readOnly = true)
    public AnnonceDTO getOwned(Long ownerUserId, Long id) {
        Annonce annonce = annonceRepository
                .findByIdAndOwnerUserId(id, ownerUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Annonce introuvable"));
        return AnnonceDTO.from(annonce, abonnementProprietaireValide(ownerUserId));
    }

    /**
     * @param verifierAbonnement true pour une création propriétaire "en libre-service" — refusée
     *     (403) si son abonnement (phase 4, paiement par période) n'est pas actif ; false pour une
     *     création admin (voir adminCreate), qui n'est jamais soumise à cette vérification.
     */
    @Transactional
    public AnnonceDTO create(User owner, AnnonceCreateRequest r, List<MultipartFile> photos, boolean verifierAbonnement) {
        if (verifierAbonnement && !owner.abonnementActif()) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Votre abonnement n'est pas actif : abonnez-vous pour pouvoir publier une annonce.");
        }

        List<String> photosStockees = storeNewPhotos(photos);
        validatePhotoCount(photosStockees.size());
        double[] position = GeoCoordonnees.pour(r.region(), r.ville(), new Random());
        Annonce annonce = Annonce.builder()
                .transaction(r.transaction())
                .type(r.type())
                .meuble(r.meuble())
                .region(r.region())
                .departement(r.departement())
                .ville(r.ville())
                .quartier(r.quartier())
                .latitude(position[0])
                .longitude(position[1])
                .prix(r.prix())
                .unite(r.unite())
                .uniteM2(Boolean.TRUE.equals(r.uniteM2()))
                .prixTotal(r.prixTotal())
                .titre(r.titre())
                .surface(r.surface())
                .pieces(r.pieces())
                .chambres(r.chambres())
                .description(r.desc())
                .equipements(r.equip() != null ? new ArrayList<>(r.equip()) : new ArrayList<>())
                .photos(photosStockees)
                .ownerNom(owner.getPrenom() + " " + owner.getNom())
                .ownerInitials(initiales(owner.getPrenom(), owner.getNom()))
                .ownerTelephone(owner.getTelephone())
                .ownerUserId(owner.getId())
                .build();

        return AnnonceDTO.from(annonceRepository.save(annonce), !verifierAbonnement || owner.abonnementActif());
    }

    @Transactional
    public AnnonceDTO update(Long ownerUserId, Long id, AnnonceCreateRequest r, List<MultipartFile> nouvellesPhotos) {
        Annonce annonce = annonceRepository
                .findByIdAndOwnerUserId(id, ownerUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Annonce introuvable"));

        boolean lieuChange = !annonce.getRegion().equals(r.region()) || !annonce.getVille().equals(r.ville());

        annonce.setTransaction(r.transaction());
        annonce.setType(r.type());
        annonce.setMeuble(r.meuble());
        annonce.setRegion(r.region());
        annonce.setDepartement(r.departement());
        annonce.setVille(r.ville());
        annonce.setQuartier(r.quartier());
        if (lieuChange) {
            double[] position = GeoCoordonnees.pour(r.region(), r.ville(), new Random());
            annonce.setLatitude(position[0]);
            annonce.setLongitude(position[1]);
        }
        annonce.setPrix(r.prix());
        annonce.setUnite(r.unite());
        annonce.setUniteM2(Boolean.TRUE.equals(r.uniteM2()));
        annonce.setPrixTotal(r.prixTotal());
        annonce.setTitre(r.titre());
        annonce.setSurface(r.surface());
        annonce.setPieces(r.pieces());
        annonce.setChambres(r.chambres());
        annonce.setDescription(r.desc());
        annonce.setEquipements(r.equip() != null ? new ArrayList<>(r.equip()) : new ArrayList<>());

        List<String> photosConservees = r.keepPhotos() != null ? new ArrayList<>(r.keepPhotos()) : new ArrayList<>(annonce.getPhotos());
        photosConservees.addAll(storeNewPhotos(nouvellesPhotos));
        validatePhotoCount(photosConservees.size());
        annonce.setPhotos(photosConservees);

        return AnnonceDTO.from(annonce, abonnementProprietaireValide(ownerUserId));
    }

    @Transactional
    public void delete(Long ownerUserId, Long id) {
        Annonce annonce = annonceRepository
                .findByIdAndOwnerUserId(id, ownerUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Annonce introuvable"));
        annonceRepository.delete(annonce);
    }

    // --- Back-office admin : CRUD complet, sans restriction de propriétaire (voir AdminController) ---

    @Transactional(readOnly = true)
    public AnnonceDTO adminGetById(Long id) {
        Annonce annonce = annonceRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Annonce introuvable"));
        return AnnonceDTO.from(annonce, abonnementProprietaireValide(annonce.getOwnerUserId()));
    }

    @Transactional
    public AnnonceDTO adminCreate(AnnonceCreateRequest r, List<MultipartFile> photos) {
        if (r.ownerUserId() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Un propriétaire doit être sélectionné");
        }
        User owner = userRepository.findById(r.ownerUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Propriétaire introuvable"));
        // Création par un admin : jamais soumise à la vérification d'abonnement.
        return create(owner, r, photos, false);
    }

    @Transactional
    public AnnonceDTO adminUpdate(Long id, AnnonceCreateRequest r, List<MultipartFile> nouvellesPhotos) {
        Annonce annonce = annonceRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Annonce introuvable"));

        if (r.ownerUserId() != null && !r.ownerUserId().equals(annonce.getOwnerUserId())) {
            User nouveauProprietaire = userRepository.findById(r.ownerUserId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Propriétaire introuvable"));
            annonce.setOwnerUserId(nouveauProprietaire.getId());
            annonce.setOwnerNom(nouveauProprietaire.getPrenom() + " " + nouveauProprietaire.getNom());
            annonce.setOwnerInitials(initiales(nouveauProprietaire.getPrenom(), nouveauProprietaire.getNom()));
            annonce.setOwnerTelephone(nouveauProprietaire.getTelephone());
        }

        boolean lieuChange = !annonce.getRegion().equals(r.region()) || !annonce.getVille().equals(r.ville());

        annonce.setTransaction(r.transaction());
        annonce.setType(r.type());
        annonce.setMeuble(r.meuble());
        annonce.setRegion(r.region());
        annonce.setDepartement(r.departement());
        annonce.setVille(r.ville());
        annonce.setQuartier(r.quartier());
        if (lieuChange) {
            double[] position = GeoCoordonnees.pour(r.region(), r.ville(), new Random());
            annonce.setLatitude(position[0]);
            annonce.setLongitude(position[1]);
        }
        annonce.setPrix(r.prix());
        annonce.setUnite(r.unite());
        annonce.setUniteM2(Boolean.TRUE.equals(r.uniteM2()));
        annonce.setPrixTotal(r.prixTotal());
        annonce.setTitre(r.titre());
        annonce.setSurface(r.surface());
        annonce.setPieces(r.pieces());
        annonce.setChambres(r.chambres());
        annonce.setDescription(r.desc());
        annonce.setEquipements(r.equip() != null ? new ArrayList<>(r.equip()) : new ArrayList<>());

        List<String> photosConservees = r.keepPhotos() != null ? new ArrayList<>(r.keepPhotos()) : new ArrayList<>(annonce.getPhotos());
        photosConservees.addAll(storeNewPhotos(nouvellesPhotos));
        validatePhotoCount(photosConservees.size());
        annonce.setPhotos(photosConservees);

        return AnnonceDTO.from(annonce, abonnementProprietaireValide(annonce.getOwnerUserId()));
    }

    /** true si l'annonce n'a pas de propriétaire réel (démonstration) ou si son abonnement est actif. */
    private boolean abonnementProprietaireValide(Long ownerUserId) {
        if (ownerUserId == null) return true;
        return userRepository.findById(ownerUserId).map(User::abonnementActif).orElse(false);
    }

    private void validatePhotoCount(int count) {
        if (count < PHOTOS_MIN || count > PHOTOS_MAX) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Une annonce doit avoir entre " + PHOTOS_MIN + " et " + PHOTOS_MAX + " photos (actuellement " + count + ").");
        }
    }

    private List<String> storeNewPhotos(List<MultipartFile> photos) {
        List<String> urls = new ArrayList<>();
        if (photos == null) return urls;
        for (MultipartFile photo : photos) {
            if (photo != null && !photo.isEmpty()) {
                urls.add(fileStorageService.store(photo));
            }
        }
        return urls;
    }

    private long prixEffectif(Annonce a) {
        return a.isUniteM2() ? (a.getPrixTotal() != null ? a.getPrixTotal() : 0L) : a.getPrix();
    }

    private static String initiales(String prenom, String nom) {
        String a = hasText(prenom) ? prenom.substring(0, 1) : "";
        String b = hasText(nom) ? nom.substring(0, 1) : "";
        return (a + b).toUpperCase();
    }

    private static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }
}
