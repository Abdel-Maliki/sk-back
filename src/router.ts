import ROUTER, {Spec} from 'koa-joi-router';
import BLACKHOLE_ROUTES from './router/blackhole';
import USER_ROUTES from './router/user';
import PROFILE_ROUTES from './router/profile-router';
import LOG_ROUTES from './router/log-router';
import ENTERPRISE_ROUTES from './router/enterprise-router';
import BENEFICIARY_ROUTES from './router/beneficiary-router';
import REGION_ROUTES from './router/region-router';
import DEPARTMENT_ROUTES from './router/department-router';
import MUNICIPALITY_ROUTES from './router/municipality-router';
import NEIGHBORHOOD_ROUTES from './router/neighborhood-router';
import RESOURCE_ROUTES from './router/resource-router';
import LOGIN_ROUTES from './router/login';
import HEALTH_ROUTES from './router/health';
import {JwtFunctionResponse} from "index";
import Middleware from "./middleware";
import LogConstante from "./constante/log-constante";
import {RoutesPrefix} from "./constante/routes-prefix";

class Router {

    public static privateRoutes(jwtMiddleware: JwtFunctionResponse): ROUTER.Router[][] {
        return [
            USER_ROUTES.routes(jwtMiddleware),
            PROFILE_ROUTES.routes(jwtMiddleware),
            LOG_ROUTES.routes(jwtMiddleware),
            ENTERPRISE_ROUTES.routes(jwtMiddleware),
            BENEFICIARY_ROUTES.routes(jwtMiddleware),
            REGION_ROUTES.routes(jwtMiddleware),
            DEPARTMENT_ROUTES.routes(jwtMiddleware),
            MUNICIPALITY_ROUTES.routes(jwtMiddleware),
            NEIGHBORHOOD_ROUTES.routes(jwtMiddleware),
            RESOURCE_ROUTES.routes(jwtMiddleware),
        ]
    }

    private static publicRoutes: { data: { spec: Spec, log: LogConstante }[], prefix: string }[] = [
        {prefix: '', data: [{spec: HEALTH_ROUTES.read, log: LogConstante.HEALTH}]},
        {
            prefix: RoutesPrefix.user,
            data: [{spec: USER_ROUTES.forgotPasswordRequest, log: LogConstante.FORGOT_PASSWORD_REQUEST}]
        },
        {
            prefix: RoutesPrefix.user,
            data: [{spec: USER_ROUTES.forgotPasswordFinalisation, log: LogConstante.FORGOT_PASSWORD_FINALISATION}]
        },
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
