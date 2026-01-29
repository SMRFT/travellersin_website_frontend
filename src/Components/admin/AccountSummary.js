
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaFileInvoiceDollar, FaSearch, FaDownload } from 'react-icons/fa';
import api from '../services/api';

const Container = styled.div`
  background: #0F1E2E;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  border-radius: 24px;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-family: 'Playfair Display', serif;
  color: #C9A24D;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  width: 100%;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;

  th, td {
    padding: 1rem 1.5rem;
    text-align: left;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }

  th {
    background: rgba(0,0,0,0.2);
    font-weight: 600;
    color: rgba(255,255,255,0.7);
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  tr:hover {
    background: rgba(255,255,255,0.02);
  }

  td {
    font-size: 0.95rem;
    color: rgba(255,255,255,0.9);
  }
`;

const StatusBadge = styled.span`
  padding: 0.3rem 0.8rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(201, 162, 77, 0.15);
  color: #C9A24D;
  text-transform: capitalize;
`;

const DateInput = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  outline: none;
  font-family: inherit;
  color-scheme: dark;

  &:focus {
    border-color: #C9A24D;
  }
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }
`;

const AccountSummary = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    // Default to last 3 days
    const [dateFilter, setDateFilter] = useState(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 3);
        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
    });

    useEffect(() => {
        fetchBills();
    }, [dateFilter]);

    const fetchBills = async () => {
        setLoading(true);
        try {
            // Filter from Backend
            const response = await api.get('/admin/billing-history/', {
                params: {
                    start_date: dateFilter.start,
                    end_date: dateFilter.end
                }
            });
            setBills(response.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const stats = {
        totalRevenue: bills.reduce((acc, bill) => acc + (bill.amount_paid || 0), 0),
        cash: bills.filter(b => b.payment_type === 'cash').reduce((acc, bill) => acc + (bill.amount_paid || 0), 0),
        online: bills.filter(b => b.payment_type !== 'cash').reduce((acc, bill) => acc + (bill.amount_paid || 0), 0),
        // Calculate total booking value correctly by summing unique bookings
        totalBookingValue: [...new Map(bills.map(item => [item.booking, item])).values()]
            .reduce((acc, bill) => acc + (bill.total_amount || 0), 0)
    };

    const printIndividualBill = (bill) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("Popup blocked! Please allow popups for this site to print the bill.");
            return;
        }
        printWindow.document.write(`
            <html>
            <head>
                <title>Bill - ${bill.billing_no}</title>
                <style>
                    body { font-family: 'Courier New', monospace; padding: 20px; width: 300px; margin: 0 auto; }
                    h2 { text-align: center; margin-bottom: 5px; }
                    p { margin: 5px 0; font-size: 14px; }
                    .line { border-bottom: 1px dashed #000; margin: 10px 0; }
                    .total { font-weight: bold; font-size: 16px; margin-top: 10px; }
                    .footer { margin-top: 20px; text-align: center; font-size: 12px; }
                </style>
            </head>
            <body>
                <h2>Traveller's Inn</h2>
                <p style="text-align:center">Booking Receipt</p>
                <div class="line"></div>
                <p><strong>Bill No:</strong> ${bill.billing_no}</p>
                <p><strong>Date:</strong> ${new Date(bill.created_date).toLocaleString()}</p>
                <div class="line"></div>
                <p><strong>Guest:</strong> ${bill.guest_name || 'N/A'}</p>
                <p><strong>Phone:</strong> ${bill.guest_phone || 'N/A'}</p>
                <p><strong>Room(s):</strong> ${bill.room_numbers || 'N/A'}</p>
                <p><strong>Booking ID:</strong> ${bill.booking}</p>
                <div class="line"></div>
                <p><strong>Payment Type:</strong> ${bill.payment_type.toUpperCase()}</p>
                <p class="total">Amount Paid: ₹${bill.amount_paid}</p>
                <div class="line"></div>
                <p class="footer">Thank you for staying with us!</p>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handlePrintSummary = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Account Summary</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .stats { display: flex; gap: 20px; margin-bottom: 20px; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>Traveller's Inn - Account Summary</h2>
                    <p>Period: ${dateFilter.start} to ${dateFilter.end}</p>
                </div>
                <div class="stats">
                    <span>Total Revenue: ₹${stats.totalRevenue.toLocaleString()}</span>
                    <span>Cash: ₹${stats.cash.toLocaleString()}</span>
                    <span>Online/Other: ₹${stats.online.toLocaleString()}</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Bill No</th>
                            <th>Date</th>
                            <th>Booking ID</th>
                            <th>Amount</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${bills.map(bill => `
                            <tr>
                                <td>${bill.billing_no}</td>
                                <td>${new Date(bill.created_date).toLocaleString()}</td>
                                <td>${bill.booking}</td>
                                <td>₹${bill.amount_paid}</td>
                                <td>${bill.payment_type}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleExportCSV = () => {
        const headers = ["Bill No", "Date", "Booking ID", "Guest Name", "Phone", "Email", "Room(s)", "Amount Paid (Bill)", "Total Paid (Booking)", "Type", "Total Booking Value"];
        const csvContent = [
            headers.join(','),
            ...bills.map(bill => [
                bill.billing_no,
                // Escape commas in dates if any
                `"${new Date(bill.created_date).toLocaleString()}"`,
                bill.booking,
                `"${bill.guest_name || ''}"`,
                `"${bill.guest_phone || ''}"`,
                `"${bill.guest_email || ''}"`,
                `"${bill.room_numbers || ''}"`,
                bill.amount_paid,
                bill.total_booking_paid,
                bill.payment_type,
                bill.total_amount
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `account_summary_${dateFilter.start}_to_${dateFilter.end}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Container>
            <Header>
                <Title><FaFileInvoiceDollar /> Account Summary</Title>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <DateInput
                        type="date"
                        value={dateFilter.start}
                        onChange={e => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                        placeholder="Start Date"
                    />
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>to</span>
                    <DateInput
                        type="date"
                        value={dateFilter.end}
                        onChange={e => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                    />
                    <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', margin: '0 0.5rem' }}></div>
                    <ActionButton onClick={handlePrintSummary} title="Print Summary">
                        <FaFileInvoiceDollar /> Print
                    </ActionButton>
                    <ActionButton onClick={handleExportCSV} title="Export CSV">
                        <FaDownload /> CSV
                    </ActionButton>
                </div>
            </Header>

            <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', gap: '2rem', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginTop: '1rem' }}>
                <div style={{ color: '#10b981', fontWeight: 'bold' }}>Total Paid: ₹{stats.totalRevenue.toLocaleString()}</div>
                <div style={{ color: '#C9A24D' }}>Cash: ₹{stats.cash.toLocaleString()}</div>
                <div style={{ color: '#3b82f6' }}>Other: ₹{stats.online.toLocaleString()}</div>
            </div>

            <TableWrapper>
                {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>Loading...</div> : (
                    <Table>
                        <thead>
                            <tr>
                                <th>Bill No</th>
                                <th>Date</th>
                                <th>Booking ID</th>
                                <th>Amount (Bill)</th>
                                <th>Total Paid</th>
                                <th>Type</th>
                                <th>Booking Value</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map(bill => (
                                <tr key={bill.billing_no}>
                                    <td style={{ fontFamily: 'monospace', color: '#C9A24D' }}>{bill.billing_no}</td>
                                    <td>{new Date(bill.created_date).toLocaleString()}</td>
                                    <td>{bill.booking}</td>
                                    <td style={{ color: '#10b981', fontWeight: 'bold' }}>₹{bill.amount_paid}</td>
                                    <td style={{ color: '#3b82f6', fontWeight: 'bold' }}>₹{bill.total_booking_paid}</td>
                                    <td><StatusBadge>{bill.payment_type}</StatusBadge></td>
                                    <td style={{ opacity: 0.6 }}>₹{bill.total_amount}</td>
                                    <td>
                                        <ActionButton
                                            onClick={() => printIndividualBill(bill)}
                                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                                            title="Print Bill"
                                        >
                                            <FaFileInvoiceDollar /> Print
                                        </ActionButton>
                                    </td>
                                </tr>
                            ))}
                            {bills.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>
                                        No records found for this period
                                    </td>
                                </tr>
                            ) : (
                                <tr style={{ background: 'rgba(255,255,255,0.1)', fontWeight: 'bold' }}>
                                    <td colSpan="3" style={{ textAlign: 'right' }}>TOTAL REVENUE:</td>
                                    <td style={{ color: '#10b981' }}>₹{stats.totalRevenue.toLocaleString()}</td>
                                    <td></td>
                                    <td></td>
                                    <td>₹{stats.totalBookingValue.toLocaleString()}</td>
                                    <td></td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                )}
            </TableWrapper>
        </Container>
    );
};

export default AccountSummary;
