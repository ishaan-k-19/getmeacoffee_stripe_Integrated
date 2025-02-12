import React, { useEffect, useState } from 'react';
import { Upload, Github, Youtube, ImageIcon } from 'lucide-react';
import Modal from './Moadal';
import { useRouter } from 'next/navigation';
import { Bounce, toast } from 'react-toastify';


const SocialUploadFAB = ({ username, refetchData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [formData, setFormData] = useState({
    file: null,
    description: '',
    youtubeLink: '',
    projectName: '',
    githubDescription: '',
    githubRepo: '',
    previewUrl: null
  });

  const router = useRouter()

  useEffect(() => {
    return () => {
      if (formData.previewUrl) {
        URL.revokeObjectURL(formData.previewUrl);
      }
    };
  }, [formData.previewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (formData.previewUrl) {
        URL.revokeObjectURL(formData.previewUrl);
      }
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, file, previewUrl }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (type, e) => {
    e.preventDefault();
    try {
      let workShowcaseItem = {};
  
      if (type === 'image') {
        const fileUrl = await uploadToCloudinary(formData.file);
  
        if (!fileUrl) {
          throw new Error('Failed to upload file to Cloudinary');
        }
  
        workShowcaseItem = {
          type: formData.file.type.startsWith('video/') ? 'video' : 'photo',
          projectName: "",
          url: fileUrl,
          description: formData.description,
        };
      } else if (type === 'youtube') {
        workShowcaseItem = {
          type: 'youtube',
          projectName: "",
          url: formData.youtubeLink,
          description: '',
        };
      } else if (type === 'github') {
        workShowcaseItem = {
          type: 'github',
          projectName: formData.projectName,
          url: formData.githubRepo,
          description: formData.githubDescription,
        };
      }

  
      const updateResponse = await fetch('/api/user/update-showcase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          workShowcaseItem,
        }),
      });
  
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to update user');
      }
  
      const responseData = await updateResponse.json();
      console.log(responseData)
  
      resetForm();
      setActiveModal(null);
  

      if (refetchData && typeof refetchData === 'function') {
        await refetchData();
      } else {

        router.refresh();
      }
    } catch (error) {
      console.error('Error uploading content:', error);
    }
  };

  const resetForm = () => {
    if (formData.previewUrl) {
      URL.revokeObjectURL(formData.previewUrl);
    }
    setFormData({
      file: null,
      description: '',
      youtubeLink: '',
      projectName: '',
      githubDescription: '',
      githubRepo: '',
      previewUrl: null
    });
  };
  

  const modalContents = {
    image: {
      header: (
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Upload Media
        </h3>
      ),
      body: (
        <form className="space-y-4" onSubmit={(e) => handleSubmit('image', e)}>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Upload File
            </label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
            </div>
          </div>
          
          {/* Preview Section */}
          {formData.file && (
            <div className="mt-4">
              {formData.file.type.startsWith('image/') ? (
                <img 
                  src={formData.previewUrl} 
                  alt="Preview" 
                  className="max-h-48 mx-auto rounded-lg"
                />
              ) : (
                <video 
                  controls 
                  className="max-h-48 mx-auto rounded-lg"
                >
                  <source src={formData.previewUrl} type={formData.file.type} />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              placeholder="Add a description..."
            />
          </div>
          <button
            type="submit"
            className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Upload
          </button>
        </form>
      )
    },

    youtube: {
      header: (
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Add YouTube Video
        </h3>
      ),
      body: (
        <form className="space-y-4" onSubmit={(e) => handleSubmit('youtube', e)}>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              YouTube Link
            </label>
            <input
              type="url"
              name="youtubeLink"
              value={formData.youtubeLink}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
          <button
            type="submit"
            className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Add Video
          </button>
        </form>
      )
    },
    github: {
      header: (
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Add GitHub Project
        </h3>
      ),
      body: (
        <form className="space-y-4" onSubmit={(e) => handleSubmit('github', e)}>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Project Name
            </label>
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              placeholder="My Awesome Project"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Project Description
            </label>
            <textarea
              name="githubDescription"
              value={formData.githubDescription}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              placeholder="Add a description..."
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Repository Link
            </label>
            <input
              type="url"
              name="githubRepo"
              value={formData.githubRepo}
              onChange={handleInputChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              placeholder="https://github.com/username/repo"
            />
          </div>
          <button
            type="submit"
            className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Add Project
          </button>
        </form>
      )
    }
  };

  const socialButtons = [
    {
      icon: <Github className="w-5 h-5" />,
      label: 'Github',
      onClick: () => setActiveModal('github')
    },
    {
      icon: <Youtube className="w-5 h-5" />,
      label: 'Youtube',
      onClick: () => setActiveModal('youtube')
    },
    {
      icon: <ImageIcon className="w-5 h-5" />,
      label: 'Image',
      onClick: () => setActiveModal('image')
    }
  ];

  return (
    <>
      <div className="fixed end-6 bottom-8 group">
        <div className={`flex flex-col items-center mb-4 space-y-2 ${isOpen ? 'block' : 'hidden'}`}>
          {socialButtons.map((button, index) => (
            <div key={index} className="relative">
              <button
                type="button"
                onClick={button.onClick}
                className="flex justify-center items-center w-[52px] h-[52px] text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-200 dark:border-gray-600 shadow-sm dark:hover:text-white dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 focus:outline-none dark:focus:ring-gray-400"
              >
                {button.icon}
                <span className="sr-only">{button.label}</span>
              </button>
              <div className="absolute end-full me-2 top-1/2 -translate-y-1/2">
                <div className="whitespace-nowrap px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:bg-gray-700">
                  {button.label}
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center text-white bg-blue-700 rounded-full w-14 h-14 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800"
        >
          <Upload />
          <span className="sr-only">Open actions menu</span>
        </button>
      </div>

      {activeModal && (
        <Modal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          headerContent={modalContents[activeModal].header}
          bodyContent={modalContents[activeModal].body}
        />
      )}
    </>
  );
};

export default SocialUploadFAB;