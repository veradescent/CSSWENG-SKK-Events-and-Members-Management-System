import { Router } from "express";

const createEventRouter = Router();

createEventRouter.get('/createEvent', async (req, res) => {
    res.render('createEvent', {
        title: "Create Event",
    })
})

export default createEventRouter;
