import express from "express";
import { login, logout, register,verifyOtp } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { createJob } from "../controllers/job.post.js";
import { sendmail } from "../controllers/sendmail.js";
 
const router = express.Router();

router.route("/register").post(register);
router.route("/verifyOtp").post(verifyOtp);
router.route("/logout").get(logout)
router.route("/login").post(login)
router.route("/postjob").post(isAuthenticated,createJob)
router.route("/sendmail").post(isAuthenticated,sendmail)
//http://localhost:8000/api/v1/user/register
export default router;

