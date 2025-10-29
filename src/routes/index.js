// const express = require('express')
// const app = express()
import { Router } from "express";
import memDBRouter from "./memberDatabase.js"
import createEventRouter from "./createEventRouter.js";
import editEventRouter from "./editEventRouter.js";

const router = Router();

router.get('/', async (req, res) => {
  res.render('adminHomePage', {
    title: "Home Page",
    // user: user,
  });
});

router.use(memDBRouter);
router.use(createEventRouter);
router.use(editEventRouter);

export default router;
