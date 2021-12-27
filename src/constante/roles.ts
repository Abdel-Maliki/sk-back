/**
 * @author abdel-maliki
 * Date = 01/11/2020
 */

enum Roles {
    ADD_USER = "Créer un utilisateur",
    EDIT_USER = "Modifier un utilisateur",
    DELETE_USER = "Supprimer un utilisateur",
    READ_USER = "Lister les utilisateurs",
    RESET_PASSWORD = "Réinitialiser un mot de passe",


    ADD_PROFILE = "Créer un profile",
    EDIT_PROFILE = "Modifier un profile",
    DELETE_PROFILE = "Supprimer un profile",
    READ_PROFILE = "Lister les profiles",
    AFFECT_PROFILE_ROLE = "Modifier les droits d'un profile",
    ACTIVATE_ACCOUNT = "Activer un compte",
    DISABLED_ACCOUNT = "Désactiver un compte",

    DELETE_LOG = "Supprimer un log",
    READ_LOG = "Consulter les logs",


    ADD_ENTERPRISE = "Créer une entreprise",
    EDIT_ENTERPRISE = "Modifier une entreprise",
    DELETE_ENTERPRISE = "Supprimer une entreprise",
    READ_ENTERPRISE = "Lister les entreprises",


    ADD_BENEFICIARY = "Créer un béneficaire",
    EDIT_BENEFICIARY = "Modifier un béneficaire",
    DELETE_BENEFICIARY = "Supprimer un béneficaire",
    READ_BENEFICIARY = "Lister les béneficaires",

    ADD_REGION = "Créer une region",
    EDIT_REGION = "Modifier une region",
    DELETE_REGION = "Supprimer une region",
    READ_REGION = "Lister les regions",

    ADD_DEPARTMENT = "Créer un departément",
    EDIT_DEPARTMENT = "Modifier un departément",
    DELETE_DEPARTMENT = "Supprimer un departément",
    READ_DEPARTMENT = "Lister les departéments",

    ADD_MUNICIPALITY = "Créer une commune",
    EDIT_MUNICIPALITY = "Modifier une commune",
    DELETE_MUNICIPALITY = "Supprimer une commune",
    READ_MUNICIPALITY = "Lister les communes",


    ADD_RESOURCE = "Créer une ressource",
    EDIT_RESOURCE = "Modifier une ressource",
    DELETE_RESOURCE = "Supprimer une ressource",
    READ_RESOURCE = "Lister les ressources",


}

export default Roles;
