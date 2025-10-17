import { Router } from "express";
import { Member } from "../models/memberModel.js"

const memDBRouter = Router();


// userPageRouter.get('/u/:userName', async (req, res) => {
//   let currentUser = null;
//   const user = await User.findOne({username: req.params.userName}).lean().exec();
//   if(req.isAuthenticated()) {
//     currentUser = req.user.toObject();
//   }
//   if (user){
//     console.log("User:");
//     console.log(user);
//     const posts = await Post.find({user: user._id}).populate('user').lean().exec();
//     console.log(posts);
//     const comments = await Comment.find({}).populate('user').populate('post').lean().exec();
//     console.log(currentUser);
//     res.render('user', {
//       title: "Profile",
//       user: user,
//       posts: posts,
//       comments: comments,
//       currentUser: currentUser,
//       isLoggedIn: req.isAuthenticated()
//     });
//   }
//   else{ 
//     res.render('error', {
//       err_message: "User does not exist"
//     });
//   }


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

//memDBRouter.get('/member-database', isAdmin, async (req, res)
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

//   res.render('index', {
//     title: "Home Page",
//     // user: user,
//     posts: posts,
//     isLoggedIn: req.isAuthenticated(),
//     currentUser: user
//   });
// });
//

export default memDBRouter;
