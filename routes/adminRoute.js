import express from "express";
import { loginAdmin, logoutAdmin, registerAdmin } from "../controllers/adminController.js";

const router = express.Router();


router.route("/admin/register").post(registerAdmin);
router.route("/admin/login").post(loginAdmin);
router.route("/admin/logout").get(logoutAdmin);


export default router;