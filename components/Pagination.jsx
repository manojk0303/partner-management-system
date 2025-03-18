import Link from 'next/link';

const Pagination = ({ 
  totalItems, 
  itemsPerPage = 10, 
  currentPage = 1, 
  urlPattern = '?page=%page%' 
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalPages <= 1) return null;
  
  // Calculate page range to display
  const pageDisplayRange = 2; // How many pages to show before and after current page
  let startPage = Math.max(1, currentPage - pageDisplayRange);
  let endPage = Math.min(totalPages, currentPage + pageDisplayRange);
  
  // Adjust if we're near the beginning or end
  if (startPage <= 3) {
    startPage = 1;
    endPage = Math.min(5, totalPages);
  }
  
  if (endPage >= totalPages - 2) {
    endPage = totalPages;
    startPage = Math.max(1, totalPages - 4);
  }
  
  // Generate array of page numbers to display
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  
  const getPageUrl = (page) => {
    return urlPattern.replace('%page%', page);
  };
  
  return (
    <nav className="flex items-center justify-center my-8" aria-label="Pagination">
      {/* Previous page */}
      {currentPage > 1 ? (
        <Link 
          href={getPageUrl(currentPage - 1)}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50"
        >
          Previous
        </Link>
      ) : (
        <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-white border border-gray-300 rounded-l-md cursor-not-allowed">
          Previous
        </span>
      )}
      
      {/* First page if not in view */}
      {startPage > 1 && (
        <>
          <Link 
            href={getPageUrl(1)}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
          >
            1
          </Link>
          {startPage > 2 && (
            <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300">
              ...
            </span>
          )}
        </>
      )}
      
      {/* Page numbers */}
      {pages.map((page) => (
        <Link
          key={page}
          href={getPageUrl(page)}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
            page === currentPage
              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </Link>
      ))}
      
      {/* Last page if not in view */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300">
              ...
            </span>
          )}
          <Link 
            href={getPageUrl(totalPages)}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
          >
            {totalPages}
          </Link>
        </>
      )}
      
      {/* Next page */}
      {currentPage < totalPages ? (
        <Link 
          href={getPageUrl(currentPage + 1)}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50"
        >
          Next
        </Link>
      ) : (
        <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-white border border-gray-300 rounded-r-md cursor-not-allowed">
          Next
        </span>
      )}
    </nav>
  );
};

export default Pagination;