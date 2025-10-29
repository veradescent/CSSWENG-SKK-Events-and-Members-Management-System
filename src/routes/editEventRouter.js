import { Router } from "express";

const editEventRouter = Router();

editEventRouter.get('/editEvent', async (req, res) => {
    res.render('editEvent', {
        title: "Edit Event",
    })
})

export default editEventRouter;