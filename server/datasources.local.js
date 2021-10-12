"use strict";
/**
 * @author Viet Nghiem<nghiem.van.viet@gmail.com>
 */

module.exports = {
  // db: {
  //   name: "db",
  //   connector: process.env.DATABASE_CONNECTOR,
  //   host: process.env.DATABASE_HOST,
  //   port: process.env.DATABASE_PORT,
  //   url: process.env.DATABASE_URL,
  //   database: process.env.DATABASE_NAME,
  //   user: process.env.DATABASE_USER,
  //   password: Buffer.from(process.env.DATABASE_USER_PASSWORD || "", "base64").toString("utf-8"),
  //   ssl: false,
  //   server: {
  //     autoReconnect: true,
  //     reconnectTries: 100,
  //     reconnectInterval: 1000,
  //   },
  //   options: {
  //     encrypt: false
  //   }
  // },
  mailTransport: {
    name: "mailTransport",
    connector: "mail",
    transports: [
      {
        type: "SMTP",
        host: process.env.EMAIL_HOST || "",
        secure: true,
        port: process.env.EMAIL_PORT || 25,
        auth: {
          user: process.env.EMAIL_ID || "",
          pass: Buffer.from(process.env.EMAIL_PASSWORD || "", "base64").toString("utf-8"),
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
    ],
  },
};
