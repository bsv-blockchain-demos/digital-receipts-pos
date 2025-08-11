"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { useZxing } from "react-zxing";
import Link from "next/link";

export default function Home() {
  const [receiptData, setReceiptData] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  // Setup zxing hook for scanning
  const { ref } = useZxing({
    onResult(result) {
      setScanResult(result.getText());
      setScanning(false);
    },
    onError(error) {
      console.error(error);
    },
  });

  async function createReceipt() {
    const { encryptedReceipt, symkeyString, timestamp, txid } = await fetch("http://localhost:8080/create-receipt").then((res) => res.json());

    setReceiptData({ encryptedReceipt, symkeyString, timestamp, txid });
    setScanResult(null);
  }

  useEffect(() => {
    if (!scanResult) return;
    // TODO: On successful scan save the data on device
    console.log("Scan result:", scanResult);
    fetch("http://localhost:8080/save-receipt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scanResult }),
    });
  }, [scanResult]);

  // TODO: add save button just for testing

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create & Scan Digital Receipt Demo</h1>
          <p className="text-slate-400">Generate QR codes and scan digital receipts with ease</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <button
            onClick={createReceipt}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3 justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {receiptData ? "Create New Receipt" : "Create Receipt"}
          </button>

          <Link href="/mydigitalreceipts">
            <button className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3 justify-center border border-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              My Digital Receipts
            </button>
          </Link>
        </div>

        {/* QR Code Section */}
        {receiptData && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-slate-700/50 shadow-2xl">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-3">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Your Digital Receipt QR Code
              </h2>
              <div className="bg-white p-6 rounded-2xl shadow-lg inline-block mb-6">
                <QRCode
                  value={JSON.stringify({
                    txid: receiptData.txid,
                    symkeyString: receiptData.symkeyString,
                    timestamp: receiptData.timestamp
                  })}
                  size={256}
                />
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-600">
                <pre className="text-green-400 text-sm font-mono overflow-x-auto">{JSON.stringify(receiptData)}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Scan Button */}
        {!scanning && (
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setScanning(true)}
              className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3 border border-slate-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Scan Digital Receipt QR Code
            </button>
          </div>
        )}

        {/* Scanner Section */}
        {scanning && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-slate-700/50 shadow-2xl">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-3">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Scan Digital Receipt QR Code
              </h2>
              <div className="bg-slate-900/50 rounded-2xl p-4 mb-6 border border-slate-600">
                <video
                  ref={ref}
                  className="w-full max-w-md mx-auto rounded-xl shadow-lg"
                />
              </div>
              <button
                onClick={() => setScanning(false)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Scan Result Section */}
        {scanResult && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-3">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Scanned Digital Receipt Data
              </h2>
              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-600">
                <pre className="text-green-400 text-sm font-mono overflow-x-auto whitespace-pre-wrap">{scanResult}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}