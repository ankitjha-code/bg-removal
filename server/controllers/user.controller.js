import { Webhook } from "svix";
import userModel from "../models/user.model.js";
// import transactionModel from "../models/transaction.model.js";
import Stripe from "stripe";
import transactionModel from "../models/transcation.model.js";
// import transactionModel from '../models/transaction.model.js'; // Ensure the path and extension are correct

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

const userCredits = async (req, res) => {
  try {
    const { clerkId } = req.body;
    const userData = await userModel.findOne({ clerkId });
    if (!userData) {
      throw new Error("User not found");
    }
    res.json({ success: true, credits: userData.creditBalance });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message }); // Send status 500 for errors
  }
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createStripeSession = async (req, res) => {
  try {
    const { clerkId, planId } = req.body;
    const userData = await userModel.findOne({ clerkId });
    if (!userData || !planId) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    let credits, plan, amount;
    switch (planId) {
      case "Basic":
        credits = 100;
        plan = "Basic";
        amount = 10;
        break;
      case "Advanced":
        credits = 500;
        plan = "Advanced";
        amount = 250;
        break;
      case "Business":
        credits = 5000;
        plan = "Business";
        amount = 250;
        break;
      default:
        return res.json({ success: false, message: "Invalid Plan" });
    }

    const transactionData = {
      clerkId,
      plan,
      credits,
      amount,
      date: Date.now(),
    };

    // Create a transaction record in the database
    const newTransaction = await transactionModel.create(transactionData);

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: process.env.CURRENCY || "usd",
            product_data: {
              name: `${plan} Plan`,
            },
            unit_amount: amount * 100, // Amount is in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: {
        transactionId: newTransaction._id.toString(),
      },
    });

    res.json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error("Stripe error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Handle Stripe webhook for payment verification
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      const transactionId = session.metadata.transactionId;

      // Find transaction by id and mark it as paid
      const transaction = await transactionModel.findById(transactionId);
      if (transaction && !transaction.payment) {
        const userData = await userModel.findOne({
          clerkId: transaction.clerkId,
        });

        // Update user's credit balance based on the purchased credits from the transaction
        const updatedCreditBalance =
          userData.creditBalance + transaction.credits;
        await userModel.findByIdAndUpdate(userData._id, {
          creditBalance: updatedCreditBalance,
        });

        // Mark transaction as paid
        await transactionModel.findByIdAndUpdate(transaction._id, {
          payment: true,
        });

        console.log("Payment successful for transaction:", transactionId);
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

export { clerkWebhooks, userCredits, createStripeSession, handleStripeWebhook };
