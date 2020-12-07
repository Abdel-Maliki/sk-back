import ROUTER_HELPER from './router-helper';
import BLACKHOLE_CONTROLLER from '../controller/blackhole';

class BlackholeRouter {
  public static read = ({
    validate: {
      continueOnError: true,
      output: ROUTER_HELPER.errorResponse(404)
    },
    handler: BLACKHOLE_CONTROLLER.read
  });
};

export default BlackholeRouter;
