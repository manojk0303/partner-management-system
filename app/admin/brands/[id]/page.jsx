'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Camera, 
  PlusCircle, 
  Save, 
  X, 
  ChevronLeft, 
  MapPin, 
  Pencil,
  Trash2,
  Upload,
  AlertCircle
} from 'lucide-react';

export default function AdminBrandEditPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const isNewBrand = id === 'new';
  
  const [brand, setBrand] = useState({
    name: '',
    description: '',
    logo: '',
    location: '',
  });
  
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(!isNewBrand);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form elements
  const [logoFile, setLogoFile] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [logoPreview, setLogoPreview] = useState('');
  
  useEffect(() => {
    async function fetchBrandDetails() {
      if (!id || isNewBrand) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // console.log(`Fetching brand with ID: ${id}`);
        const response = await fetch(`/api/admin/brands/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || errorData.details || `HTTP error ${response.status}`;
          throw new Error(`Failed to ${isNewBrand ? 'create' : 'update'} brand: ${errorMessage}`);
        }
        
        const data = await response.json();
        // console.log('Brand data received:', data);
        
        if (data.brand) {
          // If the API returns { brand: {...} }
          setBrand(data.brand);
          setImages(data.brand.images || []);
          if (data.brand.logo) {
            setLogoPreview(data.brand.logo);
          }
        } else {
          // If the API returns the brand object directly
          setBrand(data);
          setImages(data.images || []);
          if (data.logo) {
            setLogoPreview(data.logo);
          }
        }
      } catch (err) {
        console.error('Error fetching brand details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (!isNewBrand && id) {
      fetchBrandDetails();
    } else {
      setLoading(false);
    }
  }, [id, isNewBrand]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBrand(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(prev => [...prev, ...files]);
    
    // Create previews for the new images
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews(prev => [...prev, { file, preview: reader.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const clearLogoPreview = () => {
    setLogoPreview('');
    setLogoFile(null);
    setBrand(prev => ({ ...prev, logo: '' }));
  };

  const removeNewImage = (indexToRemove) => {
    // Remove the image from newImages and newImagePreviews
    setNewImages(prev => prev.filter((_, index) => index !== indexToRemove));
    setNewImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      // Upload logo if selected
      let logoUrl = brand.logo;
      
      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append('file', logoFile);
        
        const logoUploadResponse = await fetch('/api/admin/upload', {
          method: 'POST',
          body: logoFormData,
        });
        
        if (!logoUploadResponse.ok) {
          const errorData = await logoUploadResponse.json().catch(() => ({}));
          throw new Error(`Failed to upload logo: ${errorData.error || logoUploadResponse.status}`);
        }
        
        const logoData = await logoUploadResponse.json();
        logoUrl = logoData.url;
      }
      
      // Prepare brand data
      const brandData = {
        name: brand.name,
        description: brand.description,
        logo: logoUrl,
        location: brand.location,
      };
      
      // Save the brand
      const response = await fetch(
        isNewBrand ? '/api/admin/brands' : `/api/admin/brands/${id}`,
        {
          method: isNewBrand ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(brandData),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to ${isNewBrand ? 'create' : 'update'} brand: ${errorData.error || response.status}`);
      }
      
      const responseData = await response.json();
      const savedBrand = responseData.brand || responseData;
      
      // Handle additional images if any
      if (newImages.length > 0) {
        await Promise.all(
          newImages.map(async (file) => {
            // Upload each image to Firebase
            const imageFormData = new FormData();
            imageFormData.append('file', file);
            
            const imageUploadResponse = await fetch('/api/admin/upload', {
              method: 'POST',
              body: imageFormData,
            });
            
            if (!imageUploadResponse.ok) {
              throw new Error('Failed to upload image');
            }
            
            const imageData = await imageUploadResponse.json();
            
            // Associate the image with the brand
            return fetch(`/api/admin/brands/${savedBrand.id}/images`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                url: imageData.url,
                altText: `${savedBrand.name} image`,
              }),
            });
          })
        );
      }
      
      setSuccess(true);
      
      // Redirect to the brands list after a short delay
      setTimeout(() => {
        router.push('/admin/brands');
      }, 1500);
      
    } catch (err) {
      console.error('Error saving brand:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      const response = await fetch(`/api/admin/images/${imageId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete image');
      }
      
      // Remove the deleted image from the state
      setImages(images.filter(img => img.id !== imageId));
    } catch (err) {
      console.error('Error deleting image:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-blue-600 font-medium animate-pulse">
            Loading Brand Details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-height-100vh bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <Link href="/admin/brands">
          <button className="flex items-center mr-4 text-blue-600 hover:text-blue-800 transition-colors duration-200">
            <ChevronLeft size={20} />
            <span className="ml-1">Back</span>
          </button>
        </Link>
        <div className="flex flex-wrap items-center mt-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {isNewBrand ? 'Add New Brand' : 'Edit Brand'}
          </h1>
          {!isNewBrand && (
            <span className="ml-auto lm:mt-6 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              ID: {id}
            </span>
          )}
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm animate-fadeIn flex items-start">
            <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-1" />
            <div>
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md shadow-sm animate-fadeIn">
            <p className="font-bold">Success!</p>
            <p>Brand successfully {isNewBrand ? 'created' : 'updated'}! Redirecting...</p>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6 md:col-span-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    name="name"
                    value={brand.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter brand name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      value={brand.location || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 transition-all hover:border-blue-400">
                    {logoPreview ? (
                      <div className="relative group">
                        <Image
                          src={logoPreview}
                          alt="Logo preview"
                          width={100}
                          height={100}
                          className="object-contain"
                        />
                        <button
                          type="button"
                          onClick={clearLogoPreview}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove logo"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center cursor-pointer h-24">
                        <Upload size={24} className="text-gray-400 mb-2" />
                        <span className="text-sm text-center text-gray-500">Upload Logo</span>
                        <span className="text-xs text-gray-400 mt-1">Click to browse</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-6 md:col-span-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={brand.description}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    rows="5"
                    placeholder="Describe the brand..."
                    required
                  />
                </div>
                
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <PlusCircle size={16} className="mr-1" />
                    Additional Images
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 transition-all hover:border-blue-400 bg-gray-50">
                    {newImagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                        {newImagePreviews.map((image, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square relative rounded-lg overflow-hidden">
                              <Image
                                src={image.preview}
                                alt={`New image ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                              aria-label="Remove image"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <label className="flex flex-col items-center justify-center cursor-pointer h-24">
                      <Upload size={24} className="text-gray-400 mb-2" />
                      <span className="text-sm text-center text-gray-500">
                        {newImages.length > 0 
                          ? `${newImages.length} image${newImages.length > 1 ? 's' : ''} selected` 
                          : 'Upload Images'}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">Click to browse</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleAdditionalImagesChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            {images.length > 0 && (
              <div className="mt-8 animate-fadeIn">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                  <Camera size={16} className="mr-1" />
                  Current Images ({images.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map(image => (
                    <div key={image.id} className="group relative border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="aspect-square relative">
                        <Image
                          src={image.url}
                          alt={image.altText || 'Brand image'}
                          fill
                          className="object-cover p-2"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(image.id)}
                        className="absolute bottom-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label="Delete image"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className={`flex-1 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Save Brand
                  </>
                )}
              </button>
              
              <Link href="/admin/brands" className="flex-1">
                <button 
                  type="button" 
                  className="w-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-medium transition-all duration-200"
                >
                  <X size={18} className="mr-2" />
                  Cancel
                </button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}