import { Router } from "express";
import Member from "../models/memberModel.js";
import logError from '../../logError.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

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
// GET to display db with search, filter, and sort
memDBRouter.get('/member-database', requireAdmin, async (req, res) => {
  try {
    const { search, areaChurch, sim, sort } = req.query;
    const query = {};

    // 🔍 Text search
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { emailAddress: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // 🧭 Filters
    if (areaChurch && areaChurch !== "All") query.areaChurch = areaChurch;
    if (sim && sim !== "All") query.sim = sim;

    // 🔢 Sorting options
    let sortOption = {};
    switch (sort) {
      case "name_asc":
        sortOption.fullName = 1;
        break;
      case "name_desc":
        sortOption.fullName = -1;
        break;
      case "area_asc":
        sortOption.areaChurch = 1;
        break;
      case "area_desc":
        sortOption.areaChurch = -1;
        break;
      case "sim_asc":
        sortOption.sim = 1;
        break;
      case "sim_desc":
        sortOption.sim = -1;
        break;
      default:
        sortOption.fullName = 1; // default sorting
    }

    const allMembers = await Member.find(query)
      .sort(sortOption)
      .lean()
      .exec();

    res.render('memberDatabase', {
      members: allMembers,
      title: "Member Database",
      filters: { search, areaChurch, sim, sort }
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    await logError(error, req);
    res.status(500).send("Internal Server Error");
  }
});


//DELETE by id
memDBRouter.delete("/member-database/:id", requireAdmin, async (req, res) => {
  try {
    const deletedMember = await Member.findByIdAndDelete(req.params.id);
    if (!deletedMember) {
      return res.status(404).send("Member not found");
    }
    res.status(200).send("Member deleted successfully");
  } catch (error) {
    console.error("Error deleting member:", error);
    await logError(error, req);
    res.status(500).send("Internal Server Error");
  }
});

memDBRouter.post('/addMember', requireAdmin, async (req, res) => {
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
            await logError(error, req);
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
        await logError(error, req);
        return res.status(500).json({ 
            error: 'Failed to create member',
            details: error.message 
        });
    }
});

memDBRouter.put('/editMember/:id', requireAdmin, async (req, res) => {
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
        await logError(error, req);
        return res.status(500).json({ 
            error: 'Failed to update member',
            details: error.message 
        });
    }
});

export default memDBRouter;
