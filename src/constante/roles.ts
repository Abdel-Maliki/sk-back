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
}

export default Roles;
