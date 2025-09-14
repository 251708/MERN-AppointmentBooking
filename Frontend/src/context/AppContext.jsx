import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import {toast} from 'react-toastify'

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = '$'
    const backendUrl = import.meta.env.VITE_BACKEND_URL
   
    const [doctors, setDoctors] = useState([])
    const [token , setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token') :false )
    const [userData, setUserData] = useState(false)

    



const getDoctorsData = async () => {
    try {
       const {data} = await axios.get(backendUrl + '/api/doctor/list') 
      if(data.success) {
        setDoctors(data.doctors)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
       console.log(error);
        toast.error(error.message)
    }
}

const loadUserProfileData = async () => {
    try {
       const {data} = await axios.get(backendUrl + '/api/user/get-profile' , {headers:{token}})
       if(data.success) {
        setUserData(data.userData)

       } else {
        toast.error(data.message || "Something went wrong")
       }
    } catch (error) {
        console.log(error)
        //toast.error(error.message)
         toast.error(error.response?.data?.message || error.message)
    }
}


const updateProfile = async (formData) => {
  try {
    const { data } = await axios.post(
      backendUrl + "/api/user/update-profile",
      formData,
      { headers: { token } }
    );

    if (data.success) {
      toast.success("Profile updated successfully!");
      setUserData(data.user); // update state with latest profile data
    } else {
      toast.error(data.message || "Failed to update profile");
    }
  } catch (error) {
    console.log(error);
    toast.error(error.response?.data?.message || error.message);
  }
};


const value = {
    doctors , getDoctorsData , backendUrl ,loadUserProfileData,
    updateProfile,currencySymbol,
    
     
    token, setToken, 
    
    userData, setUserData,
    
}


useEffect(() => {
    getDoctorsData()
}, [])

useEffect(() => {
    if(token) {
    loadUserProfileData()
    } else {
      setUserData(false)  
    }
}, [token])
    
return(
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider