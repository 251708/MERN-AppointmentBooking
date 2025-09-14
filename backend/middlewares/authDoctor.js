import jwt from 'jsonwebtoken'

/* doctor authentication middleware
const authDoctor = async (req, res , next) => {
    try{
      const {dtoken} = req.headers
      if(!dtoken) {
        return res.json({success:false, message:"not authorized login again"})
      }
      const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET)
      //problem in this code is here req.body.userId
      req.body.docId = token_decode.id
       next()
    }catch(error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

*/

const authDoctor = async (req, res, next) => {
  try {
    const dtoken = req.headers.authorization.split(" ")[1];
    if (!dtoken) return res.status(401).json({ success: false, message: "No token" });

    const decoded = jwt.verify(dtoken, process.env.JWT_SECRET);
    req.docId = decoded.id;   // store doctorId in request
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export default authDoctor

