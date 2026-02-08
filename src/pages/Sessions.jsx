import { useEffect, useState } from 'react';
import { sessionAPI } from '../services/api';
import { FiVideo, FiPlay, FiSquare, FiClock, FiSearch } from 'react-icons/fi';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState('');

  const fetchSession = async () => {
    if (!bookingId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await sessionAPI.getSession(bookingId);
      setSessions([response.data]);
    } catch (error) {
      console.error('Failed to fetch session:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (bookingId) => {
    try {
      await sessionAPI.startSession(bookingId);
      fetchSession();
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const handleEndSession = async (bookingId) => {
    try {
      await sessionAPI.endSession(bookingId, {});
      fetchSession();
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      SCHEDULED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="min-w-0">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Sessions</h1>
        <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">Manage video/voice sessions</p>
      </section>

      {/* Search */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Enter Booking ID to view session"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button type="button" onClick={fetchSession} disabled={!bookingId} className="rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 disabled:cursor-not-allowed">
            Search
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="size-12 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        ) : (
          <>
            {sessions.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {sessions.map((session) => (
                  <div key={session.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <FiVideo className="text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Session {session.id.slice(0, 8)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Booking: {session.bookingId}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <span className="text-xs text-gray-500">Start Time</span>
                            <div className="text-sm font-medium text-gray-900">
                              {session.startTime ? new Date(session.startTime).toLocaleString() : 'Not started'}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">End Time</span>
                            <div className="text-sm font-medium text-gray-900">
                              {session.endTime ? new Date(session.endTime).toLocaleString() : 'Not ended'}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Duration</span>
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                              <FiClock />
                              {session.durationMinutes || 0} minutes
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Status</span>
                            <div>
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(session.status)}`}>
                                {session.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleStartSession(session.bookingId)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <FiPlay />
                            Start
                          </button>
                        )}
                        {session.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleEndSession(session.bookingId)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <FiSquare />
                            End
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                {bookingId ? 'No session found for this booking' : 'Enter a booking ID to view session'}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Sessions;

