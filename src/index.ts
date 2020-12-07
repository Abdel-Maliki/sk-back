import {ConfigServerType} from './types/';

import SERVER from './server';
const {env: ENV} = process;

process.on('unhandledRejection', (err) => console.error(err));
process.on('uncaughtException',  (err) => console.error(err.stack || err));


class Services {
  public static server = () => {

    let CONFIG:ConfigServerType = {
      port: (ENV.PORT ? +ENV.PORT : 3000),
      mongo_uri: ENV.MONGO_URI   ? ENV.MONGO_URI   : 'mongodb://localhost:27017/test',
      jwt_secret: ENV.JWT_SECRET ? ENV.JWT_SECRET  :'12345678901234567890',
      enterprise_email_service: ENV.ENTREPRISE_EMAIL_SERVICE ? ENV.ENTREPRISE_EMAIL_SERVICE  :'gmail',
      enterprise_email: ENV.ENTREPRISE_EMAIL ? ENV.ENTREPRISE_EMAIL  :'malikiamadoutest00@gmail.com',
      enterprise_email_password: ENV.ENTREPRISE_EMAIL_PASSWORD ? ENV.ENTREPRISE_EMAIL_PASSWORD  :'AZERTYadmin',
    };

    const Server = new SERVER(CONFIG);
    return Server.initiate().then(value => value.listen());
  };
}

export default Services.server();
