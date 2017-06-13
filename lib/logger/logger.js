module.exports.main = function() {
  const winston = require('winston')
  require('winston-loggly-bulk')
  winston.add(winston.transports.Loggly, {
    token: "41feb295-2f15-4838-8d59-e65a7ec9b5e4",
    subdomain: "ta2yak",
    tags: ["Winston-NodeJS", "Sticky-Main"],
    json:true
  })

  return winston;
}

module.exports.renderer = function() {
  const winston = require('winston')
  require('winston-loggly-bulk')
  winston.add(winston.transports.Loggly, {
    token: "41feb295-2f15-4838-8d59-e65a7ec9b5e4",
    subdomain: "ta2yak",
    tags: ["Winston-NodeJS", "Sticky-Renderer"],
    json:true
  })

  return winston;
}

