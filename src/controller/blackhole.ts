import { Responses } from './../types';
import {ModifiedContext} from "index";
;

class Blackhole {
  public static read = async (ctx: ModifiedContext) => {
    return ctx.answer(404, Responses.NOT_FOUND);
  };
};

export default Blackhole;
