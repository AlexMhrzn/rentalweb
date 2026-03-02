import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyFavorites, createBookingRequest } from '../services/api';

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getMyFavorites();
        const products = res.data?.products || [];
        const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';
        setFavorites(products.map((p) => {
          const img = p.image || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop';
          const image = img.startsWith('http') ? img : (apiBase ? `${apiBase}/${img}` : img);
          return {
            id: p.id,
            image,
            title: p.title,
            price: p.price,
            location: p.location || p.city || 'N/A',
            ownerId: p.owner?.id || p.ownerId || null,
          };
        }));
      } catch (err) {
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold mb-4">Favorites</h2>
        {loading ? (
          <div className="text-center text-slate-500">Loading favorites...</div>
        ) : favorites.length === 0 ? (
          <div className="text-center text-slate-500">No favorites yet</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((f) => (
              <div key={f.id} className="bg-white shadow-sm rounded-xl overflow-hidden flex flex-col">
                <img src={f.image} alt={f.title} className="w-full h-40 object-cover" />
                <div className="p-4 flex-1 flex flex-col">
                  <div className="font-bold text-lg mb-1">{f.title}</div>
                  <div className="text-sm text-slate-500 mb-2">{f.location}</div>
                  <div className="text-teal-600 font-bold text-xl mb-2">Rs. {f.price?.toLocaleString()}</div>
                  <button
                    onClick={async () => {
                      if (!f.ownerId) return alert('Owner not found');
                      const date = window.prompt('Preferred date/time (e.g. 2026-02-26T15:00)');
                      if (date === null) return;
                      const msg = window.prompt('Optional message to owner');
                      try {
                        await createBookingRequest({ productId: f.id, ownerId: f.ownerId, requestedDate: date || null, message: msg || null });
                        alert('Request sent');
                      } catch (err) { alert(err?.response?.data?.message || 'Failed to send request'); }
                    }}
                    className="bg-teal-600 text-white w-full py-2 rounded-lg mt-4 hover:bg-teal-700 transition"
                  >
                    Request Visit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
