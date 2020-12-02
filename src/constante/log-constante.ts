/**
 * @author abdel-maliki
 * Date = 13/11/2020
 */


enum LogConstante  {
    NOT_FOUND= "NOT FOUND",
    LOGIN = "Login",
    HEALTH = "HEALTH",
    ADD_USER= "Créer un utilisateur",
    EDIT_USER= "Modifier un utilisateur",
    DELETE_USER= "Supprimer un utilisateur",
    READ_USER= "Lister les utilisateurs",
    RESET_PASSWORD= "Réinitialiser un mot de passe",
    DELETE_MULTIPLE_USER= "Suppression multiple des utilisateurs",
    ACTIVATE_ACCOUNT= "Activer un compte",
    DISABLED_ACCOUNT= "Désactiver un compte",
    ACTIVATE_MULTIPLE_ACCOUNT= "Activer plusieurs comptes",
    DISABLED_MULTIPLE_ACCOUNT= "Désactiver plusieurs comptes",
    LISTER_USER= 'Lister les utilisateurs',
    PAGE_USER= 'page utilisateurs',
    FILTER_USER= 'filtrer les utilisateurs',

    ADD_PROFILE= "Créer un profile",
    EDIT_PROFILE= "Modifier un profile",
    DELETE_PROFILE= "Supprimer un profile",
    DELETE_MULTIPLE_PROFILE= "Suppression multiple des profiles",
    READ_PROFILE= "consulter un profile",
    LISTER_PROFILE= 'Lister les profiles',
    READ_PROFILE_ROLE= "Lecture les droits d'un profile",
    AFFECT_PROFILE_ROLE= "Modifier les droits d'un profile",
    PAGE_PROFILE= 'page profiles',
    FILTER_PROFILE= 'filtrer les profiles',
    CURRENT_USER_DATA= 'Récuperation des information de l\'utilisateur courrent',
    UPDATE_MY_PASSWORD= 'Mise à jour de son mot de passe',
    ALL_USERNAME= 'Tout les noms d\'utilisateurs',

    DELETE_LOG= "Supprimer un log",
    DELETE_MULTIPLE_LOG= "Suppression multiple des logs",
    READ_LOG= "consulter un log",
    PAGE_LOG= 'page logs',
}

export default LogConstante;
