import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Key, 
  Database, 
  Cpu, 
  Activity, 
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Zap
} from 'lucide-react';
import { fetchQuotaStatus, updateApiKey, testApiKey } from '../lib/api';
import { QuotaStatus } from '../lib/types';

export const SettingsPage: React.FC = () => {
  const [quota, setQuota] = useState<QuotaStatus | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const loadData = () => {
    fetchQuotaStatus().then((res: any) => {
      if (res.success) {
        setQuota(res.status);
        setRecentLogs(res.recentLogs || []);
      }
    }).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetchQuotaStatus();
      if (res.success) {
        setQuota(res.status);
        setRecentLogs(res.recentLogs || []);
        setRefreshToast(true);
        setTimeout(() => setRefreshToast(false), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    try {
      const res = await updateApiKey(apiKey.trim());
      if (res.success) {
        setSaveStatus('API Key configured successfully!');
        setApiKey('');
        loadData();
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (err: any) {
      setSaveStatus(`Error: ${err.message}`);
    }
  };

  const handleTestKey = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testApiKey();
      if (res.success) {
        setTestResult({
          success: true,
          message: `${res.result.message} (1 unit recorded in ledger)`
        });
        if (res.status) setQuota(res.status);
        if (res.recentLogs) setRecentLogs(res.recentLogs);
      } else {
        setTestResult({
          success: false,
          message: res.result?.error || 'Verification failed. Please check your API key.'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/10 via-blue-950/10 to-transparent border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-md">
            <SettingsIcon className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              System Settings & YouTube API Quota Manager (Section 40 & 41)
            </h2>
            <p className="text-xs text-slate-400">
              Manage YouTube API credentials, view daily quota consumption, and review data provenance guarantees.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* API Key Configuration Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-red-500" />
              <span>YouTube Data API v3 Key</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Enter your Google Cloud YouTube Data API v3 key. When active, requests query live YouTube endpoints directly. If left unconfigured, the platform seamlessly uses our rich historical observed database and zero-quota autocomplete engine.
            </p>

            <form onSubmit={handleSaveKey} className="space-y-3">
              <div>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your key: AIzaSy..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-500/40"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                Save & Activate API Key
              </button>

              {saveStatus && (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold text-center mt-2">
                  {saveStatus}
                </div>
              )}
            </form>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Status:</span>
              <strong className={quota?.apiKeyConfigured ? 'text-emerald-500 font-bold' : 'text-amber-500'}>
                {quota?.apiKeyConfigured ? '🟢 Live API Active' : '🟡 Standalone / Database Engine Active'}
              </strong>
            </div>

            {/* Test Connection Button */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button
                type="button"
                onClick={handleTestKey}
                disabled={isTesting || !quota?.apiKeyConfigured}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Zap className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-amber-500' : 'text-amber-500 fill-amber-500'}`} />
                <span>{isTesting ? 'Verifying with YouTube...' : 'Verify Connection & Test (Uses 1 Unit)'}</span>
              </button>

              {testResult && (
                <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  testResult.success 
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-tight">{testResult.message}</span>
                </div>
              )}
            </div>

            <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between pt-2">
              <span>Google Cloud Quota:</span>
              <a
                href="https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-500 font-bold hover:underline flex items-center gap-1"
              >
                <span>Cloud Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Section 41 Data Provenance Architecture Note */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Data Provenance & Quality Standards</span>
            </h4>
            <div className="space-y-2 text-slate-600 dark:text-slate-400 text-[11px]">
              <div>
                <strong className="text-blue-500">Official API:</strong> Real-time metadata, channel stats, and video lists from Google servers.
              </div>
              <div>
                <strong className="text-emerald-500">Observed Snapshot:</strong> Actual time-stamped observations recorded directly into SQLite.
              </div>
              <div>
                <strong className="text-purple-500">Model Estimate:</strong> Statistical decay and growth projections explicitly labeled.
              </div>
            </div>
          </div>
        </div>

        {/* Quota Manager Overview (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">YouTube API Quota Tracker</span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Daily Quota Usage: {quota?.unitsUsed.toLocaleString()} / {quota?.dailyLimit.toLocaleString()} units
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {refreshToast && (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 animate-fadeIn">
                    ✓ Quota Refreshed
                  </span>
                )}
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Refresh Quota Status"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-red-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-red-500 transition-all duration-500"
                style={{ width: `${Math.min(100, quota?.percentUsed || 0)}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Remaining</span>
                <strong className="text-sm text-emerald-600">{quota?.unitsRemaining.toLocaleString()}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Daily Limit</span>
                <strong className="text-sm text-slate-900 dark:text-white">{quota?.dailyLimit.toLocaleString()}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Next Reset</span>
                <strong className="text-[11px] text-slate-700 dark:text-slate-300">Midnight PT (approx 24h)</strong>
              </div>
            </div>

            {/* Quota Cost Breakdown reference */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Standard YouTube API Unit Costs:</span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                <div>• search.list = 100 units</div>
                <div>• videos.list = 1 unit</div>
                <div>• channels.list = 1 unit</div>
                <div>• suggest.queries = 0 units (Public Autocomplete)</div>
              </div>
            </div>

            {/* Recent Log History */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Recent API Call Ledger
              </h4>
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto">
                {recentLogs.length === 0 ? (
                  <div className="p-4 text-center text-[11px] text-slate-400">
                    No consumption logged in the current window.
                  </div>
                ) : (
                  recentLogs.map((log) => (
                    <div key={log.id} className="p-2.5 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{log.endpoint}</span>
                        <span className="text-slate-400 ml-2">{new Date(log.created_at).toLocaleTimeString()}</span>
                      </div>
                      <span className="font-bold text-red-500">-{log.units_consumed} units</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
