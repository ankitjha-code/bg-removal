import { Webhook } from "svix";
import userModel from "../models/user.model.js";

// http://localhost:4000/api/user/webhooks
const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-signature": req.headers["svix-signature"],
      "svix-timestamp": req.headers["svix-timestamp"],
    });

    const { data, type } = req.body;
    switch (type) {
      case "user.created": {
        const email = data?.email_addresses?.[0]?.email_address;
        if (!email) {
          throw new Error("Email address not found in request data");
        }

        const userData = {
          clerkId: data.id,
          email,
          photo: data.image_url,
          firstName: data.first_name,
          lastName: data.last_name,
        };
        await userModel.create(userData);
        res.json({}); // Fixed to use res.json()
        break;
      }
      case "user.updated": {
        const email = data?.email_addresses?.[0]?.email_address;
        if (!email) {
          throw new Error("Email address not found in request data");
        }

        const userData = {
          email,
          photo: data.image_url,
          firstName: data.first_name,
          lastName: data.last_name,
        };
        await userModel.findOneAndUpdate({ clerkId: data.id }, userData);
        res.json({}); // Fixed to use res.json()
        break;
      }
      case "user.deleted": {
        await userModel.findOneAndDelete({ clerkId: data.id });
        res.json({}); // Fixed to use res.json()
        break;
      }
      default: {
        res
          .status(400)
          .json({ success: false, message: "Invalid webhook event type" });
        break;
      }
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message }); // Send status 500 for errors
  }
};

export { clerkWebhooks };
