FROM node:24-alpine
WORKDIR /app
COPY --chown=node:node . .
USER node
# No port is exposed: the server intentionally binds to loopback.
# For the headless recorder, mount your private input and persistent data.
CMD ["node", "collector.mjs", "--input", "/input/readings.json"]
