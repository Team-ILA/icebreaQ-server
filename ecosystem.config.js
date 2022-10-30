/* eslint-disable @typescript-eslint/no-var-requires */
const config = require("./config");

module.exports = {
  apps: [
    {
      name: "icebreaQ-api",
      script: "dist/src/index.js",
      env: {
        ...config,
        NODE_ENV: "production",
      },
    },
  ],
  deploy: {
    production: {
      user: process.env.SERVER_USER,
      host: process.env.SERVER_HOST,
      key: "deploy.key",
      ref: "main",
      repo: "git@github.com:Team-ILA/icebreaQ-server.git",
      path: process.env.SERVER_PATH,
      "post-deploy":
        "npm install && \
        npm run build && \
        pm2 reload ecosystem.config.js",
    },
  },
};
