import Helper from "./routers-role-helper";
import {RoutesPrefix} from "./routes-prefix";

/**
 * @author abdel-maliki
 * Date : 12/11/2020
 */

const singleAuthPaths: [string, [string]][] = [
    [Helper.getPattern(RoutesPrefix.user, `/current-user-data`), ["Récuperation des information de l'utilisateur courrent"]],
]

export default singleAuthPaths;