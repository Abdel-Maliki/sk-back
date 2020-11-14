import ROUTER_HELPER from "../router/router-helper";
import {RoutesPrefix} from "./routes-prefix";

/**
 * @author abdel-maliki
 * Date : 04/11/2020
 */

enum methods {POST = 'POST', GET = 'GET', DELETE = 'DELETE', PUT = 'PUT'}

class RoutersRoleHelper {

    public static methods = methods;

    public static read(base: string): string {
        return methods.GET + ROUTER_HELPER.readPath(base);
    }

    public static create(base: string): string {
        return methods.POST + ROUTER_HELPER.createPath(base);
    }

    public static update(base: string): string {
        return methods.PUT + ROUTER_HELPER.updatePath(base);
    }

    public static delete(base: string): string {
        return methods.DELETE + ROUTER_HELPER.deletePath(base);
    }

    public static all(base: string): string {
        return methods.GET + ROUTER_HELPER.allPath(base);
    }

    public static deleteAll(base: string): string {
        return methods.PUT + ROUTER_HELPER.deleteAllPath(base);
    }

    public static deleteAllAndGet(base: string): string {
        return methods.PUT + ROUTER_HELPER.deleteAllAndGetPath(base);
    }

    public static createAndGet(base: string): string {
        return methods.POST + ROUTER_HELPER.createAndGetPath(base);
    }

    public static updateAndGet(base: string): string {
        return methods.PUT + ROUTER_HELPER.updateAndGetPath(base);
    }

    public static deleteAndGet(base: string): string {
        return methods.PUT + ROUTER_HELPER.deleteAndGetPath(base);
    }

    public static page(base: string): string {
        return methods.POST + ROUTER_HELPER.pagePath(base);
    }

    public static search(base: string): string {
        return methods.PUT + ROUTER_HELPER.searchPath(base);
    }

    public static getPattern(base: string, path: string): string {
        return methods.GET + base + path;
    }

    public static putPattern(base: string, path: string): string {
        return methods.PUT + base + path;
    }

    public static postPattern(base: string, path: string): string {
        return methods.POST + base + path;
    }

    public static deletePattern(base: string, path: string): string {
        return methods.DELETE + base + path;
    }
}

export default RoutersRoleHelper;
