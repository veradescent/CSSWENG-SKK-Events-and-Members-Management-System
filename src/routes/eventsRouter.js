import { Router } from "express";
import Events from "../models/eventsModel.js"

const eventsRouter = Router();

eventsRouter.get('/event-view', async (req, res) => {
  try {
    const allMembers = await Events.find({})
      .sort({ dateAdded: 1 })
      .lean()
      .exec();

    res.render('memberDatabase', { members: allMembers });
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).send("Internal Server Error");
  }
});
