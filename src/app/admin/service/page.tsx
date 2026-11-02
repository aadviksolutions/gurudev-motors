'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Wrench,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  User,
  FileText,
  Settings,
  ShieldAlert,
  CalendarCheck,
  Phone,
  Car,
  AlertCircle,
  RefreshCw,
  Printer,
  ChevronRight,
  ArrowRight,
  Trash2,
  Share2,
  MessageSquare,
  Eye,
  Calendar,
  X,
  MapPin,
  Check,
  CreditCard,
  Hash,
  Edit3,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import JobCardPrintLayout from '@/components/admin/JobCardPrintLayout';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

type ServiceTab = 'JOBS' | 'CREATE' | 'APPOINTMENTS';

interface RepairRequestRow {
  regularRequest: string;
  specialRequest: string;
  actionTaken: string;
}

interface WorkItemRow {
  description: string;
  quantity: number;
  labourCharges: number;
  partsCharges: number;
  total: number;
}

export default function AdminServicePage() {
  const [activeTab, setActiveTab] = useState<ServiceTab>('JOBS');
  const [jobCards, setJobCards] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [stageFilter, setStageFilter] = useState('ALL');
  const [appointmentFilter, setAppointmentFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modals & Active Selections
  const [selectedJc, setSelectedJc] = useState<any | null>(null);
  const [printJc, setPrintJc] = useState<any | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editJc, setEditJc] = useState<any | null>(null);

  // Edit Job Card Modal State (for adding additional servicing work)
  const [editWorkItems, setEditWorkItems] = useState<WorkItemRow[]>([]);
  const [editRepairRequests, setEditRepairRequests] = useState<RepairRequestRow[]>([]);
  const [editStatus, setEditStatus] = useState('WORK_IN_PROGRESS');
  const [editTechnician, setEditTechnician] = useState('');
  const [editSupervisor, setEditSupervisor] = useState('');
  const [editDeliveryDate, setEditDeliveryDate] = useState('');
  const [editDeliveryTime, setEditDeliveryTime] = useState('');
  const [editDiscount, setEditDiscount] = useState('0');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Success Confirmation Notification
  const [successBanner, setSuccessBanner] = useState<string>('');

  // FORM STATE: Physical Job Card Fields
  const [customJobCardNumber, setCustomJobCardNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Vehicle Details
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleTypeKickSelf, setVehicleTypeKickSelf] = useState('Self');
  const [frameNumber, setFrameNumber] = useState('');
  const [engineNumber, setEngineNumber] = useState('');
  const [colour, setColour] = useState('Standard');
  const [vehicleRegNumber, setVehicleRegNumber] = useState('');
  const [dateOfSale, setDateOfSale] = useState('');
  const [kmReading, setKmReading] = useState('0');
  const [keyNumber, setKeyNumber] = useState('');
  const [freeCouponNumber, setFreeCouponNumber] = useState('');
  const [sellingDealer, setSellingDealer] = useState('Gurudev Motors');

  // Service Types (Checkboxes)
  const [serviceTypes, setServiceTypes] = useState<string[]>(['Paid Service']);
  const [freeServiceNo, setFreeServiceNo] = useState('');
  const [paidServiceNo, setPaidServiceNo] = useState('');
  const [physicalCondition, setPhysicalCondition] = useState('');

  // 3-Column Dynamic Requests Table
  const [repairRequests, setRepairRequests] = useState<RepairRequestRow[]>([
    { regularRequest: 'Engine oil and filter change', specialRequest: 'Check chain slackness', actionTaken: 'Adjusted and lubed chain' },
    { regularRequest: 'Front & Rear brake inspection', specialRequest: 'Brake squeak on low speed', actionTaken: 'Cleaned brake pads' },
    { regularRequest: 'General wash & polish', specialRequest: 'Battery voltage check', actionTaken: 'Battery terminals cleaned' },
  ]);

  // Dynamic Work Items & Estimates Table
  const [workItems, setWorkItems] = useState<WorkItemRow[]>([
    { description: 'Synthetic 10W-30 4T Engine Oil', quantity: 1, labourCharges: 150, partsCharges: 450, total: 600 },
    { description: 'OEM Oil Filter Element', quantity: 1, labourCharges: 50, partsCharges: 120, total: 170 },
    { description: 'General Periodic Maintenance Labour', quantity: 1, labourCharges: 350, partsCharges: 0, total: 350 },
  ]);

  // Estimates & Delivery Details
  const [discount, setDiscount] = useState('0');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [expectedDeliveryTime, setExpectedDeliveryTime] = useState('05:30 PM');
  const [serviceAdvisorName, setServiceAdvisorName] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [supervisorName, setSupervisorName] = useState('Workshop Head');
  const [status, setStatus] = useState('RECEIVED');
  const [paymentDetails, setPaymentDetails] = useState('Cash');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [gatePassNumber, setGatePassNumber] = useState('');

  // Signatures & Test Rides
  const [testRideOpening, setTestRideOpening] = useState(true);
  const [testRideSupervisor, setTestRideSupervisor] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-calculated totals
  const calculatedLabour = useMemo(() => {
    return workItems.reduce((acc, row) => acc + (Number(row.labourCharges) || 0), 0);
  }, [workItems]);

  const calculatedParts = useMemo(() => {
    return workItems.reduce((acc, row) => acc + ((Number(row.partsCharges) || 0) * (Number(row.quantity) || 1)), 0);
  }, [workItems]);

  const calculatedDiscount = Number(discount) || 0;
  const subTotalBeforeTax = Math.max(0, calculatedLabour + calculatedParts - calculatedDiscount);
  const gstTax = Math.round(subTotalBeforeTax * 0.18);
  const finalTotalAmount = subTotalBeforeTax + gstTax;

  // Auto-calculated totals for editing job card
  const editCalculatedLabour = useMemo(() => {
    return editWorkItems.reduce((acc, row) => acc + (Number(row.labourCharges) || 0), 0);
  }, [editWorkItems]);

  const editCalculatedParts = useMemo(() => {
    return editWorkItems.reduce((acc, row) => acc + ((Number(row.partsCharges) || 0) * (Number(row.quantity) || 1)), 0);
  }, [editWorkItems]);

  const editCalculatedDiscount = Number(editDiscount) || 0;
  const editSubTotal = Math.max(0, editCalculatedLabour + editCalculatedParts - editCalculatedDiscount);
  const editGst = Math.round(editSubTotal * 0.18);
  const editFinalTotal = editSubTotal + editGst;

  // Fetch initial data
  const fetchJobCards = async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams();
      if (stageFilter !== 'ALL') params.set('status', stageFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/service-jobs?${params.toString()}`);
      const data = await res.json();
      if (data.success) setJobCards(data.jobCards);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams();
      if (appointmentFilter !== 'ALL') params.set('status', appointmentFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/service-bookings?${params.toString()}`);
      const data = await res.json();
      if (data.success) setAppointments(data.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (data.success) setEmployees(data.employees || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (data.success) setCustomers(data.customers || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobCards();
    fetchAppointments();
    fetchEmployees();
    fetchCustomers();
  }, []);

  useEffect(() => {
    fetchJobCards();
  }, [stageFilter, search]);

  useEffect(() => {
    fetchAppointments();
  }, [appointmentFilter, search]);

  // Quick lookup customer on phone / name typing
  const handleMobileChange = (mobileInput: string) => {
    setCustomerMobile(mobileInput);
    const clean = mobileInput.replace(/[^0-9]/g, '');
    if (clean.length >= 10) {
      const match = customers.find((c) => c.mobile.includes(clean));
      if (match) {
        if (!customerName) setCustomerName(match.name);
        if (!customerAddress && match.address) setCustomerAddress(match.address);
        if (!customerEmail && match.email) setCustomerEmail(match.email);
      }
    }
  };

  // Toggle Service Type
  const toggleServiceType = (type: string) => {
    setServiceTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Add Request Row
  const addRequestRow = () => {
    setRepairRequests([...repairRequests, { regularRequest: '', specialRequest: '', actionTaken: '' }]);
  };

  const updateRequestRow = (idx: number, field: keyof RepairRequestRow, val: string) => {
    const updated = [...repairRequests];
    updated[idx][field] = val;
    setRepairRequests(updated);
  };

  const removeRequestRow = (idx: number) => {
    if (repairRequests.length <= 1) return;
    setRepairRequests(repairRequests.filter((_, i) => i !== idx));
  };

  // Add Work Item Row
  const addWorkItemRow = () => {
    setWorkItems([
      ...workItems,
      { description: '', quantity: 1, labourCharges: 0, partsCharges: 0, total: 0 },
    ]);
  };

  const updateWorkItemRow = (idx: number, field: keyof WorkItemRow, val: any) => {
    const updated = [...workItems];
    (updated[idx] as any)[field] = val;
    const qty = Number(updated[idx].quantity) || 1;
    const lab = Number(updated[idx].labourCharges) || 0;
    const parts = Number(updated[idx].partsCharges) || 0;
    updated[idx].total = lab + (parts * qty);
    setWorkItems(updated);
  };

  const removeWorkItemRow = (idx: number) => {
    if (workItems.length <= 1) return;
    setWorkItems(workItems.filter((_, i) => i !== idx));
  };

  // EDIT MODAL HELPERS & HANDLERS
  const openEditJobCard = (jc: any) => {
    setEditJc(jc);
    let parsedWork: WorkItemRow[] = [];
    try {
      parsedWork = typeof jc.workItems === 'string' ? JSON.parse(jc.workItems) : (jc.workItems || []);
    } catch {
      parsedWork = [];
    }
    if (!Array.isArray(parsedWork) || parsedWork.length === 0) {
      parsedWork = [{ description: 'General Periodic Maintenance Labour', quantity: 1, labourCharges: 350, partsCharges: 0, total: 350 }];
    }

    let parsedReqs: RepairRequestRow[] = [];
    try {
      parsedReqs = typeof jc.repairRequests === 'string' ? JSON.parse(jc.repairRequests) : (jc.repairRequests || []);
    } catch {
      parsedReqs = [];
    }
    if (!Array.isArray(parsedReqs) || parsedReqs.length === 0) {
      parsedReqs = [{ regularRequest: jc.complaints || 'Periodic Maintenance', specialRequest: '', actionTaken: '' }];
    }

    setEditWorkItems(parsedWork);
    setEditRepairRequests(parsedReqs);
    setEditStatus(jc.status || 'WORK_IN_PROGRESS');
    setEditTechnician(jc.technicianName || '');
    setEditSupervisor(jc.supervisorName || 'Workshop Head');
    setEditDeliveryDate(jc.deliveryDate ? jc.deliveryDate.split('T')[0] : '');
    setEditDeliveryTime(jc.expectedDeliveryTime || '05:30 PM');
    setEditDiscount(String(jc.discount || 0));
    setEditError('');
    setEditModalOpen(true);
  };

  const addEditRequestRow = () => {
    setEditRepairRequests([...editRepairRequests, { regularRequest: '', specialRequest: '', actionTaken: '' }]);
  };

  const updateEditRequestRow = (idx: number, field: keyof RepairRequestRow, val: string) => {
    const updated = [...editRepairRequests];
    updated[idx][field] = val;
    setEditRepairRequests(updated);
  };

  const removeEditRequestRow = (idx: number) => {
    if (editRepairRequests.length <= 1) return;
    setEditRepairRequests(editRepairRequests.filter((_, i) => i !== idx));
  };

  const addEditWorkItemRow = () => {
    setEditWorkItems([
      ...editWorkItems,
      { description: '', quantity: 1, labourCharges: 0, partsCharges: 0, total: 0 },
    ]);
  };

  const updateEditWorkItemRow = (idx: number, field: keyof WorkItemRow, val: any) => {
    const updated = [...editWorkItems];
    (updated[idx] as any)[field] = val;
    const qty = Number(updated[idx].quantity) || 1;
    const lab = Number(updated[idx].labourCharges) || 0;
    const parts = Number(updated[idx].partsCharges) || 0;
    updated[idx].total = lab + (parts * qty);
    setEditWorkItems(updated);
  };

  const removeEditWorkItemRow = (idx: number) => {
    if (editWorkItems.length <= 1) return;
    setEditWorkItems(editWorkItems.filter((_, i) => i !== idx));
  };

  const handleSaveJobCardEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editJc) return;
    setEditSaving(true);
    setEditError('');

    try {
      const res = await fetch('/api/service-jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editJc.id,
          status: editStatus,
          technicianName: editTechnician.trim(),
          supervisorName: editSupervisor.trim(),
          deliveryDate: editDeliveryDate || undefined,
          expectedDeliveryTime: editDeliveryTime.trim(),
          discount: Number(editDiscount) || 0,
          workItems: editWorkItems.filter((w) => w.description || w.labourCharges || w.partsCharges),
          repairRequests: editRepairRequests.filter((r) => r.regularRequest || r.specialRequest || r.actionTaken),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update job card');
      }

      setSuccessBanner(`Job Card #${editJc.jobCardNumber} updated successfully!`);
      fetchJobCards();
      setEditModalOpen(false);
      if (selectedJc?.id === editJc.id) {
        setSelectedJc(data.jobCard);
      }
    } catch (err: any) {
      setEditError(err.message || 'Error updating job card');
    } finally {
      setEditSaving(false);
    }
  };

  // SUBMIT NEW JOB CARD
  const handleCreateJobCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim() || !customerMobile.trim() || !vehicleRegNumber.trim() || !vehicleModel.trim()) {
      setErrorMsg('Please enter Customer Name, Mobile Number, Vehicle Registration and Model.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customJobCardNumber: customJobCardNumber.trim() || undefined,
        customerName: customerName.trim(),
        customerMobile: customerMobile.trim(),
        customerAddress: customerAddress.trim(),
        customerEmail: customerEmail.trim(),
        vehicleRegNumber: vehicleRegNumber.toUpperCase().trim(),
        vehicleModel: vehicleModel.trim(),
        vehicleTypeKickSelf,
        frameNumber: frameNumber.trim(),
        engineNumber: engineNumber.trim(),
        colour,
        dateOfSale: dateOfSale || undefined,
        kmReading: Number(kmReading) || 0,
        keyNumber: keyNumber.trim(),
        freeCouponNumber: freeCouponNumber.trim(),
        sellingDealer: sellingDealer.trim(),
        serviceTypes,
        serviceTypeNumbers: { freeServiceNo, paidServiceNo },
        physicalCondition: physicalCondition.trim(),
        repairRequests: repairRequests.filter((r) => r.regularRequest || r.specialRequest || r.actionTaken),
        workItems: workItems.filter((w) => w.description || w.labourCharges || w.partsCharges),
        labourTotal: calculatedLabour,
        partsTotal: calculatedParts,
        discount: calculatedDiscount,
        estimateAmount: finalTotalAmount,
        deliveryDate: deliveryDate || undefined,
        expectedDeliveryTime,
        serviceAdvisorName: serviceAdvisorName.trim(),
        technicianName: technicianName.trim(),
        supervisorName: supervisorName.trim(),
        status,
        paymentDetails,
        invoiceNumber: invoiceNumber.trim(),
        gatePassNumber: gatePassNumber.trim(),
        testRideOpening,
        testRideSupervisor,
      };

      const res = await fetch('/api/service-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create Job Card');
      }

      setSuccessBanner(`Job Card #${data.jobCard.jobCardNumber} created successfully!`);
      fetchJobCards();
      setActiveTab('JOBS');
      setSelectedJc(data.jobCard);

      // Reset form
      setCustomJobCardNumber('');
      setCustomerName('');
      setCustomerMobile('');
      setCustomerAddress('');
      setCustomerEmail('');
      setVehicleRegNumber('');
      setVehicleModel('');
      setFrameNumber('');
      setEngineNumber('');
      setKmReading('0');
      setPhysicalCondition('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating job card');
    } finally {
      setSubmitting(false);
    }
  };

  // UPDATE STATUS
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/service-jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchJobCards();
        if (selectedJc?.id === id) setSelectedJc(data.jobCard);
        if (editJc?.id === id) setEditJc(data.jobCard);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // WHATSAPP SHARE GENERATOR
  const generateWhatsAppMessage = (jc: any) => {
    let itemsStr = '';
    try {
      const parsed = typeof jc.workItems === 'string' ? JSON.parse(jc.workItems) : jc.workItems;
      if (Array.isArray(parsed) && parsed.length > 0) {
        itemsStr = parsed.map((item: any, i: number) => `• ${item.description || 'Service work'} (₹${item.total || 0})`).join('\n');
      }
    } catch {}

    if (!itemsStr) {
      itemsStr = `• Regular service & vehicle inspection`;
    }

    const deliveryStr = jc.deliveryDate
      ? `${formatDate(jc.deliveryDate)} at ${jc.expectedDeliveryTime || '05:30 PM'}`
      : `${jc.expectedDeliveryTime || '05:30 PM today'}`;

    return `GURUDEV MOTORS – SERVICE JOB CARD

Dear ${jc.customer?.name || 'Customer'},

Your vehicle has been received for service at Gurudev Motors.

Job Card No.: ${jc.jobCardNumber}
Vehicle: ${jc.vehicleModel}
Registration No.: ${jc.vehicleRegNumber}

Estimated Work:
${itemsStr}

Estimated Cost: ₹${jc.finalTotal || jc.estimateAmount || 0}

Expected Delivery:
${deliveryStr}

Our service team will keep you updated regarding any additional repairs or changes to the estimate.

Thank you for choosing Gurudev Motors.
Workshop Helpline: 7000619808
New Raipura, Raipur (C.G.)`;
  };

  const handleShareWhatsApp = (jc: any) => {
    const rawMobile = jc.customer?.mobile || '';
    const clean = rawMobile.replace(/[^0-9]/g, '');
    if (!clean || clean.length < 10) {
      alert(`Customer mobile number "${rawMobile}" is invalid. Please check and update customer details.`);
      return;
    }
    const phoneWithCountry = clean.length === 10 ? `91${clean}` : clean;
    const msg = generateWhatsAppMessage(jc);
    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Convert Service Appointment into a Job Card directly
  const handleConvertAppointmentToJobCard = (apt: any) => {
    setCustomerName(apt.customerName || apt.customer?.name || '');
    setCustomerMobile(apt.mobile || apt.customer?.mobile || '');
    setVehicleRegNumber(apt.regNumber || '');
    setVehicleModel(apt.vehicleModel || '');
    setPhysicalCondition(apt.serviceType ? `Service Type: ${apt.serviceType}. ${apt.notes || ''}` : apt.notes || '');
    setStatus('RECEIVED');
    setActiveTab('CREATE');
  };

  const stages = [
    'ALL',
    'CREATED',
    'RECEIVED',
    'INSPECTION',
    'ESTIMATE',
    'APPROVED',
    'WORK_IN_PROGRESS',
    'QUALITY_CHECK',
    'READY',
    'DELIVERED',
    'CANCELLED',
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Printable Layout Modal */}
        {printJc && (
          <JobCardPrintLayout
            jobCard={printJc}
            onClose={() => setPrintJc(null)}
            onShareWhatsApp={() => handleShareWhatsApp(printJc)}
          />
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gm-navy tracking-tight flex items-center gap-2">
              <Wrench className="w-6 h-6 text-gm-red" />
              Job Card & Workshop Floor Management
            </h1>
            <p className="text-xs text-gm-muted mt-0.5">
              Official Gurudev Motors Job Card issuance, multi-row customer requests, estimates, A4 printable job cards with detachable gate pass, and WhatsApp updates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => (activeTab === 'APPOINTMENTS' ? fetchAppointments() : fetchJobCards())}
              disabled={refreshing}
              className="bg-white border border-gm-line hover:border-gm-navy text-gm-navy text-xs font-bold px-3 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => {
                setErrorMsg('');
                setActiveTab('CREATE');
              }}
              className="bg-gm-red hover:bg-gm-red-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Job Card</span>
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {successBanner && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-800 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successBanner}</span>
            </div>
            <button
              onClick={() => setSuccessBanner('')}
              className="text-emerald-700 hover:text-emerald-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex gap-2 border-b border-gm-line pb-3">
          <button
            onClick={() => setActiveTab('JOBS')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'JOBS'
                ? 'bg-gm-navy text-white shadow-xs'
                : 'text-gm-muted hover:text-gm-navy hover:bg-gm-soft'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Active Job Cards Registry ({jobCards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('CREATE')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'CREATE'
                ? 'bg-gm-navy text-white shadow-xs'
                : 'text-gm-muted hover:text-gm-navy hover:bg-gm-soft'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Issue New Job Card (Physical Form)</span>
          </button>

          <button
            onClick={() => setActiveTab('APPOINTMENTS')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'APPOINTMENTS'
                ? 'bg-gm-navy text-white shadow-xs'
                : 'text-gm-muted hover:text-gm-navy hover:bg-gm-soft'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Service Appointments ({appointments.length})</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: ACTIVE JOB CARDS REGISTRY                                          */}
        {/* ========================================================================= */}
        {activeTab === 'JOBS' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white rounded-2xl p-4 border border-gm-line shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gm-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Job Card #, Customer Name, Mobile, Registration # or Vehicle Model..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                <span className="text-[11px] font-bold text-gm-muted whitespace-nowrap">Stage:</span>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gm-line text-xs font-bold text-gm-navy bg-white focus:outline-none"
                >
                  {stages.map((st) => (
                    <option key={st} value={st}>
                      {st.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Job Cards Table */}
            <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gm-line bg-gm-soft/60 text-gm-navy uppercase tracking-wider text-[10px] font-black">
                      <th className="p-3.5">Job Card No.</th>
                      <th className="p-3.5">Customer &amp; Mobile</th>
                      <th className="p-3.5">Vehicle Details</th>
                      <th className="p-3.5">Est. Delivery</th>
                      <th className="p-3.5">Amount (₹)</th>
                      <th className="p-3.5">Stage / Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gm-line">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gm-muted">Loading Job Cards...</td>
                      </tr>
                    ) : jobCards.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gm-muted">
                          No job cards found matching current filters.
                        </td>
                      </tr>
                    ) : (
                      jobCards.map((jc) => (
                        <tr key={jc.id} className="hover:bg-gm-soft/30 transition-colors">
                          <td className="p-3.5">
                            <span className="font-mono font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-xs">
                              {jc.jobCardNumber}
                            </span>
                            <span className="text-[10px] text-gm-muted block mt-1">
                              {formatDate(jc.createdAt)}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <b className="text-gm-navy font-bold block">{jc.customer?.name}</b>
                            <span className="text-gm-muted font-mono text-[11px] block">{jc.customer?.mobile}</span>
                            {jc.customer?.address && (
                              <span className="text-[10px] text-gm-muted truncate block max-w-[180px]">
                                {jc.customer?.address}
                              </span>
                            )}
                          </td>

                          <td className="p-3.5">
                            <b className="text-gm-navy font-bold block">{jc.vehicleModel}</b>
                            <span className="text-red-700 font-mono font-black text-[11px] uppercase bg-slate-100 px-1.5 py-0.2 rounded inline-block">
                              {jc.vehicleRegNumber}
                            </span>
                            <span className="text-[10px] text-gm-muted block mt-0.5">
                              {jc.kmReading} km • {jc.colour || 'Standard'}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <span className="font-bold text-gm-navy block">
                              {jc.deliveryDate ? formatDate(jc.deliveryDate) : 'Today'}
                            </span>
                            <span className="text-[11px] text-gm-muted block font-medium">
                              {jc.expectedDeliveryTime || '05:30 PM'}
                            </span>
                          </td>

                          <td className="p-3.5 font-mono font-black text-gm-navy">
                            ₹{jc.finalTotal || jc.estimateAmount}
                          </td>

                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${getStatusColor(jc.status)}`}>
                              {jc.status.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] text-gm-muted block mt-1">
                              Advisor: {jc.serviceAdvisorName || jc.advisor?.name || 'Staff'}
                            </span>
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleShareWhatsApp(jc)}
                                title="Share on WhatsApp"
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => openEditJobCard(jc)}
                                title="Edit Job Card & Add Servicing Work"
                                className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 border border-amber-300 transition-colors flex items-center gap-1 text-[11px] font-bold"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                                <span className="hidden sm:inline">Edit Work</span>
                              </button>

                              <button
                                onClick={() => setPrintJc(jc)}
                                title="Print / Download A4 PDF"
                                className="p-1.5 rounded-lg text-gm-navy hover:bg-gm-soft border border-gm-line transition-colors flex items-center gap-1 text-[11px] font-bold"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Print / PDF</span>
                              </button>

                              <button
                                onClick={() => setSelectedJc(jc)}
                                title="View Details"
                                className="p-1.5 rounded-lg text-gm-navy hover:bg-gm-soft border border-gm-line transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CREATE NEW JOB CARD (MATCHING PHYSICAL FORM EXACTLY)               */}
        {/* ========================================================================= */}
        {activeTab === 'CREATE' && (
          <form onSubmit={handleCreateJobCard} className="space-y-6">
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Card 1: Header / Pad Reference */}
            <div className="bg-white rounded-2xl p-5 border border-gm-line shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gm-line pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-gm-red tracking-wider">Gurudev Motors Dealership</span>
                  <h2 className="text-lg font-black text-gm-navy uppercase tracking-tight">New Physical Job Card Entry</h2>
                  <p className="text-xs text-gm-muted">Raipura, Raipur (C.G.) • Mo. 7000619808</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full lg:w-auto">
                  <div>
                    <label className="block text-[11px] font-black uppercase text-amber-950 flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-amber-700" />
                      <span>Job Card Number (Manual Stamp / Optional)</span>
                    </label>
                    <span className="text-[10px] text-amber-800">
                      Physical slip number (e.g. <b className="font-mono text-red-600">0816</b>). Leave blank to auto-generate.
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 0816 (Optional)"
                    value={customJobCardNumber}
                    onChange={(e) => setCustomJobCardNumber(e.target.value)}
                    className="w-full sm:w-44 px-3 py-1.5 rounded-xl border border-amber-300 font-mono font-black text-xs text-red-600 bg-white uppercase placeholder:text-slate-400 placeholder:normal-case shadow-xs"
                  />
                </div>
              </div>

              {/* Two Column Section: Customer Details & Vehicle Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Customer Details */}
                <div className="space-y-3 bg-gm-soft/40 p-4 rounded-xl border border-gm-line">
                  <h3 className="text-xs font-black text-gm-navy uppercase tracking-wider border-b border-gm-line pb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gm-red" />
                    <span>Customer Details</span>
                  </h3>

                  <div>
                    <label className="block text-[11px] font-bold text-gm-navy mb-1">Customer Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={customerMobile}
                      onChange={(e) => handleMobileChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-mono font-bold bg-white"
                    />
                    <span className="text-[10px] text-gm-muted mt-0.5 block">Auto-fetches details for repeat customers</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gm-navy mb-1">Customer Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Kumar Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gm-navy mb-1">Residential / Workshop Address</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Near Ganesh Mandir, Raipura, Raipur"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gm-navy mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="customer@example.com (optional)"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs bg-white"
                    />
                  </div>
                </div>

                {/* Right: Vehicle Details */}
                <div className="space-y-3 bg-gm-soft/40 p-4 rounded-xl border border-gm-line">
                  <h3 className="text-xs font-black text-gm-navy uppercase tracking-wider border-b border-gm-line pb-1.5 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-gm-red" />
                    <span>Vehicle Details</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gm-navy mb-1">Vehicle Model *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Hero Splendor Plus"
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gm-navy mb-1">Registration No. *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. CG 04 AB 1234"
                        value={vehicleRegNumber}
                        onChange={(e) => setVehicleRegNumber(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-mono font-black text-red-600 bg-white uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gm-navy mb-1">Type Kick/Self</label>
                      <select
                        value={vehicleTypeKickSelf}
                        onChange={(e) => setVehicleTypeKickSelf(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold bg-white"
                      >
                        <option value="Self">Self Start</option>
                        <option value="Kick">Kick Start</option>
                        <option value="Both">Both Kick &amp; Self</option>
                        <option value="EV Direct">Electric Direct</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gm-navy mb-1">Vehicle Colour</label>
                      <input
                        type="text"
                        placeholder="e.g. Black with Silver"
                        value={colour}
                        onChange={(e) => setColour(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gm-navy mb-1">Odometer KMs Run</label>
                      <input
                        type="number"
                        placeholder="e.g. 12500"
                        value={kmReading}
                        onChange={(e) => setKmReading(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-mono font-bold bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gm-navy mb-1">Frame Number</label>
                      <input
                        type="text"
                        placeholder="Chassis / Frame No."
                        value={frameNumber}
                        onChange={(e) => setFrameNumber(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-mono bg-white uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gm-navy mb-1">Engine Number</label>
                      <input
                        type="text"
                        placeholder="Engine Serial No."
                        value={engineNumber}
                        onChange={(e) => setEngineNumber(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-mono bg-white uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gm-navy mb-1">Key Number</label>
                      <input
                        type="text"
                        placeholder="e.g. K-402"
                        value={keyNumber}
                        onChange={(e) => setKeyNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gm-navy mb-1">Free Coupon No.</label>
                      <input
                        type="text"
                        placeholder="e.g. CPN-02"
                        value={freeCouponNumber}
                        onChange={(e) => setFreeCouponNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gm-navy mb-1">Selling Dealer</label>
                      <input
                        type="text"
                        value={sellingDealer}
                        onChange={(e) => setSellingDealer(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Type of Service & Physical Condition */}
            <div className="bg-white rounded-2xl p-5 border border-gm-line shadow-xs space-y-4">
              <h3 className="text-xs font-black text-gm-navy uppercase tracking-wider border-b border-gm-line pb-2">
                Type of Service &amp; Vehicle Physical Condition
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-2">Select Applicable Service Types:</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      'Free Service',
                      'Paid Service',
                      'Extended Warranty',
                      'AMC',
                      'Accidental Repair',
                      'General Repair',
                      'Complaint',
                    ].map((type) => (
                      <label
                        key={type}
                        className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-colors ${
                          serviceTypes.includes(type)
                            ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                            : 'bg-white border-gm-line text-gm-navy hover:bg-gm-soft'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={serviceTypes.includes(type)}
                          onChange={() => toggleServiceType(type)}
                          className="accent-gm-navy w-4 h-4"
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gm-navy mb-1">
                    Physical &amp; Paint Condition of Vehicle:
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Note existing scratches, dent marks, mirror conditions, fuel level, tool kit presence..."
                    value={physicalCondition}
                    onChange={(e) => setPhysicalCondition(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                  />
                  <span className="text-[10px] text-gm-muted mt-1 block">
                    Recorded on vehicle arrival to protect customer and workshop.
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: 3-Column Dynamic Customer Requests & Repair Advice */}
            <div className="bg-white rounded-2xl p-5 border border-gm-line shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gm-line pb-2">
                <div>
                  <h3 className="text-xs font-black text-gm-navy uppercase tracking-wider">
                    Customer Requirements &amp; Repair Advice
                  </h3>
                  <p className="text-[11px] text-gm-muted">3-Column structured table matching the paper job card.</p>
                </div>

                <button
                  type="button"
                  onClick={addRequestRow}
                  className="bg-gm-navy text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-gm-navy/90 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Row</span>
                </button>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-black uppercase text-gm-navy bg-gm-soft p-2 rounded-xl">
                  <div className="col-span-4">1. Regular Customer Request</div>
                  <div className="col-span-4">2. Special Request / Comments</div>
                  <div className="col-span-3">3. Repair Advice / Action Taken</div>
                  <div className="col-span-1 text-center">Del</div>
                </div>

                {repairRequests.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white p-1 rounded-xl">
                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="e.g. Engine oil change"
                        value={row.regularRequest}
                        onChange={(e) => updateRequestRow(idx, 'regularRequest', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gm-line text-xs font-medium"
                      />
                    </div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="e.g. Check low speed pickup"
                        value={row.specialRequest}
                        onChange={(e) => updateRequestRow(idx, 'specialRequest', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gm-line text-xs"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="e.g. Adjusted carburettor tuning"
                        value={row.actionTaken}
                        onChange={(e) => updateRequestRow(idx, 'actionTaken', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gm-line text-xs text-slate-700"
                      />
                    </div>
                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeRequestRow(idx)}
                        disabled={repairRequests.length <= 1}
                        className="text-red-500 hover:text-red-700 p-1 rounded disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 4: Work Items & Estimate Calculation */}
            <div className="bg-white rounded-2xl p-5 border border-gm-line shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gm-line pb-2">
                <div>
                  <h3 className="text-xs font-black text-gm-navy uppercase tracking-wider">
                    Work Items, Parts &amp; Estimate Calculation
                  </h3>
                  <p className="text-[11px] text-gm-muted">Add parts, fluids and labour charges. System calculates totals automatically.</p>
                </div>

                <button
                  type="button"
                  onClick={addWorkItemRow}
                  className="bg-gm-navy text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-gm-navy/90 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-black uppercase text-gm-navy bg-gm-soft p-2 rounded-xl">
                  <div className="col-span-5">Work / Part Description</div>
                  <div className="col-span-2">Qty</div>
                  <div className="col-span-2">Labour (₹)</div>
                  <div className="col-span-2">Parts Cost (₹)</div>
                  <div className="col-span-1 text-center">Del</div>
                </div>

                {workItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white p-1 rounded-xl">
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="Item or job description"
                        value={item.description}
                        onChange={(e) => updateWorkItemRow(idx, 'description', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gm-line text-xs font-medium"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateWorkItemRow(idx, 'quantity', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gm-line text-xs font-mono text-center"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="Labour"
                        value={item.labourCharges}
                        onChange={(e) => updateWorkItemRow(idx, 'labourCharges', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gm-line text-xs font-mono"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="Parts"
                        value={item.partsCharges}
                        onChange={(e) => updateWorkItemRow(idx, 'partsCharges', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gm-line text-xs font-mono"
                      />
                    </div>
                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeWorkItemRow(idx)}
                        disabled={workItems.length <= 1}
                        className="text-red-500 hover:text-red-700 p-1 rounded disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Estimate Calculations Summary */}
              <div className="p-4 bg-slate-50 rounded-xl border border-gm-line/70 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div>
                  <span className="text-gm-muted text-[10px] uppercase font-bold block">Labour Total:</span>
                  <b className="font-mono text-sm text-gm-navy">₹{calculatedLabour}</b>
                </div>
                <div>
                  <span className="text-gm-muted text-[10px] uppercase font-bold block">Parts Total:</span>
                  <b className="font-mono text-sm text-gm-navy">₹{calculatedParts}</b>
                </div>
                <div>
                  <span className="text-gm-muted text-[10px] uppercase font-bold block">Discount (₹):</span>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-20 px-2 py-0.5 rounded border border-gm-line text-xs font-mono bg-white"
                  />
                </div>
                <div>
                  <span className="text-gm-muted text-[10px] uppercase font-bold block">GST (18%):</span>
                  <b className="font-mono text-sm text-gm-muted">₹{gstTax}</b>
                </div>
                <div>
                  <span className="text-gm-red text-[10px] uppercase font-black block">Estimated Final Total:</span>
                  <b className="font-mono text-base font-black text-gm-red">₹{finalTotalAmount}</b>
                </div>
              </div>
            </div>

            {/* Card 5: Delivery, Staff Assignment & Signatures */}
            <div className="bg-white rounded-2xl p-5 border border-gm-line shadow-xs space-y-4">
              <h3 className="text-xs font-black text-gm-navy uppercase tracking-wider border-b border-gm-line pb-2">
                Delivery Schedule, Staff Assignment &amp; Signatures
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gm-navy mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gm-navy mb-1">Expected Delivery Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 05:30 PM"
                    value={expectedDeliveryTime}
                    onChange={(e) => setExpectedDeliveryTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gm-navy mb-1">Service Advisor Name</label>
                  <input
                    type="text"
                    placeholder="Advisor in charge"
                    value={serviceAdvisorName}
                    onChange={(e) => setServiceAdvisorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gm-navy mb-1">Assigned Technician</label>
                  <input
                    type="text"
                    placeholder="Master Technician"
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-gm-navy mb-1">Floor Supervisor Name</label>
                  <input
                    type="text"
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gm-navy mb-1">Payment Method</label>
                  <select
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI / Online">UPI / QR Code</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Warranty / Insurance">Warranty / Insurance Claim</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gm-navy mb-1">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-black text-gm-navy"
                  >
                    <option value="RECEIVED">Vehicle Received</option>
                    <option value="INSPECTION">Inspection in Progress</option>
                    <option value="ESTIMATE">Estimate Awaiting Approval</option>
                    <option value="WORK_IN_PROGRESS">Work in Progress</option>
                  </select>
                </div>
              </div>

              {/* Test Rides Checkbox */}
              <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-gm-line text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gm-navy">
                  <input
                    type="checkbox"
                    checked={testRideOpening}
                    onChange={(e) => setTestRideOpening(e.target.checked)}
                    className="accent-gm-navy w-4 h-4"
                  />
                  <span>Test ride taken at time of Job Card opening</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-gm-navy">
                  <input
                    type="checkbox"
                    checked={testRideSupervisor}
                    onChange={(e) => setTestRideSupervisor(e.target.checked)}
                    className="accent-gm-navy w-4 h-4"
                  />
                  <span>Test ride taken before start of work by Floor Supervisor</span>
                </label>
              </div>
            </div>

            {/* Submission Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('JOBS')}
                className="px-5 py-2.5 rounded-xl border border-gm-line text-xs font-bold text-gm-navy hover:bg-gm-soft transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="bg-gm-red hover:bg-gm-red-dark text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{submitting ? 'Generating Job Card...' : 'Issue Official Job Card'}</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SERVICE APPOINTMENTS                                               */}
        {/* ========================================================================= */}
        {activeTab === 'APPOINTMENTS' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gm-line shadow-xs overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gm-line bg-gm-soft/60 text-gm-navy uppercase tracking-wider text-[10px] font-black">
                    <th className="p-3.5">Booking No.</th>
                    <th className="p-3.5">Customer &amp; Mobile</th>
                    <th className="p-3.5">Vehicle</th>
                    <th className="p-3.5">Preferred Date / Slot</th>
                    <th className="p-3.5">Service Type</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gm-line">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gm-muted">No appointments found.</td>
                    </tr>
                  ) : (
                    appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-gm-soft/30 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-gm-navy">{apt.bookingNumber}</td>
                        <td className="p-3.5">
                          <b className="text-gm-navy block">{apt.customerName || apt.customer?.name}</b>
                          <span className="text-gm-muted font-mono">{apt.mobile || apt.customer?.mobile}</span>
                        </td>
                        <td className="p-3.5">
                          <b>{apt.vehicleModel}</b>
                          <span className="text-gm-muted block font-mono text-[11px]">{apt.regNumber || '-'}</span>
                        </td>
                        <td className="p-3.5">
                          <b>{formatDate(apt.preferredDate)}</b>
                          <span className="text-gm-muted block">{apt.preferredTime}</span>
                        </td>
                        <td className="p-3.5 font-medium">{apt.serviceType}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${getStatusColor(apt.status)}`}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleConvertAppointmentToJobCard(apt)}
                            className="bg-gm-navy text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gm-navy/90 transition-colors inline-flex items-center gap-1"
                          >
                            <span>Open Job Card</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DETAILS MODAL                                                             */}
        {/* ========================================================================= */}
        {selectedJc && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gm-line p-6 space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-gm-line pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-base font-black font-mono text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-md">
                    #{selectedJc.jobCardNumber}
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-gm-navy">{selectedJc.vehicleModel} ({selectedJc.vehicleRegNumber})</h3>
                    <span className="text-xs text-gm-muted">Issued on {formatDate(selectedJc.createdAt)}</span>
                  </div>
                </div>

                <button onClick={() => setSelectedJc(null)} className="p-1 rounded-lg text-gm-muted hover:text-gm-navy">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Updater */}
              <div className="p-3.5 bg-gm-soft/60 rounded-xl border border-gm-line flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-gm-navy">Update Job Card Stage:</span>
                <select
                  value={selectedJc.status}
                  onChange={(e) => handleUpdateStatus(selectedJc.id, e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-gm-line text-xs font-black text-gm-navy bg-white"
                >
                  <option value="CREATED">Created</option>
                  <option value="RECEIVED">Vehicle Received</option>
                  <option value="INSPECTION">Inspection in Progress</option>
                  <option value="ESTIMATE">Estimate Awaiting Approval</option>
                  <option value="WORK_IN_PROGRESS">Work in Progress</option>
                  <option value="READY">Ready for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Summary specifics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-gm-line">
                <div>
                  <span className="text-[10px] text-gm-muted uppercase font-bold block">Customer:</span>
                  <b>{selectedJc.customer?.name}</b>
                  <span className="block font-mono text-gm-muted">{selectedJc.customer?.mobile}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gm-muted uppercase font-bold block">Expected Delivery:</span>
                  <b>{selectedJc.deliveryDate ? formatDate(selectedJc.deliveryDate) : 'Today'}</b>
                  <span className="block">{selectedJc.expectedDeliveryTime || '05:30 PM'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gm-muted uppercase font-bold block">Final Estimate:</span>
                  <b className="text-base font-black text-gm-red font-mono">₹{selectedJc.finalTotal || selectedJc.estimateAmount}</b>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-gm-line">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      const target = selectedJc;
                      setSelectedJc(null);
                      openEditJobCard(target);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit / Add Work</span>
                  </button>

                  <button
                    onClick={() => handleShareWhatsApp(selectedJc)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => {
                      setPrintJc(selectedJc);
                      setSelectedJc(null);
                    }}
                    className="bg-gm-navy hover:bg-gm-navy/90 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Save PDF</span>
                  </button>
                </div>

                <button
                  onClick={() => setSelectedJc(null)}
                  className="px-4 py-2 rounded-xl border border-gm-line text-xs font-bold text-gm-navy hover:bg-gm-soft"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* EDIT JOB CARD MODAL: ADD ADDITIONAL WORK & REVISE ESTIMATE                */}
        {/* ========================================================================= */}
        {editModalOpen && editJc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-4xl w-full border border-gm-line shadow-2xl max-h-[92vh] overflow-y-auto space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-gm-line gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-black uppercase bg-red-50 text-gm-red border border-red-200">
                      JOB CARD #{editJc.jobCardNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {editJc.vehicleModel} ({editJc.vehicleRegNumber})
                    </span>
                  </div>
                  <h3 className="text-base font-black text-gm-navy mt-1">
                    Edit Job Card & Add Servicing Work
                  </h3>
                  <p className="text-xs text-gm-muted">
                    Customer: {editJc.customer?.name} ({editJc.customer?.mobile}) • Add additional parts, labour, or complaints identified during servicing.
                  </p>
                </div>

                <button
                  onClick={() => setEditModalOpen(false)}
                  className="p-1 rounded-lg text-gm-muted hover:text-gm-navy font-bold"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <form onSubmit={handleSaveJobCardEdit} className="space-y-5">
                {/* Stage / Status & Assignment */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-gm-soft/50 rounded-2xl border border-gm-line">
                  <div>
                    <label className="block text-[11px] font-bold text-gm-navy mb-1">Job Card Stage</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-bold bg-white focus:outline-none focus:border-gm-navy"
                    >
                      <option value="CREATED">Created</option>
                      <option value="RECEIVED">Vehicle Received</option>
                      <option value="INSPECTION">Inspection in Progress</option>
                      <option value="ESTIMATE">Estimate Approval</option>
                      <option value="WORK_IN_PROGRESS">Work in Progress</option>
                      <option value="READY">Ready for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gm-navy mb-1">Assigned Technician</label>
                    <input
                      type="text"
                      value={editTechnician}
                      onChange={(e) => setEditTechnician(e.target.value)}
                      placeholder="e.g. Ramesh Sahu"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-semibold bg-white focus:outline-none focus:border-gm-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gm-navy mb-1">Expected Delivery Date</label>
                    <input
                      type="date"
                      value={editDeliveryDate}
                      onChange={(e) => setEditDeliveryDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-semibold bg-white focus:outline-none focus:border-gm-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gm-navy mb-1">Delivery Time</label>
                    <input
                      type="text"
                      value={editDeliveryTime}
                      onChange={(e) => setEditDeliveryTime(e.target.value)}
                      placeholder="05:30 PM"
                      className="w-full px-3 py-2 rounded-xl border border-gm-line text-xs font-semibold bg-white focus:outline-none focus:border-gm-navy"
                    />
                  </div>
                </div>

                {/* Additional Work Items & Parts / Labour Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-gm-navy uppercase tracking-wider flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-gm-red" />
                        <span>Work Items, Parts & Labour Charges</span>
                      </h4>
                      <p className="text-[11px] text-gm-muted">Add new parts or labour discovered during floor inspection</p>
                    </div>

                    <button
                      type="button"
                      onClick={addEditWorkItemRow}
                      className="text-xs font-bold text-gm-red hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Work Item / Part</span>
                    </button>
                  </div>

                  <div className="border border-gm-line rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gm-soft/80 text-gm-muted uppercase text-[10px] font-bold">
                        <tr>
                          <th className="p-2.5">Work / Part Description</th>
                          <th className="p-2.5 w-16 text-center">Qty</th>
                          <th className="p-2.5 w-24 text-right">Labour (₹)</th>
                          <th className="p-2.5 w-24 text-right">Parts (₹)</th>
                          <th className="p-2.5 w-24 text-right">Total (₹)</th>
                          <th className="p-2.5 w-10 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gm-line/60">
                        {editWorkItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gm-soft/30">
                            <td className="p-2">
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => updateEditWorkItemRow(idx, 'description', e.target.value)}
                                placeholder="Description of service or part..."
                                className="w-full px-2 py-1.5 rounded-lg border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => updateEditWorkItemRow(idx, 'quantity', e.target.value)}
                                className="w-full px-1.5 py-1.5 rounded-lg border border-gm-line text-xs font-bold text-center focus:outline-none focus:border-gm-navy"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min={0}
                                value={item.labourCharges}
                                onChange={(e) => updateEditWorkItemRow(idx, 'labourCharges', e.target.value)}
                                className="w-full px-2 py-1.5 rounded-lg border border-gm-line text-xs font-mono font-bold text-right focus:outline-none focus:border-gm-navy"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min={0}
                                value={item.partsCharges}
                                onChange={(e) => updateEditWorkItemRow(idx, 'partsCharges', e.target.value)}
                                className="w-full px-2 py-1.5 rounded-lg border border-gm-line text-xs font-mono font-bold text-right focus:outline-none focus:border-gm-navy"
                              />
                            </td>
                            <td className="p-2 text-right font-mono font-black text-gm-navy text-xs">
                              ₹{item.total || 0}
                            </td>
                            <td className="p-2 text-center">
                              {editWorkItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeEditWorkItemRow(idx)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Calculations Summary Bar */}
                  <div className="p-3 bg-gm-soft/80 rounded-xl border border-gm-line flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-4 flex-wrap text-slate-700">
                      <span>Labour: <strong className="font-mono text-slate-900">₹{editCalculatedLabour}</strong></span>
                      <span>•</span>
                      <span>Parts: <strong className="font-mono text-slate-900">₹{editCalculatedParts}</strong></span>
                      <span>•</span>
                      <div className="flex items-center gap-1.5">
                        <span>Discount (₹):</span>
                        <input
                          type="number"
                          min={0}
                          value={editDiscount}
                          onChange={(e) => setEditDiscount(e.target.value)}
                          className="w-16 px-1.5 py-0.5 rounded border border-gm-line font-mono text-right text-xs"
                        />
                      </div>
                      <span>•</span>
                      <span>GST (18%): <strong className="font-mono text-slate-900">₹{editGst}</strong></span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gm-muted font-bold uppercase block">Updated Final Total:</span>
                      <strong className="text-lg font-black text-gm-red font-mono">₹{editFinalTotal}</strong>
                    </div>
                  </div>
                </div>

                {/* Repair Requests & Advice Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-gm-navy uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-gm-red" />
                        <span>Customer Complaints & Repair Advice / Action</span>
                      </h4>
                      <p className="text-[11px] text-gm-muted">Update findings and action taken during servicing</p>
                    </div>

                    <button
                      type="button"
                      onClick={addEditRequestRow}
                      className="text-xs font-bold text-gm-red hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Request / Action Row</span>
                    </button>
                  </div>

                  <div className="border border-gm-line rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gm-soft/80 text-gm-muted uppercase text-[10px] font-bold">
                        <tr>
                          <th className="p-2.5 w-1/3">Regular Customer Request</th>
                          <th className="p-2.5 w-1/3">Special Request / Identified Issue</th>
                          <th className="p-2.5 w-1/3">Repair Advice / Action Taken</th>
                          <th className="p-2.5 w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gm-line/60">
                        {editRepairRequests.map((req, idx) => (
                          <tr key={idx}>
                            <td className="p-2">
                              <input
                                type="text"
                                value={req.regularRequest}
                                onChange={(e) => updateEditRequestRow(idx, 'regularRequest', e.target.value)}
                                placeholder="Regular customer request..."
                                className="w-full px-2 py-1.5 rounded-lg border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={req.specialRequest}
                                onChange={(e) => updateEditRequestRow(idx, 'specialRequest', e.target.value)}
                                placeholder="Special comments / noise / fault..."
                                className="w-full px-2 py-1.5 rounded-lg border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={req.actionTaken}
                                onChange={(e) => updateEditRequestRow(idx, 'actionTaken', e.target.value)}
                                placeholder="Action taken / repair advice..."
                                className="w-full px-2 py-1.5 rounded-lg border border-gm-line text-xs font-medium focus:outline-none focus:border-gm-navy"
                              />
                            </td>
                            <td className="p-2 text-center">
                              {editRepairRequests.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeEditRequestRow(idx)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-gm-line flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-gm-line text-xs font-bold text-gm-muted hover:bg-gm-soft transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSaving}
                    className="bg-gm-navy hover:bg-gm-navy-dark text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editSaving ? 'Updating Job Card...' : 'Save Updated Work & Estimate'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
