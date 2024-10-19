/* eslint-disable react/jsx-key */
import React, { useContext } from "react";
import { assets, plans } from "../assets/assets";
import { AppContext } from "../contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import axios from "axios";

const BuyCredit = () => {
  const { backendUrl, loadCreditsData } = useContext(AppContext);
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const paymentStripe = async (planId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl + "/api/user/create-stripe-session",
        { planId },
        { headers: { token } }
      );

      if (data.success) {
        window.location.href = `https://checkout.stripe.com/pay/${data.sessionId}`;
      } else {
        toast.error("Payment session creation failed");
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-[78vh] text-center mb-10 pt-14">
      <button className="border border-gray-400 rounded-full mb-6 px-10 py-2">
        Our Plans
      </button>
      <h1 className="text-center text-2xl md:text-3xl lg:text-4xl mt-4 font-semibold bg-gradient-to-r from-gray-900 to-gray-400 bg-clip-text text-transparent mb-6 sm:mb-10">
        Choose the plan that's right for you
      </h1>
      <div className="flex flex-wrap justify-center gap-6 text-left">
        {plans.map((item, index) => (
          <div
            className="bg-white drop-shadow-sm border rounded-lg px-8 py-12 text-gray-700 hover:scale-105 transition-all duration-500"
            key={index}
          >
            <img width={40} src={assets.logo_icon} alt="" />
            <p className="mt-3 font-semibold">{item.id}</p>
            <p className="text-sm">{item.desc}</p>
            <p className="mt-6">
              <span className="text-3xl font-medium">${item.price}</span>/{" "}
              {item.credits} credits
            </p>
            <button
              onClick={() => paymentStripe(item.id)}
              className="w-full bg-gray-800 text-white mt-8 py-2.5 rounded-md text-sm min-w-52"
            >
              Purchase
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyCredit;
