import { Router } from "express";
import Events from "../models/eventsModel.js"
import logError from '../../logError.js';

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
    await logError(error, req);
    res.status(500).send("Internal Server Error");
  }
});

eventsRouter.get('/preview', async (req, res) => {
  try {
    const events = await Events.find({})
      .sort({ date: 1 }) // or any field you use for sorting
      .limit(5)          // show first 5 events
      .lean()
      .exec();

    res.json({ success: true, events });
  } catch (error) {
    console.error("Error fetching event preview:", error);
    await logError(error, req);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
export default eventsRouter;
