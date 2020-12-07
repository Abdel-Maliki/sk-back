/**
 * @author abdel-maliki
 * Date : 02/12/2019
 */
import * as nodemailer from "nodemailer";
import {SentMessageInfo} from "nodemailer";
import CONFIG from "../configs/config";

export class Mail {

    constructor() {
    }


    static async sendMail(to: string,
                   subject?: string,
                   message?: string): Promise<SentMessageInfo> {

        let mailOptions = {
            from: CONFIG.user,
            to: to,
            subject: subject,
            html: message
        };

        const transporter = nodemailer.createTransport({
            service: CONFIG.service,
            secure: false,
            auth: {
                user: CONFIG.user,
                pass: CONFIG.password
            },
            tls: {rejectUnauthorized: false}
        });

        console.log('mailOptions', mailOptions);

        return  await transporter.sendMail(mailOptions)
            .catch(reason => {
                return null;
            });

    }


}

export default Mail;