import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AllProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const res = await getProducts();
        setProperties(res.data.products || []);
      } catch (e) {
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6 text-teal-700">All Properties</h1>
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading properties...</div>
      ) : properties.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No properties found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
              <img
                src={property.image?.startsWith('http') ? property.image : `${import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || ''}/${property.image}`}
                alt={property.title}
                className="h-48 w-full object-cover"
              />
              <div className="p-4 flex-1 flex flex-col">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">{property.title}</h2>
                <p className="text-sm text-gray-500 mb-2">{property.location || property.city || 'N/A'}</p>
                <p className="text-teal-600 font-bold mb-2">NPR {property.price?.toLocaleString()} / {property.price_type || 'month'}</p>
                {property.status === 'rented' ? (
                  <span className="mt-2 px-4 py-2 bg-red-500 text-white rounded text-center">Booked</span>
                ) : (
                  <button
                    onClick={() => navigate(`/property/${property.id}`)}
                    className="mt-auto px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition"
                  >
                    View Details
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllProperties;
