const express = require("express");

const AuthorModel = require("./schema");
const { authenticate, refreshToken } = require("../../utils/auth");
const { authorize, adminOnly } = require("../../utils/auth/middlewares");

const router = express.Router();

router.get("/", authorize, adminOnly, async (req, res, next) => {
  try {
    const authors = await AuthorModel.find();
    res.status(200).send(authors);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/me", authorize, async (req, res, next) => {
  try {
    res.status(200).send(req.author);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const newAuthor = new AuthorModel(req.body);
    const { _id } = await newAuthor.save();

    res.status(201).send(_id);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.put("/me", async (req, res, next) => {
  try {
    const updates = Object.keys(req.body);
    updates.forEach((update) => req.author[update] === req.body[update]);
    await req.author.save();

    res.status(200).send(req.author);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await req.author.deleteOne();

    res.status(203).send("Author deleted");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const author = await AuthorModel.findByCredentials(email, password);
    const tokens = await authenticate(author);
    res.status(200).send(tokens);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/logoutAll", authorize, async (req, res, next) => {
  try {
    req.author.refreshTokens = [];
    await req.author.save();
    res.send();
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/refreshToken", async (req, res, next) => {
  const oldRefreshToken = req.body.refreshToken;
  if (!oldRefreshToken) {
    const err = new Error("Refresh token missing");
    err.httpStatusCode = 400;
    next(err);
  } else {
    try {
      const newTokens = await refreshToken(oldRefreshToken);
      res.status(200).send(newTokens);
    } catch (error) {
      console.log(error);
      const err = new Error(error);
      err.httpStatusCode = 403;
      next(err);
    }
  }
});
module.exports = router;
