import React, { useState, useEffect } from 'react';
import { BookmarkCheck, Bell, Trash2, ArrowUpRight, TrendingUp, AlertTriangle } from 'lucide-react';
import { fetchWatchlist, removeFromWatchlist } from '../lib/api';

export const WatchlistAlertsPage: React.FC = () => {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    setIsLoading(true);
    fetchWatchlist().then(res => {
      if (res.success) {
        setWatchlist(res.watchlist || []);
        setAlerts(res.alerts || []);
      }
    }).catch(console.error).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRemove = async (id: number) => {
    await removeFromWatchlist(id);
    loadData();
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/20 via-purple-950/10 to-transparent border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Watchlist & Algorithmic Change Alerts (Sections 37 & 64)
            </h2>
            <p className="text-xs text-slate-400">
              Track saved keywords, monitor score accelerations, and receive notifications for emerging outliers.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Saved Watchlist (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Saved Watchlist Items ({watchlist.length})
            </h3>
          </div>

          {watchlist.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              No saved keywords in your watchlist yet. Click the bookmark icon on any opportunity to monitor it.
            </div>
          ) : (
            <div className="space-y-2">
              {watchlist.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm"
                >
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {item.item_type}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.target_name}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Alert Trigger: Score &gt; {item.alert_threshold_score} • Last Score: {item.last_known_score}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Live Alerts Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              <span>Real-Time Intelligence Alerts ({alerts.length})</span>
            </h3>
          </div>

          <div className="space-y-2.5">
            {alerts.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                No active threshold alerts.
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {alert.title}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
