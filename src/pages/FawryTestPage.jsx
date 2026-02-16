import React, { useState } from 'react';
import { toast } from 'react-toastify';

const FawryTestPage = () => {
  const [activeTab, setActiveTab] = useState('reference'); // 'reference' or 'card'
  const [bookingId, setBookingId] = useState('');
  const [expiryHours, setExpiryHours] = useState('24');
  const [language, setLanguage] = useState('ar-eg');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [merchantRefNum, setMerchantRefNum] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusResult, setStatusResult] = useState(null);

  // Ensure apiUrl doesn't have trailing slash
  const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const apiUrl = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;
  const token = localStorage.getItem('token');

  const generateCardPaymentLink = async () => {
    if (!bookingId) {
      toast.error('Please enter a booking ID');
      return;
    }

    if (!token) {
      toast.error('Please login first');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${apiUrl}/payments/fawry/checkout-link`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          paymentMethod: 'CARD',
          language,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ 
          type: 'card',
          paymentUrl: data.paymentUrl,
          merchantRefNum: data.merchantRefNum,
          paymentId: data.paymentId,
          expiresAt: data.expiresAt
        });
        setMerchantRefNum(data.merchantRefNum);
        toast.success('Payment link generated successfully!');
      } else {
        toast.error(data.message || 'Failed to generate payment link');
        setResult({ error: data });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Network error. Please try again.');
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const generateReferenceNumber = async () => {
    if (!bookingId) {
      toast.error('Please enter a booking ID');
      return;
    }

    if (!token) {
      toast.error('Please login first');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${apiUrl}/payments/fawry/reference-number`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          expiryHours: parseInt(expiryHours),
          language,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        setMerchantRefNum(data.merchantRefNum);
        toast.success('Reference number generated successfully!');
      } else {
        toast.error(data.message || 'Failed to generate reference number');
        setResult({ error: data });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Network error. Please try again.');
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!merchantRefNum) {
      toast.error('Please enter a merchant reference number');
      return;
    }

    if (!token) {
      toast.error('Please login first');
      return;
    }

    setStatusLoading(true);
    setStatusResult(null);

    try {
      const response = await fetch(`${apiUrl}/payments/fawry/status/${merchantRefNum}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStatusResult(data);
        toast.success('Status retrieved successfully!');
      } else {
        toast.error(data.message || 'Failed to get payment status');
        setStatusResult({ error: data });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Network error. Please try again.');
      setStatusResult({ error: error.message });
    } finally {
      setStatusLoading(false);
    }
  };

  const checkFawryInfo = async () => {
    try {
      const response = await fetch(`${apiUrl}/payments/fawry`);
      const data = await response.json();
      console.log('Fawry Info:', data);
      toast.info('Check console for Fawry info');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to get Fawry info');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-emerald-800 mb-2">
            🧪 Fawry PayAtFawry Test Page
          </h1>
          <p className="text-gray-600 mb-6">
            صفحة تجريبية لاختبار دفع فوري عن طريق الرقم المرجعي
          </p>

          <button
            onClick={checkFawryInfo}
            className="mb-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Check Fawry Configuration
          </button>

          {/* Payment Method Tabs */}
          <div className="border-t pt-6 mb-6">
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => {
                  setActiveTab('reference');
                  setResult(null);
                }}
                className={`flex-1 px-6 py-3 font-semibold rounded-lg transition ${
                  activeTab === 'reference'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                💵 PayAtFawry (Reference Number)
              </button>
              <button
                onClick={() => {
                  setActiveTab('card');
                  setResult(null);
                }}
                className={`flex-1 px-6 py-3 font-semibold rounded-lg transition ${
                  activeTab === 'card'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                💳 Card Payment (Visa/Mastercard)
              </button>
            </div>
          </div>

          {/* Card Payment Section */}
          {activeTab === 'card' && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                💳 Generate Card Payment Link
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking ID
                  </label>
                  <input
                    type="text"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    placeholder="Enter booking ID"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ar-eg">Arabic (ar-eg)</option>
                    <option value="en-gb">English (en-gb)</option>
                  </select>
                </div>

                <button
                  onClick={generateCardPaymentLink}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating...' : 'Generate Payment Link'}
                </button>
              </div>

              {/* Card Payment Result */}
              {result && result.type === 'card' && !result.error && (
                <div className="mt-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <h3 className="text-lg font-bold text-blue-800 mb-4">
                    ✅ Payment Link Generated
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Payment URL</p>
                      <a
                        href={result.paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline break-all"
                      >
                        {result.paymentUrl}
                      </a>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Merchant Ref</p>
                        <p className="font-mono text-sm">{result.merchantRefNum}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Payment ID</p>
                        <p className="font-mono text-sm truncate">{result.paymentId}</p>
                      </div>
                    </div>

                    {result.expiresAt && (
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Expires At</p>
                        <p className="text-sm">{new Date(result.expiresAt).toLocaleString('ar-EG')}</p>
                      </div>
                    )}

                    <button
                      onClick={() => window.open(result.paymentUrl, '_blank')}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Open Payment Page
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reference Number Section */}
          {activeTab === 'reference' && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                📝 Generate Reference Number
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking ID
                </label>
                <input
                  type="text"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="Enter booking ID"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Hours
                  </label>
                  <input
                    type="number"
                    value={expiryHours}
                    onChange={(e) => setExpiryHours(e.target.value)}
                    placeholder="24"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="ar-eg">Arabic (ar-eg)</option>
                    <option value="en-gb">English (en-gb)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={generateReferenceNumber}
                disabled={loading}
                className="w-full px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate Reference Number'}
              </button>
            </div>

            {/* Result Display */}
            {result && !result.error && (
              <div className="mt-6 p-6 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                <h3 className="text-lg font-bold text-emerald-800 mb-4">
                  ✅ Reference Number Generated
                </h3>
                
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Reference Number</p>
                    <p className="text-3xl font-bold text-emerald-600 font-mono">
                      {result.referenceNumber}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Merchant Ref</p>
                      <p className="font-mono text-sm">{result.merchantRefNum}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Payment ID</p>
                      <p className="font-mono text-sm truncate">{result.paymentId}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Amount</p>
                      <p className="font-semibold">{result.amount} {result.currency}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Expiry Hours</p>
                      <p className="font-semibold">{result.expiryHours} hours</p>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Expires At</p>
                    <p className="text-sm">{new Date(result.expiresAt).toLocaleString('ar-EG')}</p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <p className="text-sm font-medium text-amber-800 mb-2">📍 Instructions:</p>
                    <p className="text-sm text-amber-700">{result.instructions.ar}</p>
                    <p className="text-sm text-amber-700 mt-2">{result.instructions.en}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display for Reference Number */}
            {result && result.error && !result.type && (
              <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <h3 className="text-lg font-bold text-red-800 mb-2">❌ Error</h3>
                <pre className="text-sm text-red-700 overflow-auto">
                  {JSON.stringify(result.error, null, 2)}
                </pre>
              </div>
            )}
          </div>
          )}

          {/* Check Payment Status Section */}
          <div className="border-t pt-6 mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              🔍 Check Payment Status
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Merchant Reference Number
                </label>
                <input
                  type="text"
                  value={merchantRefNum}
                  onChange={(e) => setMerchantRefNum(e.target.value)}
                  placeholder="Enter merchant reference number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={checkPaymentStatus}
                disabled={statusLoading}
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {statusLoading ? 'Checking...' : 'Check Payment Status'}
              </button>
            </div>

            {/* Status Result Display */}
            {statusResult && !statusResult.error && (
              <div className="mt-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <h3 className="text-lg font-bold text-blue-800 mb-4">
                  📊 Payment Status
                </h3>
                
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <p className={`text-2xl font-bold ${
                      statusResult.status === 'COMPLETED' ? 'text-green-600' :
                      statusResult.status === 'PENDING' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {statusResult.status}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Amount</p>
                      <p className="font-semibold">{statusResult.amount} {statusResult.currency}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Fawry Ref Number</p>
                      <p className="font-mono text-sm">{statusResult.fawryRefNumber || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Payment ID</p>
                    <p className="font-mono text-sm truncate">{statusResult.paymentId}</p>
                  </div>
                </div>
              </div>
            )}

            {statusResult && statusResult.error && (
              <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <h3 className="text-lg font-bold text-red-800 mb-2">❌ Error</h3>
                <pre className="text-sm text-red-700 overflow-auto">
                  {JSON.stringify(statusResult.error, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-3">💡 Testing Tips</h3>
          <ul className="space-y-2 text-sm">
            <li>✓ Make sure you're logged in (token in localStorage)</li>
            <li>✓ Use a valid booking ID from your database</li>
            <li>✓ Default expiry is 24 hours (can be customized)</li>
            <li>✓ Check console for detailed API responses</li>
            <li>✓ Webhook notifications will update payment status automatically</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FawryTestPage;
