const config = {
  images: {
    domains: ['static.okx.com', 's2.coinmarketcap.com'],
  },
}

const withTM = require('next-transpile-modules')(['lightweight-charts']);
module.exports = 
// withTM(
  config
  // );
