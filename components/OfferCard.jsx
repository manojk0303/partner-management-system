
// components/OfferCard.jsx (updated)
import { format } from 'date-fns';

const OfferCard = ({ offer, showActions = false, onEdit, onDelete }) => {
  // Format dates for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No end date';
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  // Check if offer is expired
  const isExpired = offer.endDate && new Date(offer.endDate) < new Date();
  
  // Check if offer is active
  const isActive = offer.active && !isExpired && new Date(offer.startDate) <= new Date();
  
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 transition-shadow duration-300 hover:shadow-lg ${
      !isActive ? 'border-l-4 border-gray-300' : 'border-l-4 border-green-500'
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{offer.title}</h3>
          {offer.brand && (
            <p className="text-sm text-gray-500">{offer.brand.name}</p>
          )}
        </div>
        {offer.discountPercent && (
          <div className="flex items-center justify-center w-16 h-16 bg-red-500 text-white rounded-full text-xl font-bold">
            {offer.discountPercent}%
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <p className="text-gray-600">{offer.description}</p>
      </div>
      
      {offer.couponCode && (
        <div className="mt-4 bg-gray-100 rounded-md p-3 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500">Coupon Code:</p>
            <p className="font-mono font-bold">{offer.couponCode}</p>
          </div>
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={() => navigator.clipboard.writeText(offer.couponCode)}
          >
            Copy
          </button>
        </div>
      )}
      
      <div className="mt-4 flex justify-between text-sm text-gray-500">
        <div>
          <p>Starts: {formatDate(offer.startDate)}</p>
          <p>Ends: {formatDate(offer.endDate)}</p>
        </div>
        <div className="flex items-center">
          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
            isActive ? 'bg-green-500' : 'bg-gray-400'
          }`}></span>
          {isActive ? 'Active' : 'Inactive'}
        </div>
      </div>
      
      {showActions && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(offer.id)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(offer.id)}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OfferCard;