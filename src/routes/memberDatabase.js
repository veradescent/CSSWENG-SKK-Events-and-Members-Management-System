import { Router } from "express";
import Member from "../models/memberModel.js";

const memDBRouter = Router();

//Admin Check Func
function isAdmin(req, res, next) {
  if (!req.user) { 
    // not logged in
    return res.redirect('/login');
  }

  //changeable cond for checking admin
  if (req.user.role !== 'admin') {
    // logged in but not admin
    return res.status(403).send('Access denied: Admins only');
  }

  next();
}

//GET to display db
memDBRouter.get('/member-database', async (req, res) => { //put isAdmin check before the async func when completed
  try {
    const allMembers = await Member.find({})
      .sort({ dateAdded: 1 })
      .lean()
      .exec();

    res.render('memberDatabase', { members: allMembers });
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).send("Internal Server Error");
  }
});

//DELETE by id
memDBRouter.delete("/member-database/:id", async (req, res) => {
  try {
    const deletedMember = await Member.findByIdAndDelete(req.params.id);
    if (!deletedMember) {
      return res.status(404).send("Member not found");
    }
    res.status(200).send("Member deleted successfully");
  } catch (error) {
    console.error("Error deleting member:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default memDBRouter;
