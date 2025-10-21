// const express = require('express')
// const app = express()
import { Router } from "express";
import memDBRouter from "./memberDatabase.js"


const router = Router();

router.get('/', async (req, res) => {
  res.render('adminHomePage', {
    title: "Home Page",
    // user: user,
  });
});

router.use(memDBRouter)

export default router;
