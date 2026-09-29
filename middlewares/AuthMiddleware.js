import jwt from 'jsonwebtoken'
export const verifyuser = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded;
    next();
  } catch (err) {

    return res.status(401).json({ success:false ,message: "Invalid token" });
  }
};