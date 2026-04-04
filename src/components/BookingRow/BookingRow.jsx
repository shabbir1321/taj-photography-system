import { useState } from "react";
import styles from "./BookingRow.module.css";

const BookingRow = ({
  id,
  clientName,
  eventType,
  bookingDate,
  eventDate,
  eventTime,
  location,
  phone,
  totalAmount,
  advancePaid,
  balance,
  status,
  isOpen,
  isEditing,
  onToggle,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  editData,
  setEditData,
  onPaymentUpdate,
  events,
  paymentHistory,
}) => {
  const [nextPayment, setNextPayment] = useState("");
  const [nextPaymentDate, setNextPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextPaymentMode, setNextPaymentMode] = useState("Cash");

  const handlePayment = (e) => {
    e.stopPropagation();
    if (!nextPayment || Number(nextPayment) <= 0) return;

    onPaymentUpdate(
      id,
      Number(nextPayment),
      totalAmount,
      advancePaid,
      {
        amount: Number(nextPayment),
        date: nextPaymentDate,
        mode: nextPaymentMode
      }
    );
    setNextPayment("");
  };

  return (
    <tbody className={styles.tbody}>
      {/* COMPACT ROW */}
      <tr className={`${styles.mainRow} ${isOpen ? styles.activeRow : ""}`} onClick={() => !isEditing && onToggle(id)}>
        <td className={styles.td}>
          <span className={styles.name}>{clientName}</span>
          <span className={styles.event}>{eventType} Shoot</span>
        </td>
        
        <td className={`${styles.td} ${styles.dateCol}`}>
          {eventDate}
        </td>

        <td className={styles.td}>
          <span className={`${styles.statusBadge} ${styles[status]}`}>
            {status}
          </span>
        </td>

        <td className={`${styles.td} ${styles.balanceCol}`}>
          Rs. {balance || 0}
        </td>

        <td className={styles.td}>
          <div className={styles.actionsCol}>
              {!isEditing && (
                  <>
                  <button 
                    className={styles.iconBtn} 
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    title="Edit Booking"
                  >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button 
                    className={styles.iconBtn} 
                    onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${phone.replace(/\D/g, "")}`, "_blank"); }}
                    title="Contact via WhatsApp"
                  >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </button>
                  <button 
                    className={styles.iconBtn} 
                    onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                    title="Delete"
                    style={{ color: '#ff4757' }}
                  >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                  </>
              )}
          </div>
        </td>
      </tr>

      {/* EDIT MODE FORM (EXPANDED ROW) */}
      {isEditing && (
        <tr className={styles.expandedRow}>
          <td colSpan="5" className={styles.expandedCell}>
            <div className={styles.expandedArea} onClick={(e) => e.stopPropagation()}>
              <div className={styles.detailGrid}>
                    <h4 className={styles.paymentFormTitle}>Edit Booking Details</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input 
                            value={editData.clientName} 
                            onChange={(e) => setEditData({...editData, clientName: e.target.value})} 
                            placeholder="Client Name" 
                        />
                        <input 
                            value={editData.eventType} 
                            onChange={(e) => setEditData({...editData, eventType: e.target.value})} 
                            placeholder="Event Type" 
                        />
                        <input 
                            type="date" 
                            value={editData.eventDate} 
                            onChange={(e) => setEditData({...editData, eventDate: e.target.value})} 
                        />
                    </div>
              </div>
              <div className={styles.detailGrid}>
                    <h4 className={styles.paymentFormTitle}>Financial Details</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px' }}>Total Amount</label>
                        <input type="number" value={editData.totalAmount} onChange={(e) => setEditData({...editData, totalAmount: e.target.value})} />
                        <label style={{ fontSize: '12px' }}>Advance Paid</label>
                        <input type="number" value={editData.advancePaid} onChange={(e) => setEditData({...editData, advancePaid: e.target.value})} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                        <button className={styles.payBtn} onClick={() => onSave(id)}>Save Changes</button>
                        <button className={styles.iconBtn} onClick={onCancel} style={{ border: '1.5px solid var(--border-light)' }}>Cancel</button>
                    </div>
              </div>
            </div>
          </td>
        </tr>
      )}

      {/* EXPANDED DETAILS (EXPANDED ROW) */}
      {isOpen && !isEditing && (
        <tr className={styles.expandedRow}>
          <td colSpan="5" className={styles.expandedCell}>
            <div className={styles.expandedArea}>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    {eventTime || "No time specified"}
                </div>
                <div className={styles.detailItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {location || "No location set"}
                </div>
                <div className={styles.detailItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    {phone}
                </div>
                <div className={styles.detailItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <strong>Booked on:</strong> {bookingDate || "N/A"}
                </div>

                {/* PAYMENT HISTORY */}
                {Array.isArray(paymentHistory) && paymentHistory.length > 0 && (
                    <div className={styles.paymentHistory}>
                        <p className={styles.historyTitle}>Payment History</p>
                        {paymentHistory.map((p, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', margin: '4px 0' }}>
                                <span>{p.date} ({p.mode})</span>
                                <strong>Rs. {p.amount}</strong>
                            </div>
                        ))}
                    </div>
                )}
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailItem} style={{ justifyContent: 'space-between' }}>
                    <span>Total Amount:</span>
                    <strong>Rs. {totalAmount}</strong>
                </div>
                <div className={styles.detailItem} style={{ justifyContent: 'space-between' }}>
                    <span>Paid So Far:</span>
                    <strong>Rs. {advancePaid}</strong>
                </div>
                <div className={styles.detailItem} style={{ justifyContent: 'space-between', color: 'var(--gold-primary)' }}>
                    <span>Remaining Balance:</span>
                    <span style={{ fontSize: '18px', fontWeight: '800' }}>Rs. {balance}</span>
                </div>

                {/* QUICK PAYMENT FORM */}
                {status !== "paid" && (
                    <div style={{ marginTop: '16px' }}>
                        <p className={styles.paymentFormTitle}>Record New Payment</p>
                        <div className={styles.paymentFormRow}>
                            <input type="number" placeholder="Amount" value={nextPayment} onClick={e => e.stopPropagation()} onChange={e => setNextPayment(e.target.value)} />
                            <select value={nextPaymentMode} onClick={e => e.stopPropagation()} onChange={e => setNextPaymentMode(e.target.value)}>
                                <option>Cash</option>
                                <option>UPI</option>
                                <option>Bank Transfer</option>
                            </select>
                            <button className={styles.payBtn} onClick={handlePayment}>Update</button>
                        </div>
                    </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </tbody>
  );
};

export default BookingRow;
