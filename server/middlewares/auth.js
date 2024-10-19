import jwt from "jsonwebtoken";
const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.json({ success: false, message: "yahi garbar hai" });
    }
    const decoded = jwt.decode(token);
    req.body.clerkId = decoded.clerkId;
    next();
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: "Unauthorized" });
  }
};

export default authUser;
