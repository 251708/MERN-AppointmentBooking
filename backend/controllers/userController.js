import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
// import razorpay from 'razorpay'
// API to register user

const registerUser = async(req, res) => {
    try {
        const{name, email, password} = req.body
        if(!name || !password || !email){
            return res.json({success:false, message:"Missing Details"})
        }
        //validating email format
        if(!validator.isEmail(email)){
        return res.json({success:false, message:"enter a valid email"})
        }
        //validating a strong password
        if(password.length < 8) {
            return res.json({success:false, message:"enter a strong password"})
        }
        
        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name, email,
            password: hashedPassword
        }
        //save the data in database
        const newUser = new userModel(userData)
        const user = await newUser.save()

        //_id 
      const token = jwt.sign({id:user._id} ,process.env.JWT_SECRET)
      res.json({success:true, token})
       
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    
    }
}


//API for user login
const loginUser = async(req, res) => {
    try {
       const {email,password} = req.body
       const user = await userModel.findOne({email})
       if(!user){
       return  res.json({success:false, message:"User does not exist"})   
       } 
       const isMatch = await bcrypt.compare(password, user.password)
       if(isMatch) {
        const token = jwt.sign({id:user._id} , process.env.JWT_SECRET)
        res.json({success:true, token})
       } else {
       res.json({success:false , message:"Invalid Credentials"})
       }
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})  
    }
}

// API to get user profile data
const getProfile = async (req, res) => {
  try {
    const userId = req.userId; // ✅ take it from middleware

    const userData = await userModel.findById(userId).select('-password');  
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, userData });    
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });    
  }
};

// API to update profile 

const updateProfile = async (req, res) => {
  try {
    const userId = req.userId; // ✅ from middleware, not from req.body
    const { name, phone, address, dob, gender } = req.body;  
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data Missing" });
    }

    // update basic profile data
    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender
    });

    // if image uploaded, update separately
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageURL = imageUpload.secure_url;
      await userModel.findByIdAndUpdate(userId, { image: imageURL });
    }

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


const bookAppointment = async (req, res) => {
  try {
    const { docId , slotDate , slotTime} = req.body
    const userId = req.userId;

   
    const docData = await doctorModel.findById(docId).select('-password')
    if(!docData.available) {
      return res.json({success:false , message:'Doctor not available'})
    }

    let slots_booked = docData.slots_booked
    // checking for slots availability
    if(slots_booked[slotDate]){
    if(slots_booked[slotDate].includes(slotTime)){
     return res.json({success:false , message:'Slot not available'}) 
    } else {
      slots_booked[slotDate].push(slotTime)
    }
  } else {
    slots_booked[slotDate] = []
    slots_booked[slotDate].push(slotTime)
  }

  const userData = await userModel.findById(userId).select('-password')
  delete docData.slots_booked
  
  const appointmentData = {
    userId,
    docId,
    userData,
    docData,
    amount: docData.fees,
    slotTime,
    slotDate,
    date: Date.now()
  }

  const newAppointment = new appointmentModel(appointmentData) 
  await newAppointment.save()

  // save new slots data in docData
  await doctorModel.findByIdAndUpdate(docId, {slots_booked})
  res.json({success:true , message:'Appointment Booked'})
  } catch (error) {
     console.log(error);
    res.json({ success: false, message: error.message });
  }
}


// API to get user appointments for frontend my-appointments page

const listAppointment = async(req, res) => {
  try {
    const userId = req.userId
    
    const appointments = await appointmentModel.find({userId})
    res.json({success:true, appointments})
  } catch (error) {
   console.log(error)
   res.json({success: false, message: error.message}) 
  }
}
  
/* API to cancel appointment 
const cancelAppointment = async (req , res) => {
  try {
    const appointmentId = req.body
    const userId = req.userId
    const appointmentData = await appointmentModel.findById(appointmentId)
    //verify appointment user
    if(appointmentData.userId != userId) {
     return res.json({success:false, message:"Unauthorized action"})
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {cancelled:true})
    // releasing doctor slot
    const {docId, slotDate,slotTime} = appointmentData
    const doctorData = await doctorModel.findById(docId)
    let slots_booked = doctorData.slots_booked
    slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime )
    await doctorModel.findByIdAndUpdate(docId,{slots_booked})
    res.json({success: true, message: "Appointment Cancelled"})
  } catch (error) {
    console.log(error)
    res.json({success:false, message:error.message})
  }
}
  */

const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.userId;

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: "Appointment ID is required" });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // verify appointment user
    if (appointmentData.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized action" });
    }

    // cancel appointment
    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    // release doctor slot safely
    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);

    if (doctorData) {
      let slots_booked = doctorData.slots_booked || {};
      slots_booked[slotDate] = (slots_booked[slotDate] || []).filter(e => e !== slotTime);
      await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    }

    res.json({ success: true, message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


/* when we have keyid and keysecret then we will use it 
const razorpayInstance = new razorpay({
  key_id:process.env.RAZORPAY_KEY_ID,
  key_secret:process.env.RAZORPAY_KEY_SECRET
})
//API to pay online
 
const paymentRazorpay = async (req, res) => {
  try {
    const {appointmentId} = req.body
  const appointmentData = await appointmentModel.findById(appointmentId)

  if(!appointmentData || appointmentData.cancelled) {
    return res.json({success:false, message:"Appointment Cancelled or not found"})
  }

  //  creating options for razorpay payment
  const options = {
    amount : appointmentData.amount * 100 , 
    currecy: process.env.CURRENCY,
    receipt : appointmentId,
  }

  // creation of an order 
  const order = await razorpayInstance.orders.create(options)
  res.json({success:true, order})

  } catch (error) {
    console.log(error)
    res.json({success:false, message:error.message})
  }
  
}

*/


export {registerUser , loginUser , getProfile , updateProfile , bookAppointment , listAppointment , cancelAppointment ,/* paymentRazorpay */}






/*
const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime } = req.body;
    const userId = req.userId;

    if (!docId || !slotDate || !slotTime) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Find doctor
    const docData = await doctorModel.findById(docId);
    if (!docData) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    // ✅ Ensure slots_booked is always an Object (fixes old/bad data)
    if (
      typeof docData.slots_booked !== "object" ||
      docData.slots_booked === null ||
      Array.isArray(docData.slots_booked)
    ) {
      docData.slots_booked = {};
    }

    // ✅ Ensure date key exists
    if (!Array.isArray(docData.slots_booked[slotDate])) {
      docData.slots_booked[slotDate] = [];
    }

    // ✅ Prevent double booking
  if (docData.slots_booked[slotDate].includes(slotTime)) {
  return res.status(200).json({ success: false, message: "Slot already booked!" });
}


    // ✅ Add new slot
    docData.slots_booked[slotDate].push(slotTime);

    // ✅ Save doctor update
    await doctorModel.updateOne(
      { _id: docId },
      { $set: { slots_booked: docData.slots_booked } }
    );

    return res.status(200).json({ success: true, message: "Appointment booked successfully!" });

  } catch (err) {
    console.error("Book appointment error:", err.message);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};


*/





/*
//API to get user profile data

const getProfile = async(req, res) => {
    try {
      const {userId} = req.body
    const userData = await userModel.findById(userId).select('-password')  
    res.json({success:true, userData})    
} catch (error) {
       console.log(error)
    res.json({success:false, message:error.message})    
    }
}
       
// API to update user profile
const updateProfile = async (req, res) => {
    try {
      const {userId , name, phone,address, dob, gender} = req.body  
       const imageFile = req.file
       if(!name || !phone || !dob || !gender) {
        return res.json({success:false, message:"Data Missing"})
       }
       await userModel.findByIdAndUpdate(userId, {name, phone, address:JSON.parse(address), dob, gender})
        if(imageFile) {
            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type:'image'})
            const imageURL = imageUpload.secure_url
            await userModel.findByIdAndUpdate(userId, {image:imageURL})
        }

        res.json({success:true, message:"Profile Updated"})
    
    } catch (error) {
      console.log(error) 
        res.json({success:false, message:error.message})           
    }
        
}
    
*/
