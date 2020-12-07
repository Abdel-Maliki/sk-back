import {MessageError} from "index";

/**
 * @author abdel-maliki
 * Date : 07/12/2020
 */

class JoiMessageMapper {

    public static numberMessageWrapper(messageError: MessageError) {
        return (messageError.type === 'number.max')
            ? `${messageError.context.label} doit être inférieur ou égal à ${messageError.context.limit}`
            : (messageError.type === 'number.min')
                ? `${messageError.context.label} doit être supérieur ou égal à ${messageError.context.limit}`
                : (messageError.type === 'number.base')
                    ? `${messageError.context.label} doit être un nombre`
                    : (messageError.type === 'number.integer')
                        ? `${messageError.context.label} doit être un entier`
                        : (messageError.type === 'number.negative')
                            ? `${messageError.context.label} doit être un nombre négatif`
                            : (messageError.type === 'number.positive')
                                ? `${messageError.context.label} doit être un nombre positif`
                                : `${messageError.context.label} invalid`


        /*if (messageError.type.includes('max'))
            return `La taille maximale pour ${messageError.context.label} est ${messageError.context.limit}`*/
    };

    public static stringMessageWrapper(messageError: MessageError) {
        return (messageError.type === 'string.max')
            ? `${messageError.context.label} la longueur doit être inférieure ou égale à ${messageError.context.limit} caractère`
            : (messageError.type === 'string.min')
                ? `${messageError.context.label} la longueur doit être d'au moins ${messageError.context.limit} caractères`
                : (messageError.type === 'string.base')
                    ? `${messageError.context.label} doit être un text`
                    : (messageError.type === 'string.email')
                        ? `${messageError.context.label} doit être un email valide`
                        : (messageError.type === 'string.alphanum')
                            ? `${messageError.context.label} ne doit contenir que des caractères alphanumériques`
                            : (messageError.type === 'string.creditCard')
                                ? `${messageError.context.label} doit être une carte de crédit`
                                : (messageError.type === 'string.base64')
                                    ? `${messageError.context.label} doit être une chaîne base64 valide`
                                    : (messageError.type === 'string.guid')
                                        ? `${messageError.context.label} doit être un GUID valide`
                                        : (messageError.type === 'string.dataUri')
                                            ? `${messageError.context.label} doit être un schéma d'URI valide`
                                            : (messageError.type === 'string.hex')
                                                ? `${messageError.context.label} ne doit contenir que des caractères hexadécimaux`
                                                : (messageError.type === 'string.isoDate')
                                                    ? `${messageError.context.label} doit être une date ISO 8601 valide`
                                                    : (messageError.type === 'string.hostname')
                                                        ? `${messageError.context.label} doit être un hostname`
                                                        : (messageError.type === 'string.token')
                                                            ? `${messageError.context.label} ne doit contenir que des caractères alphanumériques et des traits de soulignement`
                                                            : (messageError.type === 'string.uri')
                                                                ? `${messageError.context.label} doit être un uri valide`
                                                                : (messageError.type === 'string.ip')
                                                                    ? `${messageError.context.label} doit être une adresse IP valide avec un CIDR facultatif`
                                                                    : `${messageError.context.label} invalid`


        /*if (messageError.type.includes('max'))
            return `La taille maximale pour ${messageError.context.label} est ${messageError.context.limit}`*/
    };

    public static messageWrapper(messageError: MessageError) {
        console.log('Class: Helper, Function: messageWrapper, Line 109 , messageError: '
            , messageError);

        return (messageError.type.includes('required'))
            ? `${messageError.context.label} est requis${messageError.context.label.toLowerCase().startsWith('la') ? 'e' : ''}`
            : messageError.type.startsWith('number')
                ? JoiMessageMapper.numberMessageWrapper(messageError)
                : messageError.type.startsWith('string')
                    ? JoiMessageMapper.stringMessageWrapper(messageError)
                    : (messageError.type.endsWith('empty'))
                        ? `${messageError.context.label} n'est pas autorisé à être vide`
                        : messageError.type.includes('unique')
                            ? `${messageError.context.label} doit être unique`
                            : `${messageError.context.label} invalid`

        /*if (messageError.type.includes('max'))
            return `La taille maximale pour ${messageError.context.label} est ${messageError.context.limit}`*/
    };
}

export default JoiMessageMapper;