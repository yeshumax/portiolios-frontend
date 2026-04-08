import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface Message {
  _id: string;
  type: string;
  status: string;
  message: string;
  createdAt: string;
  adminResponse?: string;
  isReadByUser?: boolean;
}

interface HistoryPanelProps {
  messages: Message[];
  loading: boolean;
  onNewMessage: () => void;
  title?: string;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ messages, loading, onNewMessage, title = "My Complaints & Feedback" }) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('complaint');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return; // Safety check
    
    setSubmitting(true);
    try {
      // Include user name and email when submitting message
      await api.post('/messages', { 
        message, 
        type,
        name: user.name,
        email: user.email
      });
      setMessage('');
      setShowForm(false);
      onNewMessage();
    } catch (error) {
      console.error('Failed to submit message:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Mark all unread notifications as read when viewed
  React.useEffect(() => {
    const markAllRead = async () => {
      if (!user?._id) return; // Safety check
      
      const unread = messages.filter(m => m.adminResponse && m.isReadByUser === false);
      for (const msg of unread) {
        try {
          await api.put(`/messages/${msg._id}/mark-as-read`);
        } catch (error: any) {
          console.error('Failed to mark as read', error);
          if (error.response?.status === 401) {
            // Stop trying if unauthorized
            break;
          }
        }
      }
      if (unread.length > 0) onNewMessage(); // Refresh count in header
    };

    if (messages.length > 0 && user?._id) {
      markAllRead();
    }
  }, [messages, onNewMessage, user]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400';
      case 'rejected': return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400';
      case 'resolved': return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400';
      default: return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-3xl overflow-hidden transition-colors duration-300">
      <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-[#1a1a1a]">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-500/20"
          >
            Submit New
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {showForm && (
          <div className="p-6 md:p-8 bg-gray-50 dark:bg-[#151515] border-b border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-4 duration-300">
             <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Type of Submission</label>
                  <div className="flex gap-3">
                    {['complaint', 'feedback', 'request'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${type === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Your Message</label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                    placeholder={`Write your ${type} here...`}
                    rows={4}
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition disabled:opacity-50">
                    {submitting ? 'Submitting...' : 'Submit Now'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 text-gray-500 font-bold hover:text-gray-700 dark:hover:text-gray-300 transition">Cancel</button>
                </div>
             </form>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
             Loading messages...
          </div>
        ) : messages.length === 0 && !showForm ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No complaints yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">Submit your first complaint or feedback to see it appearing here in your history.</p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold transition shadow-xl shadow-blue-500/20 transform hover:scale-105"
            >
              Get Started
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800 px-2">
            {messages.map((msg) => (
              <div key={msg._id} className="p-6 md:p-8 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(msg.status)} mb-2`}>
                      {msg.status}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest">{msg.type} • {new Date(msg.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-4 shadow-sm">
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                </div>
                {msg.adminResponse && (
                  <div className="pl-5 border-l-4 border-blue-500 dark:border-blue-400 animate-in slide-in-from-left-2 duration-300">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-2">Admin Response</span>
                    <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-2xl rounded-tl-none border border-blue-100/50 dark:border-blue-900/30">
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{msg.adminResponse}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
