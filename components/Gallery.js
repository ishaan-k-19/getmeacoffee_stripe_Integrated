import React, { useState, useEffect } from 'react';
import { Github, Play, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Gallery = ({ data: initialData, deletePost, userId, refetchData }) => {
  const [mounted, setMounted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [data, setData] = useState(initialData);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const transformedData = {
    workShowcase: data.workShowcase.map(item => ({
      ...item,
      id: item._id.toString(),
      _id: undefined,
    })),
  };

  const availableCategories = [
    ...new Set(
      transformedData.workShowcase
        .map((item) => {
          switch (item.type) {
            case 'photo':
            case 'video':
              return 'photos';
            case 'youtube':
              return 'youtube';
            case 'github':
              return 'github';
            default:
              return null;
          }
        })
        .filter(Boolean)
    ),
  ];

  const [activeCategory, setActiveCategory] = useState(availableCategories[0]);
  const [selectedItem, setSelectedItem] = useState(null);

  const categoryNames = {
    photos: 'Photos/Videos',
    youtube: 'YouTube',
    github: 'GitHub',
  };

  const handleDelete = async (postId) => {
    if (!mounted || !userId) return;

    setIsDeleting(true);
    const toastId = toast.loading('Deleting post...');

    try {
      const response = await fetch(`/api/user/${userId}/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete post');
      }

      toast.update(toastId, {
        render: 'Post deleted successfully',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });

      if (refetchData && typeof refetchData === 'function') {
        const newData = await refetchData();
        setData(newData);
      } else {
        router.refresh();
      }

    } catch (error) {
      toast.update(toastId, {
        render: error.message || 'Error deleting post',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
      console.error('Error deleting post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const content = transformedData.workShowcase
    .map((item) => {
      switch (item.type) {
        case 'photo':
        case 'video':
          return {
            id: item.id,
            type: 'photos',
            mediaType: item.type === 'photo' ? 'image' : 'video',
            url: item.url,
            description: item.description,
            alt: item.description || 'Gallery media',
          };
        case 'youtube':
          const videoId = item.url.split('v=')[1];
          return {
            id: item.id,
            type: 'youtube',
            videoId: videoId,
            description: item.description,
          };
        case 'github':
          return {
            id: item.id,
            type: 'github',
            projectName: item.description,
            description: item.description,
            repoUrl: item.url,
          };
        default:
          return null;
      }
    })
    .filter(Boolean);

  const renderContent = (item) => {
    switch (item.type) {
      case 'photos':
        if (item.mediaType === 'image') {
          return (
            <div className="relative">
              <img
                src={item.url}
                alt={item.alt}
                className="h-full max-h-[35vh] w-full object-cover rounded-lg cursor-pointer"
                onClick={() => setSelectedItem(item)}
              />
              {deletePost && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                  title="Delete"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        } else {
          return (
            <div className="relative">
              <div
                className="relative cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <video
                  src={item.url}
                  className="h-full max-h-[35vh] w-full object-cover rounded-md"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <Play className="w-12 h-12 text-white" />
                </div>
              </div>
              {deletePost && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                  title="Delete"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        }

      case 'youtube':
        return (
          <div className="relative">
            <iframe
              src={`https://www.youtube.com/embed/${item.videoId}`}
              className="w-full aspect-video rounded-lg"
              allowFullScreen
            />
            {deletePost && (
              <button
                onClick={() => handleDelete(item.id)}
                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                title="Delete"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        );

      case 'github':
        return (
          <div className="relative">
            <a
              href={item.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full p-6 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <div className="flex gap-2 mb-5 min-h-40">
                <Github className="w-6 h-6" />
                <h3 className="text-lg font-semibold">{item.projectName}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
            </a>
            {deletePost && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id);
                }}
                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                title="Delete"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        );
    }
  };

  const filteredContent = content.filter((item) => item.type === activeCategory);

  // If there's no content at all, show the "Nothing to show" message
  if (transformedData.workShowcase.length === 0) {
    return (
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-500 dark:text-gray-400 text-lg">Nothing to show</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <ToastContainer />
      {availableCategories.length > 1 && (
        <div className="relative">
          <div className="overflow-x-auto py-8 flex no-scrollbar">
            <div className="flex gap-4 min-w-min">
              {availableCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-5 py-2.5 rounded-full whitespace-nowrap ${
                    activeCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  {categoryNames[category]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredContent.length > 0 ? (
          filteredContent.map((item) => (
            <div key={item.id}>
              {renderContent(item)}
            </div>
          ))
        ) : (
          <div className="col-span-3 flex items-center justify-center h-48">
            <p className="text-gray-500 dark:text-gray-400 text-lg">Nothing to show in this category</p>
          </div>
        )}
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg max-w-sm w-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem.mediaType === 'video' ? (
              <video
                src={selectedItem.url}
                controls
                autoPlay={false}
                className="w-full rounded-lg max-h-[80vh] object-cover"
              />
            ) : (
              <img
                src={selectedItem.url}
                alt={selectedItem.alt}
                className="w-full rounded-lg max-h-[80vh] object-cover"
              />
            )}
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              {selectedItem.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;