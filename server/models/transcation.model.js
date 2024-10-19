import mongoose from "mongoose";

// Define the schema for the transaction
const transactionSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
  },
  plan: {
    type: String,
    required: true,
  },
  credits: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  payment: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Number,
    default: Date.now, // Set default value to the current date
  },
});

// Create the model using the schema
const transactionModel =
  mongoose.model.Transaction ||
  mongoose.model("Transaction", transactionSchema);

// Export the model
export default transactionModel;
