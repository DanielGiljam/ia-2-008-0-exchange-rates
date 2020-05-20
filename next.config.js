/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */

const MomentLocalesPlugin = require("moment-locales-webpack-plugin")

if (!process.env.API_KEY) {
  throw new TypeError("process.env.API_KEY is not defined!")
}

module.exports = {
  webpack(config) {
    config.plugins.push(
      new MomentLocalesPlugin({
        localesToKeep: [],
      }),
    )
    return config
  },
}
