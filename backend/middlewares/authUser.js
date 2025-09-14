
/*
import jwt from 'jsonwebtoken'

//user authentication middleware
const authUser = async (req, res , next) => {
    try{
      const {token} = req.headers
      if(!token) {
        return res.json({success:false, message:"not authorized login again"})
      }
      const token_decode = jwt.verify(token, process.env.JWT_SECRET)
      //problem in this code is here req.body.userId
      req.body.userId = token_decode.id
       next()
    }catch(error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

export default authUser



*/


import jwt from 'jsonwebtoken'

// user authentication middleware
const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers
    if (!token) {
      return res.json({ success: false, message: "Not authorized, login again" })
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET)

    // ✅ attach to req.user instead of req.body
    req.userId = token_decode.id 
  

    next()
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

export default authUser

