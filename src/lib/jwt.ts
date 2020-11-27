import JWT from 'jsonwebtoken';

import {ConfigJwtType} from './../types/';


/**
 * @param token - Takes a secret string to verify the payload
 * @returns A promise with the valid object or string, or invalid if null
*/
type VerifyFunction = (token:string|null, agent: string, password: string) => Promise<object|string|null>;

/**
 * @param token - Takes a secret string to verify the payload
 * @returns A promise with the valid object or string, or invalid if null
 */
type DecodeFunction = (token:string|null) => Promise<null | { [key: string]: any } | string>;

/**
 * @param user - Signs the object with the JWT Secret
 * @returns A promise with a base64 encoded string
*/
type SignFunction   = (user:{id: string, agent: string, password: string}) => Promise<string>;

class Jwt {
  protected secret:string;

  constructor (config: ConfigJwtType) {
    this.secret = config.secret
  };

  public verify:VerifyFunction = (token, agent: string, password: string) => {
    return new Promise ((resolve, reject) => {
      if (!token) reject(null);
      JWT.verify(token, this.secret + agent + password , (err, response) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(response);
        }
      });
    });
  }

  public sign:SignFunction = (user: {id: string, agent: string, password: string}) => {
    return new Promise ((resolve, reject) => {
      JWT.sign(user, this.secret + user.agent + user.password , {expiresIn: "20 days"},(err, response) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(response);
        }
      });
    });
  }

  public decode:DecodeFunction = (token: string| null) => {
    return new Promise ((resolve) => {
      resolve(JWT.decode(token))
    });
  }

}

export default Jwt;
