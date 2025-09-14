/*

import { useState } from "react";
import { createContext } from "react";
import axios from 'axios'
import {toast} from 'react-toastify'


export const DoctorContext = createContext()

const DoctorContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [dToken, setDToken] = useState(localStorage.getItem('dToken') ? localStorage.getItem('dToken'): '')
    const[appointments, setAppointments] = useState([])
    
    /*
    const getAppointments = async() => {
        try {
            const {data} = /* await axios.get(backendUrl + '/api/doctor/appointments' , {headers:{dToken}})*
            await axios.get(`${backendUrl}/api/doctor/appointments`, {
  headers: {
    Authorization: `Bearer ${dToken}`
  }
});


            if(data.success) {
                setAppointments(data.appointments.reverse())
                console.log(data.appointments.reverse())
            }else {
                   toast.error(data.message)
            }
        } catch (error) {
           console.log(error)
           toast.error(error.message) 
        }
    }
    
********************

    const getAppointments = async () => {
  try {
    const res = await axios.get(`${backendUrl}/api/doctor/appointments`, {
      headers: { Authorization: `Bearer ${dToken}` }
    });

    if (res.data.success) {
      setAppointments(res.data.appointments);
      console.log(res.data.appointments)
    } else {
      toast.error(res.data.message);
    }
  } catch (error) {
    console.log(error);
    toast.error("Failed to fetch appointments");
  }
};



const completeAppointment = async () => {
  try {
    const {data} = await axios.post(backendUrl + '/api/doctor/complete-appointment' , {appointmentId} , {headers:{dToken}})
    if(data.success) {
      toast.success(data.message)
      getAppointments()
    } else{
      toast.error(data.message)
    }
  } catch (error) {
   console.log(error);
    toast.error("Failed to fetch appointments"); 
  }
}

/*
const cancelAppointment = async () => {
  try {
    const {data} = await axios.post(backendUrl + '/api/doctor/cancel-appointment' , {appointmentId} , {headers:{dToken}})
    if(data.success) {
      toast.success(data.message)
      getAppointments()
    } else{
      toast.error(data.message)
    }
  } catch (error) {
   console.log(error);
    toast.error("Failed to fetch appointments"); 
  }
}
  
**********************

 const cancelAppointment = async (appointmentId) => {
        try {
           const {data} = await axios.post(backendUrl + '/api/admin/cancel-appointment' , {appointmentId} ,/* {headers: {dToken}} * { headers: { Authorization: `Bearer ${dToken}` } }
) 
        if(data.success){
            toast.success(data.message)
            getAppointments()
        } else{
            toast.error(data.message)
        }
        } catch (error) {
           toast.error(error.message) 
        }
    }

    const value = {
          dToken, setDToken,
          backendUrl , appointments, setAppointments,
          getAppointments , completeAppointment, cancelAppointment
    }

    return (
        <DoctorContext.Provider   value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}

export default DoctorContextProvider


*/

import { useState, createContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Doctor token
  //const [dToken, setDToken] = useState(localStorage.getItem("dToken") || "");
  const [dToken, setDToken] = useState(localStorage.getItem("dToken") ? localStorage.getItem('dToken'): '');


  //Doctor appointments
  const [appointments, setAppointments] = useState([]);
const[dashData,setDashData] = useState(false)
const[profileData,setProfileData] = useState(false)
  // Get appointments
  const getAppointments = async () => {
    if (!dToken) return; // if not logged in
    try {
      const res = await axios.get(`${backendUrl}/api/doctor/appointments`, {
        headers: { Authorization: `Bearer ${dToken}` },
      });

      if (res.data.success) {
        setAppointments(res.data.appointments.reverse());
        console.log(res.data.appointments);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to fetch appointments");
    }
  };

  // Complete appointment
  const completeAppointment = async (appointmentId) => {
    if (!dToken) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/complete-appointment`,
        { appointmentId },
        { headers: { Authorization: `Bearer ${dToken}` } }
      );

      if (data.success) {
        toast.success(data.message);
        getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to complete appointment");
    }
  };

  // Cancel appointment
  const cancelAppointment = async (appointmentId) => {
    if (!dToken) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/cancel-appointment`,
        { appointmentId },
        { headers: { Authorization: `Bearer ${dToken}` } }
      );

      if (data.success) {
        toast.success(data.message);
        getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to cancel appointment");
    }
  };
  

  /* Doctor logout
  const logoutDoctor = () => {
    localStorage.removeItem("dToken");
    setDToken("");
    setAppointments([]);
    toast.success("Logged out successfully");
  };
*/

const getDashData = async () => {
  
  try {
    const {data} = await axios.get(
       `${backendUrl}/api/doctor/dashboard`,
        { headers: { Authorization: `Bearer ${dToken}` } }
    )
    if(data.success) {
      setDashData(data.dashData)
      console.log(data.dashData)
    } else {
      toast.error(data.message)
    }
  } catch (error) {
    console.log(error);
      toast.error(error.response?.data?.message || "Failed to cancel appointment");
  }
}

/*
const getProfileData = async () => {
  try {
    const {data} = await axios.get( `${backendUrl}/api/doctor/profile`,
        { headers: { Authorization: `Bearer ${dToken}` } } )
      if(data.success) {
        setProfileData(data.profileData)
        console.log(data.profileData)
      }
      }catch (error) {
   console.log(error);
      toast.error(error.response?.data?.message || "Failed to cancel appointment"); 
  }
}

*/

const getProfileData = async () => {
  try {
    const { data } = await axios.get(`${backendUrl}/api/doctor/profile`, {
      headers: { Authorization: `Bearer ${dToken}` },
    });

    if (data.success) {
      // adjust depending on backend response
      const profile = data.profileData || data.doctor || null;
      setProfileData(profile);
      console.log("Profile from API:", profile);
    }
  } catch (error) {
    console.error(error);
    toast.error(
      error.response?.data?.message || "Failed to fetch profile"
    );
  }
};


  const value = {
    dToken,
    setDToken,
    backendUrl,
    appointments,
    setAppointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
    dashData,setDashData,getDashData,
    profileData,setProfileData ,getProfileData
    
   // logoutDoctor,
  };

  return <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>;
};

export default DoctorContextProvider;
