// app/admin/brands/[id]/offers/[offerId]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Tag, Percent, CheckCircle, ArrowLeft, Info, Save, Trash2, AlertTriangle } from 'lucide-react';

export default function EditOfferPage({ params }) {
  const { id: brandId, offerId } = params;
  const [brand, setBrand] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    couponCode: '',
    discountPercent: '',
    active: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  // Format date to YYYY-MM-DD for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Fetch offer and brand data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          router.push('/admin/login');
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

        // Fetch offer details
        const offerResponse = await fetch(`/api/admin/offers/${offerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!offerResponse.ok) {
          throw new Error('Failed to fetch offer details');
        }

        const offerData = await offerResponse.json();
        
        // Format dates for input fields
        setFormData({
          ...offerData,
          startDate: formatDateForInput(offerData.startDate),
          endDate: formatDateForInput(offerData.endDate),
          discountPercent: offerData.discountPercent?.toString() || ''
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [brandId, offerId, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      // Convert discount to number
      const offerData = {
        ...formData,
        discountPercent: formData.discountPercent ? parseInt(formData.discountPercent, 10) : null
      };

      const response = await fetch(`/api/admin/offers/${offerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(offerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update offer');
      }

      // Show success message
      setSuccess('Offer updated successfully');
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/offers/${offerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete offer');
      }

      // Redirect to the offers listing page
      router.push(`/admin/brands/${brandId}/offers`);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          <p className="mt-4 text-indigo-600 font-medium animate-pulse">Loading Offer Details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 mb-16">
      <div className="mb-8">
        <nav className="flex items-center text-sm text-gray-500 mb-4 overflow-x-auto" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li><Link href="/admin/brands" className="hover:text-indigo-600 transition-colors">Brands</Link></li>
            <li>/</li>
            <li><Link href={`/admin/brands/${brandId}`} className="hover:text-indigo-600 transition-colors">{brand?.name || 'Brand'}</Link></li>
            <li>/</li>
            <li><Link href={`/admin/brands/${brandId}/offers`} className="hover:text-indigo-600 transition-colors">Offers</Link></li>
            <li>/</li>
            <li className="text-indigo-600 font-medium">Edit</li>
          </ol>
        </nav>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
            <span className="bg-indigo-100 text-indigo-800 p-2 rounded-full mr-3 hidden sm:block">
              <Tag size={20} />
            </span>
            Edit Offer
            <span className="ml-2 text-lg text-indigo-600 font-normal">
              for {brand?.name || 'Brand'}
            </span>
          </h1>
          <div className="flex space-x-2 w-full sm:w-auto">
            <Link 
              href={`/admin/brands/${brandId}/offers`} 
              className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex-1 sm:flex-none"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Offers
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 animate-fade-in shadow-sm" role="alert">
          <div className="flex items-center">
            <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6 animate-fade-in shadow-sm" role="alert">
          <div className="flex items-center">
            <CheckCircle size={20} className="mr-2 flex-shrink-0" />
            <span>{success}</span>
          </div>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Offer Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Calendar size={18} />
                </div>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Calendar size={18} />
                </div>
                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <Info size={14} className="mr-1" />
                Leave empty for offers without an expiration date
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="couponCode" className="block text-sm font-medium text-gray-700 mb-1">
                Coupon Code <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Tag size={18} />
                </div>
                <input
                  id="couponCode"
                  name="couponCode"
                  type="text"
                  value={formData.couponCode}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all uppercase"
                />
              </div>
            </div>

            <div>
              <label htmlFor="discountPercent" className="block text-sm font-medium text-gray-700 mb-1">
                Discount Percentage <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Percent size={18} />
                </div>
                <input
                  id="discountPercent"
                  name="discountPercent"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discountPercent}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center bg-gray-50 p-4 rounded-lg">
            <input
              id="active"
              name="active"
              type="checkbox"
              checked={formData.active}
              onChange={handleChange}
              className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <div className="ml-3">
              <label htmlFor="active" className="text-sm font-medium text-gray-700 flex items-center">
                <CheckCircle size={18} className="mr-2 text-green-500" />
                Active (Visible to customers)
              </label>
              <p className="text-xs text-gray-500 mt-1">Offer will be immediately visible to customers when active</p>
            </div>
          </div>

          {showDeleteConfirm ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="flex items-center mb-4 sm:mb-0">
                  <AlertTriangle size={20} className="text-red-500 mr-2" />
                  <p className="text-red-700 font-medium">Are you sure you want to delete this offer?</p>
                </div>
                <div className="flex space-x-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300 transition-colors flex items-center justify-center"
                  >
                    {deleteLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} className="mr-2" />
                        Confirm Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="order-2 sm:order-1 w-full sm:w-auto px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center"
              >
                <Trash2 size={16} className="mr-2" />
                Delete Offer
              </button>
              
              <button
                type="submit"
                disabled={submitLoading}
                className="order-1 sm:order-2 w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors flex items-center justify-center shadow-sm"
              >
                {submitLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
      
      {/* Floating action button for mobile */}
      <div className="fixed bottom-6 right-6 sm:hidden">
        <button
          type="submit"
          form="offer-form"
          disabled={submitLoading}
          className="w-14 h-14 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors flex items-center justify-center shadow-lg"
        >
          <Save size={24} />
        </button>
      </div>
      
      {/* Status badge */}
      <div className="fixed top-4 right-4 z-10">
        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${formData.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          <span className={`w-2 h-2 rounded-full mr-2 ${formData.active ? 'bg-green-500' : 'bg-gray-500'}`}></span>
          {formData.active ? 'Active' : 'Inactive'}
        </div>
      </div>
    </div>
  );
}