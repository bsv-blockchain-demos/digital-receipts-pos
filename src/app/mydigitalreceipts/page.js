"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function MyDigitalReceipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  // TODO: Let users click a saved receipt and fetch it from ARC to get actual details

  useEffect(() => {
    // TODO: Load saved receipts from local storage or API
    // For now, we'll show a placeholder
    setLoading(false);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Digital Receipts</h1>
          <p className="text-slate-400">View and manage your saved digital receipts</p>
        </div>

        {/* Back Button */}
        <div className="mb-8">
          <Link href="/">
            <button className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Scanner
            </button>
          </Link>
        </div>

        {/* Receipts Section */}
        {loading ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <p className="text-slate-400">Loading your receipts...</p>
            </div>
          </div>
        ) : receipts.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
            <div className="text-center">
              <svg className="w-16 h-16 text-slate-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">No Digital Receipts Yet</h3>
              <p className="text-slate-400 mb-6">Start by creating or scanning your first digital receipt</p>
              <Link href="/">
                <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 mx-auto">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Your First Receipt
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {receipts.map((receipt, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-purple-600/20 p-3 rounded-xl">
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{receipt.store}</h3>
                      <p className="text-slate-400">{receipt.timestamp}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-400">${receipt.total}</p>
                    <p className="text-sm text-slate-400">Receipt #{receipt.id}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Future Features Section */}
        <div className="mt-12 bg-slate-800/30 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/30 shadow-xl">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Coming Soon</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-600">
                <svg className="w-8 h-8 text-purple-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h4 className="font-semibold text-white mb-1">Analytics</h4>
                <p className="text-sm text-slate-400">Track spending patterns</p>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-600">
                <svg className="w-8 h-8 text-purple-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h4 className="font-semibold text-white mb-1">Search</h4>
                <p className="text-sm text-slate-400">Find receipts quickly</p>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-600">
                <svg className="w-8 h-8 text-purple-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-1" />
                </svg>
                <h4 className="font-semibold text-white mb-1">Export</h4>
                <p className="text-sm text-slate-400">Download as PDF/CSV</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
