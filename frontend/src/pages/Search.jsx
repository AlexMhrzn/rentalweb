import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getProducts } from '../services/api';

const Search = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [q, setQ] = useState(initialQ);
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const locations = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Butwal', 'Chitwan'];
  const categories = ['Room', 'Flat', 'House', 'Hostel', 'Office Space'];

  useEffect(() => {
    if (initialQ) performSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const performSearch = async () => {
    try {
      setLoading(true);
      const params = {};
      if (q) params.q = q;
      if (city) params.city = city;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const res = await getProducts(params);
      const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';
      const products = res.data?.products || [];
      setResults(products.map((p) => {
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
        };
      }));
    } catch (err) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-4 w-full">
          <button onClick={() => navigate(-1)} className="px-3 py-2 bg-[#0F766E] text-white rounded-xl shadow-md hover:bg-[#15803D] transition">Back</button>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search keywords" className="flex-1 px-4 py-2 rounded-xl border-2 border-teal-200 bg-white shadow-sm text-[#374151] placeholder-cyan-500 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500 transition-all text-base" />
          <button onClick={performSearch} className="px-4 py-2 bg-[#0F766E] text-white rounded-xl shadow-md hover:bg-[#15803D] transition">Search</button>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-lg mb-6 w-full" style={{boxShadow: '0 10px 15px -3px rgba(0,0,0,0.08)'}}>
          <div className="grid grid-cols-2 gap-4">
            <select value={city} onChange={(e) => setCity(e.target.value)} className="p-3 border-2 border-teal-200 rounded-xl bg-[#F3F4F6] text-[#374151] focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500 transition-all">
              <option value="">Any city</option>
              {locations.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-3 border-2 border-teal-200 rounded-xl bg-[#F3F4F6] text-[#374151] focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500 transition-all">
              <option value="">Any type</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min price" className="p-3 border-2 border-teal-200 rounded-xl bg-[#F3F4F6] text-[#374151] focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500 transition-all" />
            <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max price" className="p-3 border-2 border-teal-200 rounded-xl bg-[#F3F4F6] text-[#374151] focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-500 transition-all" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-3">Results</h2>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Searching...</div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No results found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl overflow-hidden" style={{boxShadow: '0 10px 15px -3px rgba(0,0,0,0.10)'}}>
                  <img src={r.image} alt={r.title} className="w-full h-40 object-cover" />
                  <div className="p-5">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900">{r.title}</h3>
                        <p className="text-sm text-slate-600">{r.location}</p>
                      </div>
                      <div className="font-bold text-[#15803D]">Rs. {r.price.toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-sm text-slate-600">
                      <div>{r.beds} beds</div>
                      <div>{r.baths} baths</div>
                      {r.parking && <div>Parking</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
