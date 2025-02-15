import express from "express"
import { signin, signout, signup } from "../controller/auth.controller.js"
import { verifyToken } from "../utils/verifyUser.js"

const router = express.Router()

router.post("/signup", signup)
router.post("/signin", signin)
router.post("/signout", (req, res) => {
  res.clearCookie("access_token", { httpOnly: true, secure: true, sameSite: "None" })
  return res.status(200).json({ success: true, message: "Logged out successfully" })
})

export default router
