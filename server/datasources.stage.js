// 'use strict';
// /**
//  * @author Viet Nghiem<nghiem.van.viet@gmail.com>
//  */

module.exports = {
  mailTransport: {
    name: "mailTransport",
    connector: "mail",
    transports: [
      {
        type: "SMTP",
        host: process.env.EMAIL_HOST || "",
        secure: false,
        port: process.env.EMAIL_PORT || 25,
        auth: null,
        tls: {
          rejectUnauthorized: false,
        },
      },
    ],
  },
};
