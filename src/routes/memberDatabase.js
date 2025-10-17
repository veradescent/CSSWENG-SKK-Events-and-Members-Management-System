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


memDBRouter.get('/member-database', async (req, res) => {
    // members = await Member.find
    const allMembers = await Member.find({}).sort({dateAdded: 1}).lean().exec();
    res.render(
        'memberDatabase',{
            members: allMembers
        }
    )
})

//   res.render('index', {
//     title: "Home Page",
//     // user: user,
//     posts: posts,
//     isLoggedIn: req.isAuthenticated(),
//     currentUser: user
//   });
// });
//
