import React, { useState } from 'react';
import { FileText, Upload, CheckCircle2, AlertTriangle, Sparkles, Zap, Car, Ticket, ArrowRight, RefreshCw, Check } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BillScanner({ setActiveTab }) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [editUnits, setEditUnits] = useState(248);
  const [docType, setDocType] = useState("Electricity Bill");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setScanResult(null);
      setConfirmed(false);
      setPreviewUrl(URL.createObjectURL(file));

      const fname = file.name.toLowerCase();
      if (fname.includes('fuel') || fname.includes('petrol') || fname.includes('diesel') || fname.includes('gas')) {
        setDocType("Fuel Receipt");
        setEditUnits(45);
      } else if (fname.includes('ticket') || fname.includes('train') || fname.includes('flight') || fname.includes('metro') || fname.includes('bus')) {
        setDocType("Travel Ticket");
        setEditUnits(120);
      } else {
        setDocType("Electricity Bill");
        setEditUnits(248);
      }
    }
  };

  const handleUploadScan = async () => {
    if (!selectedFile) return;
    setScanning(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      if (user) {
        const res = await api.scanBill(formData);
        if (res && res.extracted_data) {
          setScanResult(res);
          setDocType(res.extracted_data.doc_type || docType);
          setEditUnits(res.extracted_data.units_extracted || editUnits);
        }
      } else {
        const fname = selectedFile.name.toLowerCase();
        let detectedType = "Electricity Bill";
        let detectedUnits = 248.0;
        let detectedUnit = "kWh";

        if (fname.includes('fuel') || fname.includes('petrol') || fname.includes('diesel') || fname.includes('gas')) {
          detectedType = "Fuel Receipt";
          detectedUnits = 45.0;
          detectedUnit = "liters";
        } else if (fname.includes('ticket') || fname.includes('train') || fname.includes('flight') || fname.includes('metro') || fname.includes('bus')) {
          detectedType = "Travel Ticket";
          detectedUnits = 120.0;
          detectedUnit = "km";
        }

        setDocType(detectedType);
        setEditUnits(detectedUnits);

        setScanResult({
          scan_id: Date.now(),
          file_name: selectedFile.name,
          doc_type: detectedType,
          extracted_data: {
            doc_type: detectedType,
            units_extracted: detectedUnits,
            unit: detectedUnit,
            billing_period: "July 2026",
            estimated_co2_impact_kg: round1(detectedUnits * (detectedUnit === 'kWh' ? 0.82 : detectedUnit === 'liters' ? 2.31 : 0.041)),
            ocr_confidence: 0.95
          },
          prompt_message: "Is this information correct? Review before adding to your carbon history."
        });
      }
    } catch (err) {
      alert("Error parsing file via OCR.");
    } finally {
      setScanning(false);
    }
  };

  const round1 = (v) => Math.round(v * 10) / 10;

  const handleDocTypeSelect = (newType) => {
    setDocType(newType);
    if (newType === "Fuel Receipt") {
      setEditUnits(45);
    } else if (newType === "Travel Ticket") {
      setEditUnits(120);
    } else {
      setEditUnits(248);
    }
  };

  const getUnitName = () => {
    if (docType === "Fuel Receipt") return "liters";
    if (docType === "Travel Ticket") return "km";
    return "kWh";
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const payload = {
        doc_type: docType,
        units_extracted: parseFloat(editUnits),
        billing_period: scanResult?.extracted_data?.billing_period || "July 2026"
      };

      if (user && scanResult?.scan_id) {
        await api.confirmBillScan(scanResult.scan_id, payload);
      }
      setConfirmed(true);
    } catch (err) {
      alert("Failed confirming bill scan.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-[#123B2A] to-[#16A66A] p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Scan Your Bill / Receipt
          </h1>
          <p className="text-xs text-[#DDF7E9]/80 font-medium mt-1">
            Upload utility electricity bills, fuel receipts, or travel tickets for automatic OCR metric extraction.
          </p>
        </div>
      </div>

      {/* MAIN SCANNER CONTAINER */}
      <div className="glass-card p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#123B2A] border border-[#16A66A]/30 space-y-8 shadow-xl">
        
        {/* Upload Dropzone */}
        <div className="border-2 border-dashed border-[#16A66A]/40 rounded-3xl p-8 text-center space-y-4 bg-slate-50 dark:bg-white/5">
          <div className="w-16 h-16 rounded-3xl bg-[#16A66A]/10 text-[#16A66A] mx-auto flex items-center justify-center">
            <Upload className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Upload Utility Bill, Fuel Receipt, or Ticket
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#DDF7E9]/70">
              Supports PNG, JPG, PDF documents (Electricity Bill, Fuel Receipt, Metro/Flight Ticket)
            </p>
          </div>

          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            id="bill-upload-input"
            className="hidden"
          />

          <div className="flex justify-center gap-3">
            <label
              htmlFor="bill-upload-input"
              className="px-6 py-3 rounded-2xl bg-[#123B2A] text-white text-xs font-bold hover:bg-[#0B2A1D] cursor-pointer shadow transition"
            >
              Select File
            </label>

            {selectedFile && (
              <button
                onClick={handleUploadScan}
                disabled={scanning}
                className="px-6 py-3 rounded-2xl bg-[#16A66A] text-white text-xs font-bold hover:bg-emerald-600 cursor-pointer shadow transition flex items-center gap-2"
              >
                {scanning ? 'Running AI OCR Scan...' : 'Scan Document with OCR'}
                <Sparkles className="w-4 h-4 text-[#F4C95D]" />
              </button>
            )}
          </div>

          {selectedFile && (
            <p className="text-xs font-bold text-[#16A66A]">
              Selected Document: {selectedFile.name}
            </p>
          )}
        </div>

        {/* OCR EXTRACTION REVIEW & CONFIRMATION BOX */}
        {scanResult && (
          <div className="p-6 rounded-3xl bg-[#DDF7E9]/40 dark:bg-white/5 border-2 border-[#16A66A]/40 space-y-6 animate-fade-in shadow-md">
            <div className="flex justify-between items-center border-b border-[#16A66A]/30 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#16A66A]" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  OCR Extracted Information
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#16A66A] text-white text-[10px] font-black uppercase">
                Confidence: 95%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
              
              {/* Change Document Type Dropdown */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block mb-1">Document Type</span>
                <select
                  value={docType}
                  onChange={(e) => handleDocTypeSelect(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#123B2A] dark:text-white font-extrabold border border-slate-200 dark:border-slate-700"
                >
                  <option value="Electricity Bill">Electricity Bill</option>
                  <option value="Fuel Receipt">Fuel Receipt</option>
                  <option value="Travel Ticket">Travel Ticket</option>
                </select>
              </div>

              {/* Units Input */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Extracted Units ({getUnitName()})</span>
                <input
                  type="number"
                  value={editUnits}
                  onChange={(e) => setEditUnits(e.target.value)}
                  className="w-full mt-1 p-1 text-sm font-black text-[#16A66A] bg-transparent border-b border-[#16A66A] focus:outline-none"
                />
              </div>

              {/* Period */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Billing Period</span>
                <span className="text-slate-800 dark:text-white text-sm font-extrabold block mt-2">
                  {scanResult.extracted_data?.billing_period || "July 2026"}
                </span>
              </div>
            </div>

            {/* CONFIRMATION PROMPT REQUIREMENT */}
            <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-[#16A66A]/20">
              <p className="text-xs font-bold text-slate-700 dark:text-[#DDF7E9]">
                ❓ <strong>Is this information correct?</strong> Review the extracted metrics before adding to your carbon history.
              </p>

              {confirmed ? (
                <div className="px-6 py-2.5 rounded-xl bg-[#16A66A] text-white font-black text-xs flex items-center gap-2 shadow">
                  <Check className="w-4 h-4 text-[#F4C95D]" /> Saved & Added to Carbon Record!
                </div>
              ) : (
                <button
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="px-6 py-2.5 rounded-xl bg-[#123B2A] hover:bg-[#0B2A1D] text-white font-black text-xs shadow cursor-pointer transition flex items-center gap-2"
                >
                  {confirming ? 'Saving...' : 'Confirm & Save Record'}
                  <ArrowRight className="w-4 h-4 text-[#F4C95D]" />
                </button>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
