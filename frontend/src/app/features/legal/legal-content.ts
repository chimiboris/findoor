export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export interface LegalPage {
  title: string;
  updated: string;
  sections: LegalSection[];
}

export type LegalPageKey = 'mentions' | 'confidentialite';

/**
 * Contenu des pages légales (phase 7). Rédigé en clair, à adapter par l'exploitant une fois la
 * structure juridique de Findoor formellement enregistrée (raison sociale, RCCM, adresse, hébergeur
 * définitif) — les passages entre crochets [ ] marquent ce qui reste à compléter.
 */
export const LEGAL_PAGES: Record<LegalPageKey, LegalPage> = {
  mentions: {
    title: 'Mentions légales',
    updated: '5 septembre 2026',
    sections: [
      {
        heading: 'Éditeur du site',
        paragraphs: [
          'Le site Findoor est édité par [raison sociale de l\'exploitant, forme juridique, numéro RCCM/NIU à compléter lors de l\'enregistrement de la structure], dont le siège est situé [adresse à compléter], Cameroun.',
          'Contact : findoor100@gmail.com — +237 695 63 75 55.',
        ],
      },
      {
        heading: 'Hébergement',
        paragraphs: [
          'Le site (frontend et backend) est hébergé par [nom de l\'hébergeur, adresse à compléter une fois le déploiement effectué].',
        ],
      },
      {
        heading: 'Activité de la plateforme',
        paragraphs: [
          'Findoor est une plateforme de mise en relation entre des propriétaires ou gestionnaires de biens immobiliers et des personnes recherchant un bien en location ou à l\'achat au Cameroun.',
          'Findoor n\'est ni agence immobilière, ni intermédiaire, ni partie aux transactions conclues entre un propriétaire et un visiteur : chaque annonce est publiée sous la seule responsabilité de son auteur, qui est seul garant de l\'exactitude des informations fournies (description, prix, disponibilité, titres de propriété).',
          'Toute annonce publiée fait l\'objet d\'un contrôle de cohérence mais Findoor ne vérifie pas les titres de propriété ni l\'identité complète des annonceurs au-delà de la vérification d\'email/téléphone du compte.',
        ],
      },
      {
        heading: 'Propriété intellectuelle',
        paragraphs: [
          'La structure, le design et les éléments graphiques du site Findoor sont protégés par le droit d\'auteur. Les photographies et descriptions des annonces restent la propriété de leurs auteurs respectifs (les propriétaires les ayant publiées).',
        ],
      },
      {
        heading: 'Responsabilité',
        paragraphs: [
          'Findoor s\'efforce d\'assurer l\'exactitude des informations diffusées sur le site mais ne saurait être tenu responsable des erreurs, omissions ou de l\'indisponibilité des informations, ni du contenu publié par les propriétaires.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: ['Pour toute question relative au site : findoor100@gmail.com.'],
      },
    ],
  },
  confidentialite: {
    title: 'Politique de confidentialité',
    updated: '5 septembre 2026',
    sections: [
      {
        heading: 'Données collectées',
        paragraphs: [
          'Compte propriétaire : nom, prénom, email, numéro de téléphone, mot de passe (stocké de façon chiffrée, jamais en clair).',
          'Visiteurs sans compte : lorsqu\'un visiteur contacte un propriétaire, dépose un avis ou crée une alerte de recherche, seules les informations qu\'il saisit volontairement (nom, email, téléphone optionnel, message ou commentaire) sont enregistrées — aucun compte n\'est requis pour ces actions.',
          'Navigation : les favoris sont stockés uniquement dans le navigateur du visiteur (stockage local), jamais transmis à nos serveurs ni partagés.',
        ],
      },
      {
        heading: 'Utilisation des données',
        paragraphs: [
          'Les données sont utilisées uniquement pour faire fonctionner le service : afficher les annonces, transmettre les messages entre visiteurs et propriétaires, envoyer les emails de confirmation, de réinitialisation de mot de passe ou d\'alerte de recherche.',
          'Findoor ne vend ni ne partage ces données avec des tiers à des fins commerciales.',
        ],
      },
      {
        heading: 'Conservation',
        paragraphs: [
          'Les comptes et annonces sont conservés tant que le compte reste actif. Un compte peut être supprimé sur simple demande à findoor100@gmail.com.',
        ],
      },
      {
        heading: 'Vos droits',
        paragraphs: [
          'Vous pouvez à tout moment demander l\'accès, la rectification ou la suppression de vos données personnelles en écrivant à findoor100@gmail.com.',
          'Pour une alerte de recherche, un lien de désabonnement sans compte est inclus dans chaque email reçu.',
        ],
      },
      {
        heading: 'Sécurité',
        paragraphs: [
          'Les mots de passe sont hachés (jamais stockés en clair). Les échanges avec le serveur passent par une connexion chiffrée une fois le site en production. La session de connexion est conservée localement dans votre navigateur (jeton d\'authentification), jamais partagée avec des tiers.',
        ],
      },
    ],
  },
};
