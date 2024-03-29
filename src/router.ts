import ROUTER, {Spec} from 'koa-joi-router';
import BLACKHOLE_ROUTES from './router/blackhole';
import USER_ROUTES from './router/user';
import PROFILE_ROUTES from './router/profile-router';
import LOG_ROUTES from './router/log-router';
import LOGIN_ROUTES from './router/login';
import HEALTH_ROUTES from './router/health';
import {JwtFunctionResponse} from "index";
import Middleware from "./middleware";
import LogConstante from "./constante/log-constante";

class Router {

    public static privateRoutes(jwtMiddleware: JwtFunctionResponse):ROUTER.Router[][] {
        return [
            USER_ROUTES.routes(jwtMiddleware),
            PROFILE_ROUTES.routes(jwtMiddleware),
            LOG_ROUTES.routes(jwtMiddleware),
        ]
    }

    private static publicRoutes: { data: { spec: Spec, log: LogConstante }[], prefix: string }[] = [
        {prefix: '', data: [{spec: HEALTH_ROUTES.read, log: LogConstante.HEALTH}]},
        LOGIN_ROUTES.routes(),
    ]

    public static initiate(jwtMiddleware: JwtFunctionResponse): { private: ROUTER.Router, public: ROUTER.Router, notFound: ROUTER.Router } {
        const privateRouter = ROUTER();
        const publicRouter = ROUTER();
        const notFoundRoute = ROUTER();

        //privateRouter.use(jwtMiddleware.authenticate);
        notFoundRoute.use(jwtMiddleware.authenticate);


        Router.publicRoutes.forEach(routes => {
            routes.data.forEach(data => {
                const router = ROUTER();
                router.prefix(routes.prefix);
                router.use((context, next) => Middleware.addLog(context, next, data.log));
                router.route([data.spec]);
                publicRouter.use(router.middleware());
            })
        });

        notFoundRoute.get('*', BLACKHOLE_ROUTES.read.handler);
        notFoundRoute.post('*', BLACKHOLE_ROUTES.read.handler);
        notFoundRoute.delete('*', BLACKHOLE_ROUTES.read.handler);
        notFoundRoute.put('*', BLACKHOLE_ROUTES.read.handler);
        notFoundRoute.patch('*', BLACKHOLE_ROUTES.read.handler);
        return {private: privateRouter, public: publicRouter, notFound: notFoundRoute};
    }
}

export default Router;
