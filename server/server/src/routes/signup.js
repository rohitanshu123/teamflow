import { Router } from "express";
import { User } from "../models/index.js";
import { firebaseAuth } from "../middleware/firebaseAuth.js";

const router = Router();

// router.post(
//   "/signup",
//   firebaseAuth,
//   async (req, res) => {
//     try {
//       const { name, email } = req.body;

//       let user = await User.findOne({
//         firebaseUid: req.firebaseUser.uid,
//       });

//       if (user) {
//         return res.json(user);
//       }

//       user = await User.create({
//         name,
//         email,
//         firebaseUid: req.firebaseUser.uid,
//         role: "member",
//       });

//       res.status(201).json(user);
//     } catch (err) {
//       res.status(500).json({
//         error: err.message,
//       });
//     }
//   }
// );

router.post("/signup", async (req, res) => {
  try {
        console.log("Signup route hit");
    console.log("Body:", req.body);



    const authHeader = req.headers.authorization;
        console.log("Auth Header:", authHeader);


    const token = authHeader.split(" ")[1];

    const decoded = await admin
      .auth()
      .verifyIdToken(token);

          console.log("Decoded:", decoded);


    const existingUser = await User.findOne({
      firebaseUid: decoded.uid,
    });

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists",
      });
    }

    const user = await User.create({
      firebaseUid: decoded.uid,
      email: decoded.email,
      name: req.body.name,
      role: "MEMBER",
    });

    console.log("User saved:", user);

    res.status(201).json(user);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Signup failed",
    });
  }
});
export default router;