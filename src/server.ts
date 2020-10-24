import {ConfigServerType} from 'index';

import KOA from 'koa';
import MORGAN from 'koa-morgan';
import CORS from '@koa/cors';
import HELMET from 'koa-helmet';
import ROUTER from './router';
import DB from './db';
import MIDDLEWARE from './middleware/';
import {JwtFunctionResponse} from 'index';

class Server {
  protected app: KOA;
  protected config: ConfigServerType;

  constructor (config: ConfigServerType) {
    this.app    = new KOA();
    this.config = config;
  };

  protected use (middleware: KOA.Middleware):Server {
    this.app.use(middleware);
    return this;
  };

  protected jwt (): JwtFunctionResponse {
    return MIDDLEWARE.jwt(this.config.jwt_secret);
  }

  protected router ():Server {
    const Router = ROUTER.initiate(this.jwt());
    this.use(Router.private.middleware());
    this.use(Router.public.middleware());
    return this;
  };

  protected middleware ():Server {
    this.use(MIDDLEWARE.answer);
    this.use(MIDDLEWARE.onError);
    this.use(this.jwt().middleware)
    this.use(MORGAN('combined'));
    this.use(HELMET());
    this.use(CORS());
    return this;
  }

  protected db ():void {
    DB.connect({mongo_uri: this.config.mongo_uri}).then();
  };

  public initiate ():Server {
    this.db();
    this.middleware();
    this.router();
    return this;
  };

  public listen ():KOA {
    this.app.listen(this.config.port);
    console.log(`Server is listening on port ${this.config.port}`);
    return this.app;
  }
}

export default Server;


