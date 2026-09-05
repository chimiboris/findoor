package com.findoor.backend.service;

import com.findoor.backend.config.FindoorProperties;
import com.findoor.backend.exception.ApiException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

/**
 * Stockage local des photos d'annonces (disque du serveur, servi via /media/**, cf. WebConfig).
 * Remplaçable plus tard par un vrai bucket S3/MinIO sans changer les appelants.
 */
@Service
public class FileStorageService {

    private final Path root;

    public FileStorageService(FindoorProperties properties) {
        this.root = Path.of(properties.storage().localDir());
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new IllegalStateException("Impossible de créer le dossier de stockage des médias : " + root, e);
        }
    }

    public String store(MultipartFile file) {
        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + (StringUtils.hasText(extension) ? "." + extension : "");
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, root.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Échec de l'enregistrement de la photo");
        }
        return "/media/" + filename;
    }

    /** Enregistre des octets déjà encodés (ex. PNG généré par {@link ListingImageGenerator}) sous /media/**. */
    public String storeBytes(byte[] data, String extension) {
        String filename = UUID.randomUUID() + "." + extension;
        try {
            Files.write(root.resolve(filename), data);
        } catch (IOException e) {
            throw new IllegalStateException("Échec de l'enregistrement de l'image générée : " + filename, e);
        }
        return "/media/" + filename;
    }
}
