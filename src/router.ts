import ROUTER from 'koa-joi-router';
import BLACKHOLE_ROUTES from './router/blackhole';
import USER_ROUTES from './router/user';
import PROFILE_ROUTES from './router/profile-router';
import LOGIN_ROUTES from './router/login';
import HEALTH_ROUTES from './router/health';
import {JwtFunctionResponse} from "index";
import Middleware from "./middleware";

class Router {
    private static routes: ROUTER.Router[] = [
        PROFILE_ROUTES.routes(),
        USER_ROUTES.routes(),
    ]

    public static initiate(jwtMiddleware: JwtFunctionResponse): { private: ROUTER.Router, public: ROUTER.Router } {
        const privateRouter = ROUTER();
        const publicRouter = ROUTER();

        privateRouter.use(jwtMiddleware.authenticate);
        publicRouter.use(Middleware.freeRouteAction);

        Router.routes.forEach(router => privateRouter.use(router.middleware()))

        publicRouter.route(LOGIN_ROUTES.create);
        publicRouter.route(HEALTH_ROUTES.read);
        publicRouter.get('*', BLACKHOLE_ROUTES.read.handler);
        publicRouter.post('*', BLACKHOLE_ROUTES.read.handler);
        publicRouter.delete('*', BLACKHOLE_ROUTES.read.handler);
        publicRouter.put('*', BLACKHOLE_ROUTES.read.handler);
        publicRouter.patch('*', BLACKHOLE_ROUTES.read.handler);
        return {private: privateRouter, public: publicRouter};
    }
}

export default Router;
