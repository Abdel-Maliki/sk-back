import Helper from "./routers-role-helper";
import {RoutesPrefix} from "./routes-prefix";

/**
 * @author abdel-maliki
 * Date : 12/11/2020
 */

const singleAuthPaths: string[] = [
    Helper.getPattern(RoutesPrefix.user, `/current-user-data`),
]

export default singleAuthPaths;
