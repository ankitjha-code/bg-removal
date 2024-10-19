import express from "express";
import {
  clerkWebhooks,
  createStripeSession,
  userCredits,
  handleStripeWebhook,
} from "../controllers/user.controller.js";
import authUser from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/webhooks", clerkWebhooks);
userRouter.get("/credits", authUser, userCredits);
userRouter.post("/create-stripe-session", authUser, createStripeSession);
userRouter.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
); // Use raw body for Stripe webhooks

export default userRouter;
