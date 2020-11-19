import Helper from "./routers-role-helper";
import {RoutesPrefix} from "./routes-prefix";

/**
 * @author abdel-maliki
 * Date : 12/11/2020
 */

const singleAuthPaths: [string, [string]][] = [
    [Helper.postPattern("", `/login`), ["Login"]],
]

export default singleAuthPaths;
