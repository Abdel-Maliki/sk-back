/**
 * @author abdel-maliki
 * Date : 04/11/2020
 */
class RouterHelper {

    public static createPath(base: string = ''): string {
        return `${base}`;
    }

    public static readPath(base: string = ''): string {
        return `${base}/:id`;
    }

    public static updatePath(base: string = ''): string {
        return `${base}/:id`;
    }

    public static deletePath(base: string = ''): string {
        return `${base}/:id`;
    }

    public static allPath(base: string = ''): string {
        return `${base}/get/all`;
    }

    public static deleteAllPath(base: string = ''): string {
        return `${base}/delete/all`;
    }

    public static createAndGetPath(base: string = ''): string {
        return `${base}/create/and-get`;
    }

    public static updateAndGetPath(base: string = ''): string {
        return `${base}/update/and-get/:id`;
    }

    public static deleteAndGetPath(base: string = ''): string {
        return `${base}/delete/and-get/:id`;
    }

    public static pagePath(base: string = ''): string {
        return `${base}/page`;
    }

    public static searchPath(base: string = ''): string {
        return `${base}/search`;
    }
}

export default RouterHelper;
