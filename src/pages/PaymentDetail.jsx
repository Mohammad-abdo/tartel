import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentAPI, adminAPI } from '../services/api';
import {
  FiArrowLeft,
  FiDollarSign,
  FiUser,
  FiCalendar,
  FiCreditCard,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiTrendingUp,
} from 'react-icons/fi';
import { useCurrency } from '../context/CurrencyContext';

const PaymentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayment();
  }, [id]);

  const fetchPayment = async () => {
    setLoading(true);
    try {
      const response = await paymentAPI.getPaymentByBooking(id);
      setPayment(response.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Failed to fetch payment:', error);
      }
      try {
        const adminResponse = await adminAPI.getPaymentById(id);
        setPayment(adminResponse.data);
      } catch (e) {
        if (e.response?.status !== 404) {
          console.error('Failed to fetch payment by id:', e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Payment not found</p>
        <button
          onClick={() => navigate('/payments')}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          Back to Payments
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/payments')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Payment Details</h1>
            <p className="text-gray-600 mt-1">Complete payment information</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-4 py-2 text-sm font-semibold rounded-lg ${getStatusBadge(payment.status)}`}
          >
            {payment.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Information */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-6 border border-green-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FiDollarSign />
              Payment Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-gray-600 uppercase tracking-wide mb-2 block">
                  Amount
                </label>
                <p className="text-4xl font-bold text-gray-900">
                  {formatCurrency(payment.amount || 0)}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-600 uppercase tracking-wide mb-2 block">
                  Status
                </label>
                <span
                  className={`px-4 py-2 inline-flex text-sm font-semibold rounded-lg ${getStatusBadge(payment.status)}`}
                >
                  {payment.status}
                </span>
              </div>
              <div>
                <label className="text-xs text-gray-600 uppercase tracking-wide mb-2 block flex items-center gap-2">
                  <FiCreditCard />
                  Payment Intent ID
                </label>
                <p className="text-sm font-mono text-gray-900 break-all">
                  {payment.stripePaymentIntentId || payment.id}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-600 uppercase tracking-wide mb-2 block flex items-center gap-2">
                  <FiCalendar />
                  Payment Date
                </label>
                <p className="text-gray-900 font-medium">
                  {new Date(payment.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {payment.updatedAt && payment.updatedAt !== payment.createdAt && (
                <div>
                  <label className="text-xs text-gray-600 uppercase tracking-wide mb-2 block">
                    Last Updated
                  </label>
                  <p className="text-gray-900 font-medium">
                    {new Date(payment.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Related Booking */}
          {payment.booking && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Related Booking</h2>
              <div
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/bookings/${payment.booking.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Booking #{payment.booking.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(payment.booking.date || payment.booking.startTime).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(payment.booking.status)}`}
                    >
                      {payment.booking.status}
                    </span>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {formatCurrency(payment.booking.totalPrice || payment.booking.price || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Information */}
          {payment.user && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiUser />
                User Information
              </h2>
              <div
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => payment.user?.id && navigate(`/users/${payment.user.id}`)}
              >
                <div className="flex items-center gap-4">
                  {payment.user.avatar ? (
                    <img
                      src={payment.user.avatar}
                      alt={payment.user.name}
                      className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center border-2 border-gray-200">
                      <span className="text-primary-600 text-xl font-bold">
                        {payment.user.name?.charAt(0) || payment.user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {payment.user.name || payment.user.email}
                    </h3>
                    <p className="text-sm text-gray-500">{payment.user.email}</p>
                    {payment.user.id && (
                      <p className="text-xs text-gray-400 font-mono mt-1">
                        ID: {payment.user.id.slice(0, 8)}...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-white/20">
                <span className="text-primary-100">Amount</span>
                <span className="text-2xl font-bold">
                  {formatCurrency(payment.amount || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-primary-100">Status</span>
                <span className="font-semibold">{payment.status}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-white/20">
                <span className="text-primary-100">Payment ID</span>
                <span className="text-xs font-mono">{(payment?.id ?? '').toString().slice(0, 8)}{payment?.id ? '...' : '—'}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {payment.status === 'COMPLETED' && (
                <button className="w-full px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2 border border-blue-200 font-medium">
                  <FiRefreshCw />
                  Process Refund
                </button>
              )}
              {payment.booking && (
                <button
                  onClick={() => navigate(`/bookings/${payment.booking.id}`)}
                  className="w-full px-4 py-3 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center justify-center gap-2 border border-primary-200 font-medium"
                >
                  <FiUser />
                  View Booking
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetail;
