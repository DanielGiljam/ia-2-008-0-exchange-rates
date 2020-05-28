/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */

const MomentLocalesPlugin = require("moment-locales-webpack-plugin")

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
