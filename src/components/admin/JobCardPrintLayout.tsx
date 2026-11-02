'use client';

import React from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Printer, Download, Share2, X, MessageSquare, ArrowLeft } from 'lucide-react';

interface JobCardPrintLayoutProps {
  jobCard: any;
  onClose: () => void;
  onShareWhatsApp: () => void;
}

export default function JobCardPrintLayout({
  jobCard,
  onClose,
  onShareWhatsApp,
}: JobCardPrintLayoutProps) {
  if (!jobCard) return null;

  // Parse arrays
  let serviceTypesArr: string[] = [];
  try {
    serviceTypesArr = typeof jobCard.serviceTypes === 'string' ? JSON.parse(jobCard.serviceTypes) : (jobCard.serviceTypes || []);
  } catch {
    serviceTypesArr = [];
  }

  let repairRequestsArr: any[] = [];
  try {
    repairRequestsArr = typeof jobCard.repairRequests === 'string' ? JSON.parse(jobCard.repairRequests) : (jobCard.repairRequests || []);
  } catch {
    repairRequestsArr = [];
  }

  // Ensure at least 8 rows for the physical paper aesthetic
  const minRows = Math.max(8, repairRequestsArr.length);
  const displayRows = Array.from({ length: minRows }, (_, idx) => repairRequestsArr[idx] || { regularRequest: '', specialRequest: '', actionTaken: '' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-start overflow-y-auto p-2 sm:p-6 print:p-0 print:bg-white print:static print:inset-auto">
      {/* Control Bar - Hidden when printing */}
      <div className="w-full max-w-[210mm] bg-white rounded-2xl p-4 mb-4 shadow-xl border border-gm-line flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gm-navy hover:bg-gm-soft border border-gm-line transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div>
            <b className="text-sm font-black text-gm-navy block">Job Card #{jobCard.jobCardNumber}</b>
            <span className="text-xs text-gm-muted">A4 Official Gurudev Motors Print & Detachable Gate Pass</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onShareWhatsApp}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </button>
          <button
            onClick={handlePrint}
            className="bg-gm-navy hover:bg-gm-navy/90 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save A4 PDF</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gm-muted hover:text-gm-navy hover:bg-gm-soft transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* A4 Sheet Container */}
      <div className="relative w-full max-w-[210mm] min-h-[297mm] bg-white p-6 sm:p-8 shadow-2xl border border-slate-300 text-slate-900 print:shadow-none print:border-none print:p-0 print:m-0 print:w-full print:max-w-none text-[11px] leading-tight select-text">
        {/* Centered Subtle Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <div className="opacity-[0.05] select-none flex flex-col items-center justify-center transform -rotate-12 scale-125">
            <img
              src="/images/logo.jpeg"
              alt="Watermark"
              className="w-[420px] max-w-full h-auto object-contain grayscale"
            />
            <span className="text-3xl font-black text-slate-900 tracking-widest uppercase mt-4">
              GURUDEV MOTORS
            </span>
          </div>
        </div>

        {/* Outer Border wrapping the Job Card */}
        <div className="relative z-10 border-2 border-black flex flex-col">
          {/* HEADER */}
          <div className="border-b-2 border-black p-3 text-center relative bg-white">
            <h1 className="text-xl font-black text-black tracking-wide uppercase">
              GURUDEV MOTORS
            </h1>
            <p className="text-[10px] font-bold text-slate-800 uppercase mt-0.5">
              NEW RAIPURA HOSPITAL KE SAMNE, GANESH MANDIR KE SAMNE GALI, RAIPURA, RAIPUR (C.G.) Mo. 7000619808
            </p>

            {/* Out date/time top right */}
            <div className="absolute right-3 top-2 text-right border border-black px-2 py-1 text-[9px] font-semibold bg-white">
              <span>out date/time: </span>
              <b className="underline font-mono">
                {jobCard.deliveryDate ? formatDate(jobCard.deliveryDate) : '____/____/____'} {jobCard.expectedDeliveryTime || ''}
              </b>
            </div>

            {/* Red Stamped Job Card Number */}
            <div className="absolute left-3 top-2">
              <span className="text-[9px] font-black uppercase text-slate-600 block">JOB CARD NO.</span>
              <span className="text-lg font-black text-red-600 font-mono tracking-widest border border-red-600 px-2 py-0.5 rounded bg-red-50/50 inline-block shadow-2xs">
                {jobCard.jobCardNumber}
              </span>
            </div>
          </div>

          {/* TWO COLUMN DETAILS GRID */}
          <div className="grid grid-cols-2 border-b-2 border-black">
            {/* LEFT: CUSTOMER DETAILS */}
            <div className="border-r-2 border-black">
              <div className="bg-slate-100 border-b border-black py-1 px-2 font-black text-center text-[10px] tracking-wider uppercase">
                CUSTOMER DETAILS
              </div>
              <div className="divide-y divide-black">
                <div className="grid grid-cols-4 p-1.5">
                  <span className="font-bold text-slate-700">Name</span>
                  <span className="col-span-3 font-black text-slate-900 uppercase">{jobCard.customer?.name}</span>
                </div>
                <div className="grid grid-cols-4 p-1.5 min-h-[42px]">
                  <span className="font-bold text-slate-700">Address</span>
                  <span className="col-span-3 font-medium text-slate-900">{jobCard.customer?.address || 'Raipura, Raipur (C.G.)'}</span>
                </div>
                <div className="grid grid-cols-4 p-1.5">
                  <span className="font-bold text-slate-700">Phone No.</span>
                  <span className="col-span-3 font-mono font-black text-slate-900">{jobCard.customer?.mobile}</span>
                </div>
                <div className="grid grid-cols-4 p-1.5">
                  <span className="font-bold text-slate-700">e-mail</span>
                  <span className="col-span-3 font-medium text-slate-900">{jobCard.customer?.email || '-'}</span>
                </div>
              </div>
            </div>

            {/* RIGHT: VEHICLE DETAILS */}
            <div>
              <div className="bg-slate-100 border-b border-black py-1 px-2 font-black text-center text-[10px] tracking-wider uppercase">
                VEHICLE DETAILS
              </div>
              <div className="divide-y divide-black text-[10px]">
                <div className="grid grid-cols-12 p-1">
                  <span className="col-span-4 font-bold text-slate-700">MODEL</span>
                  <span className="col-span-8 font-black uppercase">{jobCard.vehicleModel}</span>
                </div>
                <div className="grid grid-cols-12 p-1">
                  <span className="col-span-4 font-bold text-slate-700">TYPE KICK/SELF</span>
                  <span className="col-span-8 font-bold">{jobCard.vehicleTypeKickSelf || 'Self'}</span>
                </div>
                <div className="grid grid-cols-12 p-1">
                  <span className="col-span-4 font-bold text-slate-700">FRAME NO.</span>
                  <span className="col-span-8 font-mono font-bold uppercase">{jobCard.frameNumber || '-'}</span>
                </div>
                <div className="grid grid-cols-12 p-1">
                  <span className="col-span-4 font-bold text-slate-700">ENGINE NO.</span>
                  <span className="col-span-8 font-mono font-bold uppercase">{jobCard.engineNumber || '-'}</span>
                </div>
                <div className="grid grid-cols-12 p-1">
                  <span className="col-span-4 font-bold text-slate-700">COLOUR</span>
                  <span className="col-span-8 font-bold">{jobCard.colour || '-'}</span>
                </div>
                <div className="grid grid-cols-12 p-1">
                  <span className="col-span-4 font-bold text-slate-700">REGISTRATION NO.</span>
                  <span className="col-span-8 font-mono font-black text-red-700 uppercase">{jobCard.vehicleRegNumber}</span>
                </div>
                <div className="grid grid-cols-12 p-1">
                  <span className="col-span-4 font-bold text-slate-700">DATE OF SALE</span>
                  <span className="col-span-8">{jobCard.dateOfSale ? formatDate(jobCard.dateOfSale) : '-'}</span>
                </div>
                <div className="grid grid-cols-12 p-1">
                  <span className="col-span-4 font-bold text-slate-700">KMs. RUN</span>
                  <span className="col-span-8 font-mono font-black">{jobCard.kmReading} km</span>
                </div>
                <div className="grid grid-cols-12 p-1">
                  <span className="col-span-4 font-bold text-slate-700">KEY NO.</span>
                  <span className="col-span-8 font-mono">{jobCard.keyNumber || '-'}</span>
                </div>
                <div className="grid grid-cols-12 p-1">
                  <span className="col-span-4 font-bold text-slate-700">FREE SERVICE COUPON NO.</span>
                  <span className="col-span-8 font-mono">{jobCard.freeCouponNumber || '-'}</span>
                </div>
                <div className="grid grid-cols-12 p-1">
                  <span className="col-span-4 font-bold text-slate-700">SELLING DEALER</span>
                  <span className="col-span-8 font-bold">{jobCard.sellingDealer || 'Gurudev Motors'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* TYPE OF SERVICE & PHYSICAL/PAINT CONDITION */}
          <div className="border-b-2 border-black grid grid-cols-12 bg-white">
            <div className="col-span-7 p-2 border-r-2 border-black space-y-1.5">
              <span className="font-black text-[9px] uppercase tracking-wider block text-slate-700">
                TYPE OF SERVICE:
              </span>
              <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-[10px]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    readOnly
                    checked={serviceTypesArr.includes('Free Service')}
                    className="accent-black w-3.5 h-3.5"
                  />
                  <span>Free Service no. ______</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    readOnly
                    checked={serviceTypesArr.includes('Paid Service')}
                    className="accent-black w-3.5 h-3.5"
                  />
                  <span>Paid Service no. ______</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    readOnly
                    checked={serviceTypesArr.includes('Extended Warranty')}
                    className="accent-black w-3.5 h-3.5"
                  />
                  <span>Extended Warranty</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    readOnly
                    checked={serviceTypesArr.includes('AMC')}
                    className="accent-black w-3.5 h-3.5"
                  />
                  <span>AMC</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    readOnly
                    checked={serviceTypesArr.includes('Accidental Repair')}
                    className="accent-black w-3.5 h-3.5"
                  />
                  <span>Accidental</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    readOnly
                    checked={serviceTypesArr.includes('General Repair')}
                    className="accent-black w-3.5 h-3.5"
                  />
                  <span>General Repair</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer col-span-2">
                  <input
                    type="checkbox"
                    readOnly
                    checked={serviceTypesArr.includes('Complaint')}
                    className="accent-black w-3.5 h-3.5"
                  />
                  <span>Complaint</span>
                </label>
              </div>
            </div>

            <div className="col-span-5 p-2 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <span className="font-black text-[9px] uppercase tracking-wider block text-slate-700">
                  PHYSICAL &amp; PAINT CONDITION OF VEHICLE
                </span>
                <p className="text-[10px] mt-1 font-medium italic text-slate-900 min-h-[30px]">
                  {jobCard.physicalCondition || 'Scratch / dent free. Normal road dirt, standard factory fittings intact.'}
                </p>
              </div>

              <div className="text-right">
                <span className="text-lg font-black text-red-600 font-mono tracking-widest">
                  {jobCard.jobCardNumber}
                </span>
              </div>
            </div>
          </div>

          {/* DYNAMIC 3-COLUMN TABLE */}
          <div className="border-b-2 border-black">
            <div className="grid grid-cols-12 bg-slate-100 border-b border-black text-center font-black text-[9.5px] uppercase tracking-wider divide-x-2 divide-black">
              <div className="col-span-4 p-1.5">REGULAR CUSTOMER REQUEST</div>
              <div className="col-span-4 p-1.5">CUSTOMER SPECIAL REQUEST/COMMENTS</div>
              <div className="col-span-4 p-1.5">REPAIR ADVICE/ACTION TAKEN</div>
            </div>

            <div className="divide-y divide-slate-400">
              {displayRows.map((row, rIdx) => (
                <div key={rIdx} className="grid grid-cols-12 divide-x-2 divide-black min-h-[24px] text-[10px]">
                  <div className="col-span-4 p-1 font-medium">{row.regularRequest || ''}</div>
                  <div className="col-span-4 p-1 text-slate-800">{row.specialRequest || ''}</div>
                  <div className="col-span-4 p-1 text-slate-800">{row.actionTaken || ''}</div>
                </div>
              ))}
            </div>
          </div>

          {/* SIGNATURES, ESTIMATES & AUTHORISATION GRID */}
          <div className="divide-y-2 divide-black bg-white">
            {/* Advisor & Test Ride Row */}
            <div className="grid grid-cols-12 divide-x-2 divide-black text-[9px]">
              <div className="col-span-3 p-1.5">
                <span className="text-slate-600 block">Service Advisor Name:</span>
                <b className="text-[10px]">{jobCard.serviceAdvisorName || jobCard.advisor?.name || 'Staff'}</b>
              </div>
              <div className="col-span-3 p-1.5">
                <span className="text-slate-600 block">Test ride taken at time of jobcard opening:</span>
                <b>{jobCard.testRideOpening ? 'YES [✓]' : 'NO [ ]'}</b>
              </div>
              <div className="col-span-2 p-1.5 text-center">
                <span className="text-slate-600 block">Signature of Service Advisor</span>
                <span className="font-script text-xs mt-1 block italic">{jobCard.serviceAdvisorName || 'S.Advisor'}</span>
              </div>
              <div className="col-span-2 p-1.5">
                <span className="text-slate-600 block">Test ride before start of work by floor supervisor:</span>
                <b>{jobCard.testRideSupervisor ? 'YES [✓]' : 'NO [ ]'}</b>
              </div>
              <div className="col-span-2 p-1.5 text-center">
                <span className="text-slate-600 block">Signature of floor supervisor</span>
                <span className="font-script text-xs mt-1 block italic">{jobCard.supervisorName || 'Supervisor'}</span>
              </div>
            </div>

            {/* Supervisor, Technician, Estimate, Payment Details */}
            <div className="grid grid-cols-12 divide-x-2 divide-black text-[9.5px]">
              <div className="col-span-4 p-1.5 space-y-1">
                <div>
                  <span className="text-slate-600">Supervisor Name: </span>
                  <b>{jobCard.supervisorName || 'Workshop Head'}</b>
                </div>
                <div className="border-t border-slate-300 pt-1 text-[8.5px] leading-tight text-slate-600">
                  I authorise above work to be done at my cost. also authorise the vehicle to be stored repaired and driven at my risk.
                </div>
                <div className="flex justify-between items-end pt-2 text-[9px]">
                  <span>Date: {formatDate(jobCard.createdAt)}</span>
                  <span className="font-bold underline">Customer Signature</span>
                </div>
              </div>

              <div className="col-span-4 p-1.5 space-y-1">
                <div>
                  <span className="text-slate-600">Technician Name: </span>
                  <b>{jobCard.technicianName || 'Master Tech'}</b>
                </div>
                <div className="border-t border-slate-300 pt-1 text-[8.5px] leading-tight text-slate-600">
                  I Certify that work has been done to my satisfaction and I have taken delivery of my vehicle.
                </div>
                <div className="flex justify-between items-end pt-2 text-[9px]">
                  <span>Date: ___________</span>
                  <span className="font-bold underline">Customer Signature</span>
                </div>
              </div>

              <div className="col-span-4 p-1.5 space-y-1 bg-slate-50/50">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Estimated Cost Rs.:</span>
                  <b className="text-sm font-black text-black font-mono">₹{jobCard.finalTotal || jobCard.estimateAmount}</b>
                </div>
                <div className="text-[9px] flex items-center gap-2 pt-0.5">
                  <span className="font-bold text-slate-600">Payment:</span>
                  <span>Cash [✓]</span>
                  <span>Card [ ]</span>
                  <span>Credit [ ]</span>
                  <span>Warranty [ ]</span>
                </div>
                <div className="grid grid-cols-2 gap-1 pt-1 border-t border-slate-300 text-[9px]">
                  <div>Invoice No.: <b>{jobCard.invoiceNumber || '-'}</b></div>
                  <div>GATE PASS NO.: <b>{jobCard.gatePassNumber || `GP-${jobCard.jobCardNumber}`}</b></div>
                </div>
                <div className="text-right text-[8.5px] text-slate-600 pt-1">
                  Cashiers Signature: __________________
                </div>
              </div>
            </div>
          </div>

          {/* DETACHABLE SCISSORS LINE */}
          <div className="relative py-2 text-center bg-white">
            <div className="absolute inset-x-0 top-1/2 border-b-2 border-dashed border-slate-500" />
            <span className="relative z-10 bg-white px-3 text-[9px] font-black uppercase tracking-widest text-slate-600">
              ✂ DETACHABLE CUSTOMER COPY / GATE PASS SLIP ✂
            </span>
          </div>

          {/* DETACHABLE BOTTOM SLIP */}
          <div className="p-3 bg-white border-t-2 border-black">
            <div className="flex justify-between items-start gap-2 border-b border-black pb-2">
              <div className="border border-black p-1.5 text-center w-64 bg-slate-50/50">
                <b className="text-xs font-black uppercase block tracking-wider">GURUDEV MOTORS</b>
                <span className="text-[8.5px] font-bold text-slate-700 block uppercase">
                  MAHADEVGHAT CHOWK, RAIPURA, RAIPUR (C.G.) Mo. 7000619808
                </span>
              </div>

              <div className="text-right flex-1">
                <div className="flex justify-between items-center">
                  <b className="text-xs font-black uppercase tracking-wider">CUSTOMER COPY/GATE PASS</b>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-slate-600 mr-1.5">JOB CARD NO.</span>
                    <span className="text-base font-black text-red-600 font-mono tracking-widest">
                      {jobCard.jobCardNumber}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-[9.5px] mt-1 pt-1 border-t border-slate-300">
                  <span>DATE: <b>{formatDate(jobCard.createdAt)}</b></span>
                  <span>VEHICLE NO.: <b className="font-mono text-black">{jobCard.vehicleRegNumber}</b></span>
                </div>
              </div>
            </div>

            {/* Slip details grid */}
            <div className="grid grid-cols-12 gap-2 pt-2 text-[9px]">
              <div className="col-span-5 border-r border-slate-300 pr-2 space-y-0.5">
                <div className="font-bold text-slate-800">Work Shop Timing : 10.00 am to 7.00 pm</div>
                <div className="text-slate-600">Lunch : 1.00 pm to 2.00 pm</div>
                <div className="text-slate-600">Sunday : 10.00 am to 5.00 pm</div>
              </div>

              <div className="col-span-7 grid grid-cols-2 gap-y-1.5 gap-x-2 text-[9.5px]">
                <div>
                  <span className="text-slate-600 block text-[8.5px]">Estimated Delivery Time:</span>
                  <b>{jobCard.expectedDeliveryTime || '05:30 PM'}</b>
                </div>
                <div>
                  <span className="text-slate-600 block text-[8.5px]">Estimated Cost:</span>
                  <b className="text-sm font-black text-black font-mono">₹{jobCard.finalTotal || jobCard.estimateAmount}</b>
                </div>
                <div>
                  <span className="text-slate-600 block text-[8.5px]">Service Advisor:</span>
                  <b>{jobCard.serviceAdvisorName || jobCard.advisor?.name || 'Staff'}</b>
                </div>
                <div className="text-right">
                  <span className="text-slate-600 block text-[8.5px]">Customer's signature:</span>
                  <span className="font-bold underline">____________________</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
