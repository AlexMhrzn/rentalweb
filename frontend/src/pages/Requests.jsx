import React, { useEffect, useState } from 'react';
import { getOwnerBookingRequests, updateBookingStatus } from '../services/api';
import toast from 'react-hot-toast';

const Requests = () => {
  const [bookingRequests, setBookingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookingRequests = async () => {
    try {
      setLoading(true);
      const res = await getOwnerBookingRequests();
      setBookingRequests(res.data?.bookings || []);
    } catch (err) {
      setBookingRequests([]);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingRequests();
  }, []);

  const handleUpdate = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      toast.success(`Request ${status}`);
      fetchBookingRequests();
    } catch (err) {
      toast.error('Failed to update request');
    }
  };

  return (
    <div className="min-h-screen p-5 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Booking Requests</h1>

        {loading ? (
          <div className="text-center text-slate-500 py-8">Loading...</div>
        ) : bookingRequests.length === 0 ? (
          <div className="text-center text-slate-500 py-8">No booking requests at the moment.</div>
        ) : (
          <div className="space-y-3">
            {bookingRequests.map((b) => (
              <div key={b.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-sm font-semibold text-gray-700">P</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800">{b.requester?.name || b.requester?.email || 'Requester'}</h3>
                        <p className="text-xs text-gray-500 mt-1">Product: {b.Product?.title || b.productId}</p>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(b.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Preferred: {b.requestedDate ? new Date(b.requestedDate).toLocaleString() : 'Anytime'}</p>
                    {b.message && <p className="text-sm text-gray-500 mt-2">"{b.message}"</p>}
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded ${b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : b.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{b.status}</span>
                      {b.status === 'pending' && (
                        <>
                          <button onClick={() => handleUpdate(b.id, 'approved')} className="px-3 py-1 text-sm bg-green-600 text-white rounded-md">Approve</button>
                          <button onClick={() => handleUpdate(b.id, 'rejected')} className="px-3 py-1 text-sm bg-red-600 text-white rounded-md">Reject</button>
                        </>
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
  );
};

export default Requests;
