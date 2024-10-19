import { useAuth, useClerk, useUser } from "@clerk/clerk-react";
import { useState } from "react";
import { createContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
// import { set } from "mongoose";
import { useNavigate } from "react-router-dom";
// import { set } from "mongoose";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const [credit, setCredit] = useState(5);
  const [image, setImage] = useState("");
  const [resultImage, setResultImage] = useState("");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { getToken } = useAuth();
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const navigate = useNavigate();

  const loadCreditsData = async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Token not found");
      }
      const { data } = await axios.get(backendUrl + "/api/user/credits", {
        headers: { token },
      });
      console.log(data);
      if (data.success) {
        console.log(data.credits);
        setCredit(data.credits);
        console.log(data.credits);
      }
    } catch (error) {
      console.error(error.message);
      toast.error(error.message);
    }
  };

  const removeBg = async (image) => {
    try {
      if (!isSignedIn) {
        return openSignIn();
      }
      setImage(image);
      setResultImage("");
      navigate("/result");
      const token = await getToken();
      if (!token) {
        throw new Error("Token not found");
      }
      const formData = new FormData();
      image && formData.append("image", image);
      const { data } = await axios.post(
        backendUrl + "/api/image/remove-bg",
        formData,
        {
          headers: { token },
        }
      );
      if (data.success) {
        setResultImage(data.resultImage);
        data.creditBalance && setCredit(data.creditBalance);
        console.log(data.resultImage);
        console.log(data.creditBalance);
      } else {
        toast.error(data.message);
        data.creditBalance && setCredit(data.creditBalance);
        if (data.creditBalance === 0) {
          navigate("/buy");
        }
        console.log(image);
      }
    } catch (error) {
      console.error(error.message);
      toast.error(error.message);
    }
  };
  const value = {
    credit,
    setCredit,
    loadCreditsData,
    backendUrl,
    image,
    setImage,
    removeBg,
    setResultImage,
    resultImage,
  };

  return (
    // eslint-disable-next-line react/prop-types
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
