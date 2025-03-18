'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Plus, Edit, Trash2, Tag, ChevronRight, AlertCircle, Calendar, Percent } from 'lucide-react';

export default function AdminOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });

  useEffect(() => {
    fetchOffers(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit]);

  async function fetchOffers(page = 1, limit = 10) {
    try {
      setLoading(true);
      // In a real application, this would include authentication headers
      const response = await fetch(`/api/admin/offers?page=${page}&limit=${limit}`);
      // console.log(response)
      if (!response.ok) {
        throw new Error('Failed to fetch offers');
      }
      
      const data = await response.json();
      setOffers(data.offers);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching offers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteClick = (offer) => {
    setOfferToDelete(offer);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!offerToDelete) return;
    
    try {
      const response = await fetch(`/api/admin/offers/${offerToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete offer');
      }
      
      // Remove the deleted offer from the state
      setOffers(offers.filter(offer => offer.id !== offerToDelete.id));
      setDeleteModalOpen(false);
      setOfferToDelete(null);
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      console.error('Error deleting offer:', err);
      setError(err.message);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const filteredOffers = offers.filter(offer => 
    offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && offers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-blue-600 font-medium animate-pulse">Loading offers...</p>
        </div>
      </div>
    );
  }

  // Function to format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Function to check if an offer is active
// Function to check if an offer is active - modified to prioritize the active flag
const isOfferActive = (offer) => {
  const now = new Date();
  const startDate = new Date(offer.startDate);
  const endDate = offer.endDate ? new Date(offer.endDate) : null;
  
  // If offer is manually set to active, show it as active regardless of dates
  if (offer.active) {
    return true;
  }
  
  // Otherwise, check date constraints (for automatic deactivation)
  return startDate <= now && (!endDate || endDate >= now);
};
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 py-6 px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div className="flex items-center">
                <Tag className="h-7 w-7 text-white mr-3" />
                <h1 className="text-2xl font-bold text-white">Partner Offers</h1>
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search offers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border-0 focus:ring-2 focus:ring-indigo-500 w-full sm:w-64 text-white"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                <Link 
                  href="/admin/offers/new" 
                  className="bg-white text-indigo-700 hover:bg-indigo-50 transition-colors duration-200 font-medium rounded-lg px-4 py-2 flex items-center justify-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  <span>Add Offer</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6 rounded-lg animate-fadeIn">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          {/* Content */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Offer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOffers.map((offer, index) => {
                  const isActive = isOfferActive(offer);
                  
                  return (
                    <tr 
                      key={offer.id} 
                      className="hover:bg-indigo-50 transition-colors duration-150"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-4">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <Tag className="h-5 w-5 text-indigo-600" />
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{offer.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs hidden sm:block">
                              {offer.description.substring(0, 50)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex-shrink-0 mr-3 relative rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                            {offer.brand.logo ? (
                              <Image
                                src={offer.brand.logo}
                                alt={`${offer.brand.name} logo`}
                                fill
                                className="object-contain"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-700 font-medium">{offer.brand.name.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-gray-600">{offer.brand.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="flex flex-col">
                          <div className="text-sm text-gray-600 flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            {formatDate(offer.startDate)}
                          </div>
                          {offer.endDate && (
                            <div className="text-sm text-gray-500">
                              to {formatDate(offer.endDate)}
                            </div>
                          )}
                          {!offer.endDate && (
                            <div className="text-sm text-gray-500 italic">
                              No end date
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                        {offer.discountPercent ? (
                          <div className="flex items-center">
                            <span className="text-green-600 font-medium">{offer.discountPercent}%</span>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 italic">
                            {offer.couponCode ? "Coupon only" : "No discount"}
                          </div>
                        )}
                        {offer.couponCode && (
                          <div className="mt-1">
                            <span className="px-2 py-1 text-xs font-mono bg-gray-100 rounded border border-gray-200">
                              {offer.couponCode}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isActive ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-1 justify-end">
                          <Link 
                            href={`/admin/offers/${offer.id}`}
                            className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-2 rounded-full transition-colors duration-200"
                            title="Edit Offer"
                          >
                            <Edit className="h-5 w-5" />
                            <span className="sr-only">Edit</span>
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(offer)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-full transition-colors duration-200"
                            title="Delete Offer"
                          >
                            <Trash2 className="h-5 w-5" />
                            <span className="sr-only">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                
                {filteredOffers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="max-w-sm mx-auto">
                        <div className="bg-indigo-50 rounded-lg p-6 flex flex-col items-center">
                          <Tag className="h-12 w-12 text-indigo-400 mb-3" />
                          <p className="text-gray-600 text-lg font-medium mb-1">No offers found</p>
                          <p className="text-gray-500 text-sm mb-6 text-center">
                            {searchTerm ? 'Try a different search term or' : 'Add your first partner offer to get started.'}
                          </p>
                          <Link 
                            href="/admin/offers/new" 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-4 py-2 flex items-center transition-colors duration-200"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            <span>Add New Offer</span>
                          </Link>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {filteredOffers.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span> of{' '}
                    <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        pagination.page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronRight className="h-5 w-5 transform rotate-180" />
                    </button>
                    
                    {/* Simplified pagination for example - you may want to expand this with numbered pages */}
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-indigo-50 text-sm font-medium text-indigo-600">
                      {pagination.page}
                    </span>
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        pagination.page === pagination.totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg">
            <h3 className="text-lg font-medium mb-4 flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Confirm Delete
            </h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete <span className="font-medium">{offerToDelete?.title}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}