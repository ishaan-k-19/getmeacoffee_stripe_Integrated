"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { fetchuser, updateProfile } from "@/actions/useractions";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import SocialUploadFAB from "@/components/SocialUploadFAB";
import Gallery from "@/components/Gallery";

const Dashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({});
  const [profilePic, setProfilePic] = useState(null);
  const [coverPic, setCoverPic] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false); 
  const [dataFetched, setDataFetched] = useState(false); 

  useEffect(() => {
    document.title = "Dashboard - Get Me A Coffee";
    if (!session) {
      router.push('/login');
    } else {
      getData();
    }
  }, [router, session]);

  const getData = async () => {
    try {
      const u = await fetchuser(session?.user?.email);
      if (!u) {
        throw new Error('No user data received');
      }
      setForm(u);
      setDataFetched(true);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error('Failed to fetch user data', { theme: "dark", transition: Bounce });
    }
  };

  const refetchData = async () => {
    setDataFetched(false); 
    await getData(); 
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
      setForm({ ...form, profilepic: file });
    }
  };

  const handleCoverPicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPic(URL.createObjectURL(file));
      setForm({ ...form, coverpic: file });
    }
  };

  const uploadToCloudinary = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || "getMeAcoffee");
    formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dgeaqllzr");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dgeaqllzr/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Cloudinary upload failed");
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Error uploading:", error);
      toast.error('Failed to upload image', { theme: "dark", transition: Bounce });
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Get current form values
      const formElements = e.target.elements;
      const updatedForm = {
        name: formElements.name.value,
        email: formElements.email.value,
        username: formElements.username.value,
        stripeid: formElements.stripeid.value,
        stripesecret: formElements.stripesecret.value,
        profilepic: form.profilepic,
        coverpic: form.coverpic,
        ...form
      };
  
      // Handle profile picture upload if changed
      if (form.profilepic instanceof File) {
        const profilePicUrl = await uploadToCloudinary(form.profilepic);
        if (!profilePicUrl) {
          toast.error('Failed to upload profile picture', { theme: "dark", transition: Bounce });
          setLoading(false);
          return;
        }
        updatedForm.profilepic = profilePicUrl;
      }
  
      // Handle cover picture upload if changed
      if (form.coverpic instanceof File) {
        const coverPicUrl = await uploadToCloudinary(form.coverpic);
        if (!coverPicUrl) {
          toast.error('Failed to upload cover picture', { theme: "dark", transition: Bounce });
          setLoading(false);
          return;
        }
        updatedForm.coverpic = coverPicUrl;
      }
  
      // Update profile
      const result = await updateProfile(updatedForm, session.user.name);
  
      if (result.error) {
        toast.error(result.error, { theme: "dark", transition: Bounce });
      } else {
        // Update local state with the complete updated form data
        setForm(updatedForm);
        
        // Clear temporary file states
        setProfilePic(null);
        setCoverPic(null);
  
        // Show success message
        toast.success('Profile updated!', { theme: "dark", transition: Bounce });
        
        // Ensure backend has processed the update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Refetch fresh data
        await getData();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error('An error occurred while updating the profile.', { theme: "dark", transition: Bounce });
    } finally {
      setLoading(false);
    }
  };

  if (!dataFetched) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="container mx-auto py-5 px-6">
        <h1 className="text-3xl font-bold text-center my-8">Welcome to your Dashboard</h1>

        {/* Tabs for Profile and WorkShop */}
        <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
          <ul className="flex -mb-px justify-center">
            <li className="me-2 w-full">
              <button
                onClick={() => setActiveTab('profile')}
                className={`inline-block p-4 border-b-2 rounded-t-lg w-full ${
                  activeTab === 'profile'
                    ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                aria-current={activeTab === 'profile' ? 'page' : undefined}
              >
                Profile
              </button>
            </li>
            <li className="me-2 w-full">
              <button
                onClick={() => setActiveTab('workspace')}
                className={`inline-block p-4 border-b-2 rounded-t-lg w-full ${
                  activeTab === 'workspace'
                    ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
              >
                WorkShop
              </button>
            </li>
          </ul>
        </div>

        {/* Profile Tab Content */}
        {activeTab === 'profile' && (
          <form className="max-w-2xl mx-auto mt-8 mb-5" onSubmit={handleSubmit}>
            {/* Profile Picture Section */}
            <div className="mb-5">
              <div className="flex items-center justify-center">
                <div className="relative w-36 h-36 rounded-full overflow-hidden group">
                  <img
                    src={profilePic || form?.profilepic || "/default-profile.png"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
                      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                      <path d="m15 5 4 4" />
                    </svg>
                  </div>
                  <input
                    type="file"
                    id="profilepic"
                    name="profilepic"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleProfilePicChange}
                  />
                </div>
              </div>
            </div>

            {/* Cover Picture Section */}
            <div className="mb-5">
              <label
                htmlFor="coverpic"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Cover Picture
              </label>
              <div className="relative w-full h-40 rounded-lg overflow-hidden group">
                <img
                  src={coverPic || form?.coverpic || "/default-cover.jpg"}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
                    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                    <path d="m15 5 4 4" />
                  </svg>
                </div>
                <input
                  type="file"
                  id="coverpic"
                  name="coverpic"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleCoverPicChange}
                />
              </div>
            </div>

            {/* Other Form Fields */}
            <div className="mb-5">
              <label
                htmlFor="name"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Name
              </label>
              <input
                onChange={handleChange}
                type="text"
                id="name"
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                placeholder=""
                value={form?.name ? form?.name : ""}
                name="name"
                required
              />
            </div>
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Email
              </label>
              <input
                onChange={handleChange}
                type="email"
                id="email"
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                placeholder=""
                value={form?.email ? form?.email : ""}
                name="email"
                required
                readOnly
              />
            </div>
            <div className="mb-5">
              <label
                htmlFor="username"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Username
              </label>
              <input
                onChange={handleChange}
                type="text"
                id="username"
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                placeholder=""
                value={form?.username ? form?.username : ""}
                name="username"
                required
              />
            </div>
            <div className="mb-5">
              <label
                htmlFor="stripekey"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Stripe Publishable Key
              </label>
              <input
                onChange={handleChange}
                type="text"
                id="stripeid"
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                placeholder=""
                value={form?.stripeid ? form?.stripeid : ""}
                name="stripeid"
                required
              />
            </div>
            <div className="mb-5">
              <label
                htmlFor="stripesecret"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Stripe Secret Key
              </label>
              <input
                onChange={handleChange}
                type="password"
                id="stripesecret"
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                placeholder=""
                value={form?.stripesecret ? form?.stripesecret : ""}
                name="stripesecret"
                required
              />
            </div>
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 w-full"
              disabled={loading} // Disable button while loading
            >
              {loading ? (
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </div>
              ) : (
                "Save"
              )}
            </button>
          </form>
        )}

        {/* WorkShop Tab Content */}
        {activeTab === 'workspace' && (
          <div className="max-w-6xl mx-auto mt-8">
            <h2 className="text-2xl font-bold mb-4">WorkShop</h2>
            <Gallery data={form} deletePost={true} userId={form?._id} refetchData={refetchData}/>
          </div>
        )}
        <SocialUploadFAB username={form?.username} refetchData={refetchData}/>
      </div>
    </>
  );
};

export default Dashboard;