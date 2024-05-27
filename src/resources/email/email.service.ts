import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class EmailService {
  private transporter: Transporter<SMTPTransport.SentMessageInfo>;
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'oauth2',
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
        accessToken: process.env.ACCESS_TOKEN,
        refreshToken: process.env.REFRESH_TOKEN,
        clientId: process.env.EMAIL_CLIENT,
        clientSecret: process.env.EMAIL_CLIENT_SECRET,
      },
    });
    this.transporter.verify(function (error) {
      if (error) {
        console.log(error);
      } else {
        console.log('Server is ready to take our messages');
      }
    });
  }

  async sendEmail(data: Mail.Options) {
    this.transporter.sendMail(data, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Correo enviado: ' + info.response);
      }
    });
  }
}
