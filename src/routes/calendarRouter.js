import { Router } from "express";

const calenderRouter = Router();

calenderRouter.get('/calendar', async (req, res) => {
    res.render('calendar', {
        title: "Calendar",
    })
});

export default calenderRouter;