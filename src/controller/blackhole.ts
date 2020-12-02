import { Responses } from './../types';
import {ModifiedContext} from "index";
;

class Blackhole {
  public static read = async (ctx: ModifiedContext) => {
    return ctx.answerUserError(404, Responses.NOT_FOUND);
  };
};

export default Blackhole;
