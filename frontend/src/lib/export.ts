/**
 * Export utilities for downloading participant data as CSV or PDF.
 * No external dependencies — works entirely client-side.
 */

import { api } from './api';

interface ExportRow {
  sNo: number;
  registrationId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  year: string;
  usn: string;
  teamName: string;
  teamMembers: string;
  attendanceStatus: string;
  paymentStatus: string;
  paymentAmount: number;
  registeredAt: string;
  checkedInAt: string;
}

interface ExportEvent {
  title: string;
  date: string;
  venue: string;
  category: string;
  registrationCount: number;
  maxParticipants: number;
  pricingType: string;
  price: number;
  priceType: string;
  participationType: string;
}

// ——————————————— CSV Export ———————————————

export async function downloadCSV(eventId: string): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`/api/registrations/export/${eventId}?format=csv`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.message || 'Failed to export CSV');
  }

  const blob = await res.blob();
  const filename = res.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] || 'participants.csv';

  triggerDownload(blob, filename);
}

// ——————————————— PDF Export (pure client-side) ———————————————

export async function downloadPDF(eventId: string): Promise<void> {
  // Fetch data as JSON
  const res = await api.registrations.exportData(eventId, 'json');
  const eventInfo: ExportEvent = res.event;
  const rows: ExportRow[] = res.data;
  const total = res.total;

  // Build a plain-text report and trigger download
  const text = buildTextReport(eventInfo, rows, total);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const safeTitle = eventInfo.title.replace(/[^a-zA-Z0-9-_ ]/g, '');
  triggerDownload(blob, `${safeTitle}-participants.txt`);
}

// ——————————————— HTML Export (printable, acts as Word) ———————————————

export async function downloadWord(eventId: string): Promise<void> {
  const res = await api.registrations.exportData(eventId, 'json');
  const eventInfo: ExportEvent = res.event;
  const rows: ExportRow[] = res.data;
  const total = res.total;

  const html = buildHTMLDocument(eventInfo, rows, total);
  const blob = new Blob(['\ufeff' + html], {
    type: 'application/msword;charset=utf-8',
  });
  const safeTitle = eventInfo.title.replace(/[^a-zA-Z0-9-_ ]/g, '');
  triggerDownload(blob, `${safeTitle}-participants.doc`);
}

// ——————————————— Trigger Browser Download ———————————————

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ——————————————— Build HTML Document (for Word export) ———————————————

function buildHTMLDocument(event: ExportEvent, rows: ExportRow[], total: number): string {
  const eventDate = new Date(event.date).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const isPaid = event.pricingType === 'paid';
  const presentCount = rows.filter(r => r.attendanceStatus === 'present').length;
  const paidCount = rows.filter(r => r.paymentStatus === 'completed').length;

  const tableRows = rows.map(r => `
    <tr>
      <td style="padding:6px 8px;border:1px solid #ddd;text-align:center">${r.sNo}</td>
      <td style="padding:6px 8px;border:1px solid #ddd">${r.name}</td>
      <td style="padding:6px 8px;border:1px solid #ddd">${r.email}</td>
      <td style="padding:6px 8px;border:1px solid #ddd">${r.phone}</td>
      <td style="padding:6px 8px;border:1px solid #ddd">${r.department}</td>
      <td style="padding:6px 8px;border:1px solid #ddd">${r.year}</td>
      <td style="padding:6px 8px;border:1px solid #ddd">${r.usn}</td>
      ${event.participationType === 'team' ? `<td style="padding:6px 8px;border:1px solid #ddd">${r.teamName}</td>` : ''}
      <td style="padding:6px 8px;border:1px solid #ddd;text-align:center">
        <span style="color:${r.attendanceStatus === 'present' ? '#16a34a' : '#9ca3af'}">${r.attendanceStatus === 'present' ? '✓ Present' : 'Registered'}</span>
      </td>
      ${isPaid ? `<td style="padding:6px 8px;border:1px solid #ddd;text-align:center">
        <span style="color:${r.paymentStatus === 'completed' ? '#16a34a' : '#eab308'}">
          ${r.paymentStatus === 'completed' ? '✓ Paid' : r.paymentStatus === 'pending' ? '⏳ Pending' : 'N/A'}
        </span>
      </td>` : ''}
      <td style="padding:6px 8px;border:1px solid #ddd;font-size:11px">${r.registeredAt ? new Date(r.registeredAt).toLocaleDateString('en-IN') : ''}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${event.title} - Participants</title></head>
<body style="font-family:Calibri,Arial,sans-serif;color:#1a1a1a;padding:40px;max-width:1200px;margin:0 auto">
  <div style="text-align:center;margin-bottom:30px">
    <h1 style="color:#4f46e5;margin:0;font-size:24px">BEC Vortex Event Hub</h1>
    <p style="color:#666;margin:4px 0">Participant Report</p>
  </div>

  <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin-bottom:24px">
    <h2 style="margin:0 0 12px;color:#1e293b">${event.title}</h2>
    <table style="width:100%;border:0">
      <tr>
        <td style="padding:4px 0;color:#64748b;width:120px">Date:</td>
        <td style="padding:4px 0;font-weight:600">${eventDate}</td>
        <td style="padding:4px 0;color:#64748b;width:120px">Venue:</td>
        <td style="padding:4px 0;font-weight:600">${event.venue}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:#64748b">Category:</td>
        <td style="padding:4px 0;font-weight:600;text-transform:capitalize">${event.category}</td>
        <td style="padding:4px 0;color:#64748b">Type:</td>
        <td style="padding:4px 0;font-weight:600;text-transform:capitalize">${event.participationType}${isPaid ? ` (₹${event.price}/${event.priceType === 'per_team' ? 'team' : 'person'})` : ' (Free)'}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:#64748b">Registrations:</td>
        <td style="padding:4px 0;font-weight:600">${total} / ${event.maxParticipants}</td>
        <td style="padding:4px 0;color:#64748b">Attendance:</td>
        <td style="padding:4px 0;font-weight:600">${presentCount} / ${total} (${total > 0 ? Math.round((presentCount / total) * 100) : 0}%)</td>
      </tr>
      ${isPaid ? `<tr>
        <td style="padding:4px 0;color:#64748b">Payments:</td>
        <td colspan="3" style="padding:4px 0;font-weight:600">${paidCount} paid / ${total} total = ₹${paidCount * event.price} collected</td>
      </tr>` : ''}
    </table>
  </div>

  <table style="width:100%;border-collapse:collapse;font-size:12px">
    <thead>
      <tr style="background:#4f46e5;color:white">
        <th style="padding:8px;border:1px solid #4338ca;text-align:center">#</th>
        <th style="padding:8px;border:1px solid #4338ca;text-align:left">Name</th>
        <th style="padding:8px;border:1px solid #4338ca;text-align:left">Email</th>
        <th style="padding:8px;border:1px solid #4338ca;text-align:left">Phone</th>
        <th style="padding:8px;border:1px solid #4338ca;text-align:left">Dept</th>
        <th style="padding:8px;border:1px solid #4338ca;text-align:left">Year</th>
        <th style="padding:8px;border:1px solid #4338ca;text-align:left">USN</th>
        ${event.participationType === 'team' ? '<th style="padding:8px;border:1px solid #4338ca;text-align:left">Team</th>' : ''}
        <th style="padding:8px;border:1px solid #4338ca;text-align:center">Status</th>
        ${isPaid ? '<th style="padding:8px;border:1px solid #4338ca;text-align:center">Payment</th>' : ''}
        <th style="padding:8px;border:1px solid #4338ca;text-align:left">Registered</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;color:#94a3b8;font-size:11px">
    <span>Generated on ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
    <span>Total Participants: ${total}</span>
  </div>
</body>
</html>`;
}

// ——————————————— Build PDF (minimal PDF spec) ———————————————
// Uses printable HTML → opens in a new window for Print-to-PDF
// This is the most reliable cross-browser way without heavy PDF libraries

export async function printPDF(eventId: string): Promise<void> {
  const res = await api.registrations.exportData(eventId, 'json');
  const eventInfo: ExportEvent = res.event;
  const rows: ExportRow[] = res.data;
  const total = res.total;

  const html = buildHTMLDocument(eventInfo, rows, total);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Please allow popups to print the PDF');
  }

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to render, then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
}

function buildTextReport(event: ExportEvent, rows: ExportRow[], total: number): string {
  const lines: string[] = [];
  const eventDate = new Date(event.date).toLocaleDateString('en-IN');

  lines.push(`BEC VORTEX EVENT HUB - PARTICIPANT REPORT`);
  lines.push(`${'='.repeat(50)}`);
  lines.push(`Event: ${event.title}`);
  lines.push(`Date: ${eventDate} | Venue: ${event.venue}`);
  lines.push(`Total Registrations: ${total} / ${event.maxParticipants}`);
  if (event.pricingType === 'paid') {
    lines.push(`Price: Rs.${event.price}/${event.priceType === 'per_team' ? 'team' : 'person'}`);
  }
  lines.push(`${'='.repeat(50)}\n`);

  rows.forEach(r => {
    lines.push(`${r.sNo}. ${r.name}`);
    lines.push(`   Email: ${r.email} | Phone: ${r.phone}`);
    lines.push(`   ${r.department} - ${r.year} | USN: ${r.usn}`);
    if (r.teamName) lines.push(`   Team: ${r.teamName}`);
    lines.push(`   Status: ${r.attendanceStatus}${r.paymentStatus !== 'not_required' ? ` | Payment: ${r.paymentStatus}` : ''}`);
    lines.push('');
  });

  lines.push(`${'='.repeat(50)}`);
  lines.push(`Generated: ${new Date().toLocaleString('en-IN')}`);

  return lines.join('\n');
}
