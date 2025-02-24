import express from "express";
import {
  forgotPasswordController,
  getAllOrdersController,
  getOrdersController,
  loginController,
  orderStatusController,
  registerController,
  testController,
  updateProfileController,
} from "../controllers/authController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
//router object
const router = express.Router();

//routing
//REGISTER || METHOD POST
router.post("/register", registerController);

//LOGIN || POST
router.post("/login", loginController);

//Forgot Password || POST
router.post("/forgot-password", forgotPasswordController);

//test rout
router.get("/test", requireSignIn, isAdmin, testController);

// Protected User Route auth
router.get("/user-auth", requireSignIn, (req, res) => {
  // `req.user` will have the decoded user information (e.g., userId, email, etc.)
  console.log(req.user); // Logs the user info to the console
  res.status(200).send({ ok: true, user: req.user }); // Send the user info to the client
});

// Protected Admin Route auth
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  // `req.user` will have the decoded user information (e.g., userId, email, etc.)
  console.log(req.user); // Logs the user info to the console
  res.status(200).send({ ok: true, user: req.user }); // Send the user info to the client
});

//update profile
router.put("/profile", requireSignIn, updateProfileController);

//orders
router.get("/orders", requireSignIn, getOrdersController);

//orders
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);

//orders status update
router.put(
  "/order-status/:orderId",
  requireSignIn,
  isAdmin,
  orderStatusController
);

export default router;
