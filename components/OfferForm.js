// components/OfferForm.jsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function OfferForm({ offerId }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    brandId: '',
    startDate: '',
    endDate: '',
    couponCode: '',
    discountPercent: '',
    active: true
  });
  
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  // Fetch available brands
  useEffect(() => {
    fetch('/api/admin/brands')
      .then(res => res.json())
      .then(data => setBrands(data.brands))
      .catch(err => console.error('Error fetching brands:', err));
  }, []);
  
  // Fetch existing offer data if editing
  useEffect(() => {
    if (offerId) {
      setLoading(true);
      fetch(`/api/admin/offers/${offerId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch offer');
          return res.json();
        })
        .then(data => {
          // Format dates for form inputs and handle data types
          const formattedData = {
            ...data.offer,
            startDate: data.offer.startDate ? format(new Date(data.offer.startDate), 'yyyy-MM-dd') : '',
            endDate: data.offer.endDate ? format(new Date(data.offer.endDate), 'yyyy-MM-dd') : '',
            brandId: data.offer.brandId || data.offer.brand?.id || '',
            discountPercent: data.offer.discountPercent?.toString() || '',
            active: Boolean(formData.active)
          };
          setFormData(formattedData);
        })
        .catch(err => {
          console.error('Error fetching offer:', err);
          setError('Failed to load offer data');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [offerId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation errors when field is updated
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Title validation (at least 3 characters)
    if (!formData.title || formData.title.length < 3) {
      errors.title = "Title must be at least 3 characters";
    }
    
    // Description validation (at least 10 characters)
    if (!formData.description || formData.description.length < 10) {
      errors.description = "Description must be at least 10 characters";
    }
    
    // Discount validation (minimum 1%)
    if (!formData.discountPercent || parseInt(formData.discountPercent) < 1) {
      errors.discountPercent = "Discount must be at least 1%";
    }
    
    // Other required fields
    if (!formData.brandId) errors.brandId = "Brand is required";
    if (!formData.startDate) errors.startDate = "Start date is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Clean and format data before sending to API
      const cleanedData = {
        title: formData.title,
        description: formData.description,
        brandId: formData.brandId,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        couponCode: formData.couponCode || null,
        // Convert discountPercent to integer or null
        discountPercent: formData.discountPercent ? parseInt(formData.discountPercent, 10) : null,
        active: Boolean(formData.active)
      };
      
      // Remove brand if it was included in formData
      if ('brand' in cleanedData) {
        delete cleanedData.brand;
      }
      
      // Remove id if creating a new offer
      if (!offerId && 'id' in cleanedData) {
        delete cleanedData.id;
      }
      
      // Remove createdAt and updatedAt if they exist
      if ('createdAt' in cleanedData) delete cleanedData.createdAt;
      if ('updatedAt' in cleanedData) delete cleanedData.updatedAt;
      
      const url = offerId 
        ? `/api/admin/offers/${offerId}` 
        : '/api/admin/offers';
      
      const method = offerId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save offer');
      }
      
      router.push('/admin/offers');
    } catch (error) {
      console.error("Submit error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && offerId) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="mt-4 text-blue-600 font-medium animate-pulse">Loading the Offer...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-lg border border-gray-100 my-4 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center mb-6">
        <div className="bg-blue-500 p-2 rounded-full text-white mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">{offerId ? 'Edit Offer' : 'Create New Offer'}</h1>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md border-l-4 border-red-500 animate-pulse">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="title">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full p-3 border ${formErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
            required
          />
          {formErrors.title && <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>}
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className={`w-full p-3 border ${formErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
            required
          />
          {formErrors.description && <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>}
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="brandId">
            Brand *
          </label>
          <div className="relative">
            <select
              id="brandId"
              name="brandId"
              value={formData.brandId}
              onChange={handleChange}
              className={`w-full p-3 border ${formErrors.brandId ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none pr-10`}
              required
            >
              <option value="">Select a brand</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          {formErrors.brandId && <p className="mt-1 text-sm text-red-500">{formErrors.brandId}</p>}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="startDate">
              Start Date *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`w-full p-3 pl-10 border ${formErrors.startDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                required
              />
            </div>
            {formErrors.startDate && <p className="mt-1 text-sm text-red-500">{formErrors.startDate}</p>}
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="endDate">
              End Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate || ''}
                onChange={handleChange}
                className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="couponCode">
              Coupon Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
              </div>
              <input
                type="text"
                id="couponCode"
                name="couponCode"
                value={formData.couponCode || ''}
                onChange={handleChange}
                className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="e.g. SUMMER2025"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="discountPercent">
              Discount Percentage *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <input
                type="number"
                id="discountPercent"
                name="discountPercent"
                value={formData.discountPercent || ''}
                onChange={handleChange}
                min="1"
                max="100"
                className={`w-full p-3 pl-10 border ${formErrors.discountPercent ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500">%</span>
              </div>
            </div>
            {formErrors.discountPercent && <p className="mt-1 text-sm text-red-500">{formErrors.discountPercent}</p>}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md transition-all duration-300 hover:bg-gray-100">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              {/* {console.log("active == ",formData.active)} */}
              <input
                type="checkbox"
                name="active"
                checked={!!formData.active}
                onChange={handleChange}
                className="sr-only"
              />
              <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${formData.active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${formData.active ? 'transform translate-x-6' : ''}`}></div>
            </div>
            <span className="ml-3 text-gray-700 font-medium">Active</span>
          </label>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
          <button
            type="button"
            onClick={() => router.push('/admin/offers')}
            className="px-6 py-3 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-300 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Cancel
          </button>
          <button
            type="submit"
            className={`px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                {offerId ? 'Update Offer' : 'Create Offer'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}