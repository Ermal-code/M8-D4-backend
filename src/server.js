const express = require("express");
const listEndpoints = require("express-list-endpoints");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");

const articlesRoute = require("./services/articles");
const authorsRoute = require("./services/authors");

const {
  notFoundErrorHandler,
  unauthorizedErrorHandler,
  badRequestErrorHandler,
  forbiddenErrorHandler,
  catchAllErrorHandler,
} = require("./errorHandling");

const server = express();

const port = process.env.PORT || 3003;

server.use(cors());
server.use(helmet());
server.use(express.json());

server.use("/articles", articlesRoute);
server.use("/authors", authorsRoute);

server.use(badRequestErrorHandler);
server.use(notFoundErrorHandler);
server.use(forbiddenErrorHandler);
server.use(unauthorizedErrorHandler);
server.use(catchAllErrorHandler);

console.log(listEndpoints(server));

mongoose.set("debug", true);

mongoose
  .connect(process.env.MONGO_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(server.listen(port, () => console.log("Running on port", port)))
  .catch((err) => console.log(err));
