// app/admin/brands/[id]/offers/new/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Tag, Percent, CheckCircle, ArrowLeft, Info } from 'lucide-react';

export default function CreateOfferPage({ params }) {
  const brandId = params.id;
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
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const router = useRouter();

  // Format date to YYYY-MM-DD for input fields
  const formatDateForInput = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  // Set today as default start date and +30 days as default end date
  useEffect(() => {
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    
    setFormData(prev => ({
      ...prev,
      startDate: formatDateForInput(today),
      endDate: formatDateForInput(thirtyDaysLater)
    }));
  }, []);

  // Fetch brand data
  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch(`/api/admin/brands/${brandId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch brand details');
        }

        const data = await response.json();
        setBrand(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBrand();
  }, [brandId, router]);

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

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Convert discount to number
      const offerData = {
        ...formData,
        discountPercent: formData.discountPercent ? parseInt(formData.discountPercent, 10) : null
      };

      const response = await fetch(`/api/admin/brands/${brandId}/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(offerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create offer');
      }

      // Redirect to the offers page
      router.push(`/admin/brands/${brandId}/offers`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          <p className="mt-4 text-indigo-600 font-medium animate-pulse">Loading Brand Details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 mb-16">
      <div className="mb-8">
        <nav className="flex items-center text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li><Link href="/admin/brands" className="hover:text-indigo-600 transition-colors">Brands</Link></li>
            <li>/</li>
            <li><Link href={`/admin/brands/${brandId}`} className="hover:text-indigo-600 transition-colors">{brand?.name || 'Brand'}</Link></li>
            <li>/</li>
            <li><Link href={`/admin/brands/${brandId}/offers`} className="hover:text-indigo-600 transition-colors">Offers</Link></li>
            <li>/</li>
            <li className="text-indigo-600 font-medium">New</li>
          </ol>
        </nav>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
            <span className="bg-indigo-100 text-indigo-800 p-2 rounded-full mr-3 hidden sm:block">
              <Tag size={20} />
            </span>
            Create New Offer
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
            <Info size={20} className="mr-2 flex-shrink-0" />
            <span>{error}</span>
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
              placeholder="e.g., Summer Sale 20% Off"
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
              placeholder="Provide details about this offer"
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
                  placeholder="e.g., SUMMER2025"
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
                  placeholder="e.g., 20"
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

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={submitLoading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transform transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center min-w-[160px]"
            >
              {submitLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                  Creating...
                </>
              ) : (
                'Create Offer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}