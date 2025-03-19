// app/admin/brands/[id]/images/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function BrandImagesPage({ params }) {
  const brandId = params.id;
  const [brand, setBrand] = useState(null);
  const [images, setImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const router = useRouter();

  // Fetch brand and images data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        // Fetch brand details
        const brandResponse = await fetch(`/api/admin/brands/${brandId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!brandResponse.ok) {
          throw new Error('Failed to fetch brand details');
        }

        const brandData = await brandResponse.json();
        setBrand(brandData);

        // Images are included in the brand response
        setImages(brandData.images || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [brandId, router]);

  // Handle adding a new image
  const handleAddImage = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/admin/brands/${brandId}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          url: newImageUrl,
          altText: newImageAlt || `Image for ${brand?.name || 'brand'}`
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add image');
      }

      // Add the new image to the list
      setImages([...images, data]);
      
      // Clear form
      setNewImageUrl('');
      setNewImageAlt('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle deleting an image
  const handleDeleteImage = async (imageId) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/admin/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete image');
      }

      // Remove the deleted image from the list
      setImages(images.filter(img => img.id !== imageId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Manage Images for {brand?.name || 'Brand'}
        </h1>
        <div className="space-x-2">
          <Link 
            href={`/admin/brands/${brandId}`} 
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Back to Brand
          </Link>
          <Link 
            href="/admin/brands" 
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            All Brands
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Add new image form */}
      <div className="bg-white shadow-md rounded p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Image</h2>
        <form onSubmit={handleAddImage}>
          <div className="mb-4">
            <label htmlFor="newImageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Image URL *
            </label>
            <input
              id="newImageUrl"
              type="url"
              required
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="newImageAlt" className="block text-sm font-medium text-gray-700 mb-1">
              Alt Text (Optional)
            </label>
            <input
              id="newImageAlt"
              type="text"
              value={newImageAlt}
              onChange={(e) => setNewImageAlt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Descriptive text for image"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {submitLoading ? 'Adding...' : 'Add Image'}
            </button>
          </div>
        </form>
      </div>

      {/* Images list */}
      <div className="bg-white shadow-md rounded p-6">
        <h2 className="text-xl font-semibold mb-4">Brand Images</h2>
        
        {images.length === 0 ? (
          <p className="text-gray-500">No images added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.map(image => (
              <div key={image.id} className="border rounded p-4">
                <div className="relative aspect-video mb-2">
                  <Image 
                    src={image.url} 
                    alt={image.altText || brand?.name || 'Brand image'} 
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <p className="text-sm text-gray-600 truncate" title={image.altText}>
                  {image.altText || 'No alt text'}
                </p>
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => handleDeleteImage(image.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}