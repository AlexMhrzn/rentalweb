import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../services/api';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);

  const locations = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Butwal', 'Chitwan'];
  const categories = ['Room', 'Flat', 'House', 'Hostel', 'Office Space'];

  useEffect(() => {
    fetchListings();
  }, [selectedLocation, selectedCategory]);

  // Refetch when page becomes visible (e.g. switching back from another tab)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchListings();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [selectedLocation, selectedCategory]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedLocation) params.city = selectedLocation;
      if (selectedCategory) params.category = selectedCategory;
      const res = await getProducts(params);
      const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';
      const products = res.data?.products || [];
        setListings(products.map((p) => {
          const img = p.image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop';
          const image = img.startsWith('http') ? img : (apiBase ? `${apiBase}/${img}` : img);
          return {
            id: p.id,
            image,
            title: p.title,
            price: p.price,
            area: p.area || p.location,
            city: p.city || 'N/A',
            location: p.location || `${p.area || ''} ${p.city || ''}`.trim() || 'N/A',
            beds: p.beds || 1,
            baths: p.baths || 1,
            parking: !!p.parking,
            verified: !!p.verified,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          };
      }));
    } catch (err) {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const featuredListings = listings.slice(0, 3);
  const nearbyRentals = listings;

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-[#E8F5E9] pb-20">
      {/* Header Section */}
      <div className="bg-white rounded-b-3xl shadow-md shadow-teal-100/50 px-5 pt-6 pb-4 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              Namaste, Alex 🙏
            </h1>
            <p className="text-sm text-slate-600">
              Find your next home in Nepal
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-md shadow-teal-200/50 ml-3">
            <span className="text-white text-lg font-semibold">A</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by city, area, or budget (Rs.)"
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all text-sm bg-white"
          />
        </div>
      </div>

      <div className="px-5 space-y-6">
        {/* Location Chips */}
        <div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {locations.map((location) => (
              <button
                key={location}
                onClick={() => setSelectedLocation(location === selectedLocation ? null : location)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  selectedLocation === location
                    ? 'bg-teal-500 text-white shadow-md shadow-teal-200/50'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-teal-300'
                }`}
              >
                {location}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-teal-500 text-white shadow-md shadow-teal-200/50'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-teal-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Listings Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Featured Listings</h2>
            <button
              onClick={() => fetchListings()}
              disabled={loading}
              className="px-3 py-1.5 text-sm font-medium text-teal-600 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading listings...</div>
          ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {featuredListings.map((listing) => (
              <div
                key={listing.id}
                className="flex-shrink-0 w-72 bg-white rounded-2xl shadow-md shadow-teal-100/50 overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={listing.image}
                    alt={listing.area}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => toggleFavorite(listing.id)}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-all"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 ${
                        favorites.has(listing.id)
                          ? 'text-red-500 fill-red-500'
                          : 'text-slate-400'
                      }`}
                      fill={favorites.has(listing.id) ? 'currentColor' : 'none'}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-bold text-teal-600">Rs. {listing.price.toLocaleString()}</span>
                    <span className="text-sm text-slate-500">/ month</span>
                  </div>
                  <p className="text-sm font-medium text-slate-700">{listing.area}, {listing.city}</p>
                  <p className="text-xs text-slate-400">Posted: {listing.createdAt ? new Date(listing.createdAt).toLocaleString() : 'N/A'}{listing.updatedAt && listing.updatedAt !== listing.createdAt ? ` • Edited: ${new Date(listing.updatedAt).toLocaleString()}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Nearby Rentals Section */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Nearby Rentals</h2>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : nearbyRentals.length === 0 ? (
            <div className="text-center py-8 text-slate-500 bg-white rounded-2xl">No rentals found. Try different filters.</div>
          ) : (
          <div className="space-y-4">
            {nearbyRentals.map((rental) => (
              <div
                key={rental.id}
                className="bg-white rounded-2xl shadow-md shadow-teal-100/50 overflow-hidden"
              >
                <div className="flex">
                  <div className="relative w-32 h-32 flex-shrink-0">
                    <img
                      src={rental.image}
                      alt={rental.title}
                      className="w-full h-full object-cover"
                    />
                    {rental.verified && (
                      <div className="absolute top-2 left-2 bg-teal-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Verified
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="text-base font-bold text-slate-900 mb-1">{rental.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-slate-600 mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{rental.location}</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">Posted: {rental.createdAt ? new Date(rental.createdAt).toLocaleString() : 'N/A'}{rental.updatedAt && rental.updatedAt !== rental.createdAt ? ` • Edited: ${new Date(rental.updatedAt).toLocaleString()}` : ''}</p>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-xl font-bold text-teal-600">Rs. {rental.price.toLocaleString()}</span>
                      <span className="text-xs text-slate-500">/ month</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        <span>{rental.beds}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                          />
                        </svg>
                        <span>{rental.baths}</span>
                      </div>
                      {rental.parking && (
                        <div className="flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                            />
                          </svg>
                          <span>Parking</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg shadow-teal-100/50">
        <div className="flex justify-around items-center py-3 px-2">
          <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-teal-50 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-teal-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-xs font-medium text-teal-600">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-teal-50 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="text-xs font-medium text-slate-400">Search</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-teal-50 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="text-xs font-medium text-slate-400">Favorites</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-teal-50 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="text-xs font-medium text-slate-400">Messages</span>
          </button>
          <button 
            onClick={() => navigate('/switchrole')}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-teal-50 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-xs font-medium text-slate-400">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
