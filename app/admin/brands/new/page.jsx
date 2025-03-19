// app/admin/brands/new/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { ArrowLeft, Upload, Building, MapPin, AlertCircle, X, Check } from 'lucide-react';

export default function CreateBrandPage() {
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    description: '',
    location: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // New state for file upload
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Check authentication status
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // New handler for logo file changes
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

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogoPreview = () => {
    setLogoPreview('');
    setLogoFile(null);
    setFormData(prev => ({ ...prev, logo: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First, upload the logo if a file was selected
      let logoUrl = formData.logo;
      
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
      
      // Prepare the updated brand data with the uploaded logo URL
      const brandData = {
        name: formData.name,
        description: formData.description,
        logo: logoUrl,
        location: formData.location,
      };

      // Send the brand data to create the brand
      const response = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brandData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create brand');
      }
      // console.log(data);
      
      // Redirect to the brand edit page
      const brandId = data.brand?.id || data.id;
      router.push(`/admin/brands/${brandId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // If still loading authentication status, show loading state
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-indigo-200 mb-3"></div>
          <div className="h-4 w-24 bg-indigo-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Building className="mr-2 h-6 w-6 text-indigo-600" />
          Create New Brand
        </h1>
        <Link 
          href="/admin/brands" 
          className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Brands
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm mb-6 animate-fadeIn flex items-start" role="alert">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span className="block">{error}</span>
          <button 
            onClick={() => setError('')} 
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 border border-gray-100 transition-all hover:shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Brand Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Enter brand name"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
              Logo
            </label>
            
            {/* Show logo preview if available */}
            {logoPreview ? (
              <div className="relative w-fit mb-4 transition-all duration-300 ease-in-out">
                <div className="group relative rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    width={120}
                    height={120}
                    className="object-contain bg-gray-50 p-2 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={clearLogoPreview}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove logo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className={`border-2 border-dashed rounded-lg p-6 mt-2 text-center transition-colors ${
                  isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  Drag and drop your logo image here, or
                  <label className="ml-1 cursor-pointer text-indigo-600 hover:text-indigo-500 font-medium">
                    browse
                    <input
                      id="logoFile"
                      name="logoFile"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="sr-only"
                    />
                  </label>
                </p>
                <p className="mt-1 text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
              </div>
            )}
            
            <div className="mt-2">
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                Or enter Logo URL directly
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  id="logo"
                  name="logo"
                  type="url"
                  value={formData.logo}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Either upload an image file or enter a direct URL to the brand's logo image
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Write a detailed description of the brand"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                className="w-full pl-10 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="e.g., New York, USA"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Create Brand
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}