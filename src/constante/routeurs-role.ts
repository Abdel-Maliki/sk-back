import ROLES from "./roles";
import LOG_CONSTANTE from "./log-constante";
import Helper from "./routers-role-helper";
import {RoutesPrefix} from "./routes-prefix";


/**
 * @author abdel-maliki
 * Date : 04/11/2020
 */


const routeursRole: [string, [string[], string]][] = [
    // User
    [Helper.create(RoutesPrefix.user), [[ROLES.ADD_USER], LOG_CONSTANTE.ADD_USER]],
    [Helper.createAndGet(RoutesPrefix.user), [[ROLES.ADD_USER], LOG_CONSTANTE.ADD_USER]],
    [Helper.update(RoutesPrefix.user), [[ROLES.EDIT_USER], LOG_CONSTANTE.EDIT_USER]],
    [Helper.updateAndGet(RoutesPrefix.user), [[ROLES.EDIT_USER], LOG_CONSTANTE.EDIT_USER]],
    [Helper.delete(RoutesPrefix.user), [[ROLES.DELETE_USER], LOG_CONSTANTE.DELETE_USER]],
    [Helper.deleteAndGet(RoutesPrefix.user), [[ROLES.DELETE_USER], LOG_CONSTANTE.DELETE_USER]],
    [Helper.deleteAll(RoutesPrefix.user), [[ROLES.DELETE_USER], LOG_CONSTANTE.DELETE_MULTIPLE_USER]],
    [Helper.deleteAllAndGet(RoutesPrefix.user), [[ROLES.DELETE_USER], LOG_CONSTANTE.DELETE_MULTIPLE_USER]],
    [Helper.read(RoutesPrefix.user), [[ROLES.READ_USER, ROLES.DELETE_USER, ROLES.ADD_USER, ROLES.EDIT_USER, ROLES.RESET_PASSWORD, ROLES.DISABLED_ACCOUNT, ROLES.ACTIVATE_ACCOUNT], LOG_CONSTANTE.READ_USER]],
    [Helper.all(RoutesPrefix.user), [[ROLES.READ_USER, ROLES.DELETE_USER, ROLES.ADD_USER, ROLES.EDIT_USER, ROLES.RESET_PASSWORD, ROLES.DISABLED_ACCOUNT, ROLES.ACTIVATE_ACCOUNT], LOG_CONSTANTE.LISTER_USER]],
    [Helper.page(RoutesPrefix.user), [[ROLES.READ_USER, ROLES.DELETE_USER, ROLES.ADD_USER, ROLES.EDIT_USER, ROLES.RESET_PASSWORD, ROLES.DISABLED_ACCOUNT, ROLES.ACTIVATE_ACCOUNT], LOG_CONSTANTE.LISTER_USER]],
    [Helper.search(RoutesPrefix.user), [[ROLES.READ_USER, ROLES.DELETE_USER, ROLES.ADD_USER, ROLES.EDIT_USER, ROLES.RESET_PASSWORD, ROLES.DISABLED_ACCOUNT, ROLES.ACTIVATE_ACCOUNT], LOG_CONSTANTE.LISTER_USER]],
    [ Helper.putPattern(RoutesPrefix.user, `/disable/:id`), [[ROLES.DISABLED_ACCOUNT], LOG_CONSTANTE.DISABLED_ACCOUNT]],
    [ Helper.putPattern(RoutesPrefix.user, `/activate/:id`), [[ROLES.ACTIVATE_ACCOUNT], LOG_CONSTANTE.ACTIVATE_ACCOUNT]],
    [ Helper.putPattern(RoutesPrefix.user, `/disable-all`), [[ROLES.DISABLED_ACCOUNT], LOG_CONSTANTE.DISABLED_MULTIPLE_ACCOUNT]],
    [ Helper.putPattern(RoutesPrefix.user, `/activate-all`), [[ROLES.ACTIVATE_ACCOUNT], LOG_CONSTANTE.ACTIVATE_MULTIPLE_ACCOUNT]],
    [ Helper.getPattern(RoutesPrefix.user, `/reset-password/:id`), [[ROLES.RESET_PASSWORD], LOG_CONSTANTE.RESET_PASSWORD]],

    // Profile
    [Helper.read(RoutesPrefix.profile), [[ROLES.READ_PROFILE, ROLES.DELETE_PROFILE, ROLES.ADD_PROFILE, ROLES.EDIT_PROFILE, ROLES.AFFECT_PROFILE_ROLE], LOG_CONSTANTE.READ_PROFILE]],
    [Helper.all(RoutesPrefix.profile), [[ROLES.READ_PROFILE, ROLES.DELETE_PROFILE, ROLES.ADD_PROFILE, ROLES.EDIT_PROFILE, ROLES.AFFECT_PROFILE_ROLE], LOG_CONSTANTE.LISTER_PROFILE]],
    [Helper.page(RoutesPrefix.profile), [[ROLES.READ_PROFILE, ROLES.DELETE_PROFILE, ROLES.ADD_PROFILE, ROLES.EDIT_PROFILE, ROLES.AFFECT_PROFILE_ROLE], LOG_CONSTANTE.PAGE_PROFILE]],
    [Helper.search(RoutesPrefix.profile), [[ROLES.READ_PROFILE, ROLES.DELETE_PROFILE, ROLES.ADD_PROFILE, ROLES.EDIT_PROFILE, ROLES.AFFECT_PROFILE_ROLE], LOG_CONSTANTE.FILTER_PROFILE]],
    [ Helper.getPattern(RoutesPrefix.profile, `/roles/:id`), [[ROLES.AFFECT_PROFILE_ROLE], LOG_CONSTANTE.READ_PROFILE_ROLE]],
    [ Helper.putPattern(RoutesPrefix.profile, `/set-roles/:id`), [[ROLES.AFFECT_PROFILE_ROLE], LOG_CONSTANTE.AFFECT_PROFILE_ROLE]],
];


export default routeursRole;

