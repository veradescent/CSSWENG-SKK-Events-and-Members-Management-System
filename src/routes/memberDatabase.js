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

    res.render('memberDatabase', { 
      members: allMembers,
      title: "Member Database"
    });
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

memDBRouter.post('/addMember', async (req, res) => {
    try {
        console.log("/addMember req received");
        
        const newMember = new Member({
            fullName: req.body.fullName,        
            areaChurch: req.body.areaChurch,      
            sim: req.body.sim,              
            contactNumber: req.body.contactNumber,
            emailAddress: req.body.emailAddress     
        });
        
        try {
            await newMember.save(); 
        } catch (error) {
            console.log(`Error from model: ${error}`)
            return
        }
        // console.log('Member Successfully created');
        // console.log(`${newMember.fullName} successfully created`);
        
        // Add some validation check afterwards in public/js/memberDatabase.js
        return res.status(200).json({ 
            message: 'Member created successfully',
        });
        
    } catch (error) {
        console.error("Error creating member:", error);
        return res.status(500).json({ 
            error: 'Failed to create member',
            details: error.message 
        });
    }
});

memDBRouter.put('/editMember/:id', async (req, res) => {
    try {
        console.log(`/editMember req received`);
        const filter = {_id: req.params.id};
        const update = req.body;
        const mem = await Member.findOneAndUpdate(filter, update);
        console.log(`Member found: ${mem.fullName}`);
        return res.status(200).json({
            message: 'DB updated successfully'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            error: 'Failed to update member',
            details: error.message 
        });
    }
});

export default memDBRouter;
