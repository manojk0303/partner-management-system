import Image from 'next/image';
import Link from 'next/link';

const BrandCard = ({ brand }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 w-full">
        <Image
          src={brand.logo}
          alt={`${brand.name} logo`}
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800">{brand.name}</h3>
        <p className="text-gray-600 mt-2 line-clamp-2">{brand.description}</p>
        {brand.location && (
          <p className="text-gray-500 text-sm mt-2">
            <span className="inline-block mr-1">📍</span> {brand.location}
          </p>
        )}
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {brand.offers?.length || 0} active offers
          </span>
          <Link
            href={`/brands/${brand.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BrandCard;