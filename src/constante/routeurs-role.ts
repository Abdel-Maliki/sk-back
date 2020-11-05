import Roles from "./roles";
import Helper from "./routers-role-helper";
import {RoutesPrefix} from "./routes-prefix";


/**
 * @author abdel-maliki
 * Date : 04/11/2020
 */


const RouteursRole: [string, string][] = [
    // User
    [Helper.create(RoutesPrefix.user), Roles.ADD_USER],
    [Helper.createAndGet(RoutesPrefix.user), Roles.ADD_USER],
    [Helper.update(RoutesPrefix.user), Roles.EDIT_USER],
    [Helper.updateAndGet(RoutesPrefix.user), Roles.EDIT_USER],
    [Helper.delete(RoutesPrefix.user), Roles.DELETE_USER],
    [Helper.deleteAll(RoutesPrefix.user), Roles.DELETE_USER],
    [Helper.deleteAndGet(RoutesPrefix.user), Roles.DELETE_USER],
    [Helper.read(RoutesPrefix.user), Roles.READ_USER],
    [Helper.all(RoutesPrefix.user), Roles.READ_USER],
    [Helper.page(RoutesPrefix.user), Roles.READ_USER],
    [Helper.search(RoutesPrefix.user), Roles.READ_USER],

    // Profile
    [Helper.create(RoutesPrefix.profile), Roles.ADD_PROFILE],
    [Helper.createAndGet(RoutesPrefix.profile), Roles.ADD_PROFILE],
    [Helper.update(RoutesPrefix.profile), Roles.EDIT_PROFILE],
    [Helper.updateAndGet(RoutesPrefix.profile), Roles.EDIT_PROFILE],
    [Helper.delete(RoutesPrefix.profile), Roles.DELETE_PROFILE],
    [Helper.deleteAll(RoutesPrefix.profile), Roles.DELETE_PROFILE],
    [Helper.deleteAndGet(RoutesPrefix.profile), Roles.DELETE_PROFILE],
    [Helper.read(RoutesPrefix.profile), Roles.READ_PROFILE],
    [Helper.all(RoutesPrefix.profile), Roles.READ_PROFILE],
    [Helper.page(RoutesPrefix.profile), Roles.READ_PROFILE],
    [Helper.search(RoutesPrefix.profile), Roles.READ_PROFILE],
    [`${Helper.methods.GET + RoutesPrefix.profile}/roles/:id`, Roles.AFFECT_PROFILE_ROLE],
    [`${Helper.methods.PUT + RoutesPrefix.profile}/set-roles/:id`, Roles.AFFECT_PROFILE_ROLE],
];


export default RouteursRole;

