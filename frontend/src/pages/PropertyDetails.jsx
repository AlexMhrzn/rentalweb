import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById, createBookingRequest } from '../services/api';
import toast from 'react-hot-toast';

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [duration, setDuration] = useState(1);
  const [booking, setBooking] = useState({ submitting: false, success: false });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await getProductById(id);
        setProperty(res.data.product || null);
      } catch (e) {
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleBookNow = () => setShowBooking(true);
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBooking({ submitting: true, success: false });
    try {
      // Ensure property is loaded and has owner info
      if (!property || !property.ownerId) {
        toast.error('Owner information missing.');
        setBooking({ submitting: false, success: false });
        return;
      }
      // Optionally, you can add requestedDate and message fields if needed
      const payload = {
        productId: Number(id),
        ownerId: Number(property.ownerId),
        // requestedDate: null, // Add a date picker if needed
        // message: null, // Add a message field if needed
      };
      const res = await createBookingRequest(payload);
      if (res.data.success) {
        toast.success('Booking confirmed!');
        setBooking({ submitting: false, success: true });
        setShowBooking(false);
      } else {
        toast.error(res.data.message || 'Booking failed');
        setBooking({ submitting: false, success: false });
      }
    } catch (err) {
      const backendMsg = err?.response?.data?.message || err?.message || 'Booking failed';
      toast.error(`Booking failed: ${backendMsg}`);
      setBooking({ submitting: false, success: false });
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading property...</div>;
  if (!property) return <div className="text-center py-8 text-gray-500">Property not found.</div>;

  const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';
  const images = property.images || (property.image ? [property.image] : []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-teal-700">{property.title}</h1>
        {/* Image Gallery */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {images.length > 0 ? images.map((img, idx) => (
            <img
              key={idx}
              src={img.startsWith('http') ? img : `${apiBase}/${img}`}
              alt={`Property ${idx + 1}`}
              className="w-full h-56 object-cover rounded-lg"
            />
          )) : (
            <div className="col-span-2 text-gray-400 text-center">No images available</div>
          )}
        </div>
        {/* Description & Details */}
        <div className="mb-4">
          <p className="text-gray-700 mb-2">{property.description || 'No description provided.'}</p>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div><strong>Location:</strong> {property.location || property.city || 'N/A'}</div>
            <div><strong>Price:</strong> NPR {property.price?.toLocaleString()} / {property.price_type || 'month'}</div>
            <div><strong>Status:</strong> {property.status || 'Available'}</div>
            <div><strong>Owner:</strong> {property.ownerName || property.owner?.username || 'N/A'}</div>
          </div>
        </div>
        {/* Book Now Button */}
        <button className="w-full py-3 bg-teal-600 text-white rounded-lg font-semibold text-lg hover:bg-teal-700 transition" onClick={handleBookNow}>
          Rent / Book Now
        </button>
        {/* Booking Modal */}
        {showBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowBooking(false)}>&times;</button>
              <h2 className="text-xl font-bold mb-4">Book Property</h2>
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Rental Duration ({property.price_type || 'month'})</label>
                  <input
                    type="number"
                    min={1}
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    className="w-full border rounded p-2"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition"
                  disabled={booking.submitting}
                >
                  {booking.submitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetails;
