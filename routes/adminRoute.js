import express from "express";
import { changeAdminPassword, loginAdmin, logoutAdmin, registerAdmin } from "../controllers/adminController.js";

const router = express.Router();


router.route("/admin/register").post(registerAdmin);
router.route("/admin/login").post(loginAdmin);
router.route("/admin/logout").get(logoutAdmin);
router.route("/admin/change-password").post(changeAdminPassword);


export default router;