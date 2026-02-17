import { useState } from "react";
import styles from "./BookingCard.module.css";

const BookingCard = ({
  id,
  clientName,
  eventType,
  eventDate,
  eventTime,
  location,
  phone,
  totalAmount,
  advancePaid,
  balance,
  status,
  isToday,
  isUrgent,
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
    <div
      className={`${styles.card} 
        ${isToday ? styles.today : ""} 
        ${isUrgent ? styles.urgent : ""}
        ${isOpen ? styles.active : ""}`}
      onClick={() => !isEditing && onToggle(id)}
    >
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          {isUrgent && <span className={styles.urgentBadge}>🔔 Reminder</span>}
          <p className={styles.name}>{clientName}</p>
          <p className={styles.reason}>{eventType} Shoot</p>
        </div>

        {!isEditing && (
          <div className={styles.actions}>
            <button
              className={styles.iconBtn}
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              title="Edit"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button
              className={styles.iconBtn}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
              title="Delete"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        )}
      </div>

      {/* FOOTER */}
      {!isEditing && (
        <div className={styles.footer}>
          <span className={styles.date}>{eventDate}</span>
          <span className={`${styles.status} ${styles[status]}`}>
            ● {status}
          </span>
        </div>
      )}

      {/* EDIT MODE */}
      {isEditing && (
        <div className={styles.editForm}>
          <input
            value={editData.clientName}
            onChange={(e) =>
              setEditData({ ...editData, clientName: e.target.value })
            }
          />
          <input
            value={editData.eventType}
            onChange={(e) =>
              setEditData({ ...editData, eventType: e.target.value })
            }
          />
          <input
            type="date"
            value={editData.eventDate}
            onChange={(e) =>
              setEditData({ ...editData, eventDate: e.target.value })
            }
          />
          <label>
            Total Amount
            <input
              type="number"
              value={editData.totalAmount}
              onChange={(e) => setEditData({ ...editData, totalAmount: e.target.value })}
              placeholder="Rs."
            />
          </label>

          <label>
            Advance Paid
            <input
              type="number"
              value={editData.advancePaid}
              onChange={(e) => setEditData({ ...editData, advancePaid: e.target.value })}
              placeholder="Rs."
            />
          </label>
          <div className={styles.editActions}>
            <button className={styles.save} onClick={() => onSave(id)}>
              Save
            </button>
            <button className={styles.cancel} onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* EXPANDED DETAILS */}
      {isOpen && !isEditing && (
        <div className={styles.details}>
          {/* MULTI EVENT LIST */}
          {Array.isArray(events) && events.length > 0 ? (
            <div className={styles.eventsList}>
              <p style={{ fontSize: '12px', fontWeight: '700', opacity: '0.6', marginBottom: '8px' }}>SCHEDULED FUNCTIONS</p>
              {events.map((ev, idx) => (
                <div key={idx} className={styles.eventItem}>
                  {ev.functionName && <span className={styles.eventFunctionName}>{ev.functionName}</span>}
                  <p><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> {ev.date}</p>
                  {ev.time && <p><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> {ev.time}</p>}
                  {ev.location && <p><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> {ev.location}</p>}
                </div>
              ))}
            </div>
          ) : (
            <>
              <p><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> {eventTime}</p>
              <p><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> {location}</p>
            </>
          )}

          <p><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> {phone}</p>

          <hr />

          {/* PAYMENT HISTORY */}
          {Array.isArray(paymentHistory) && paymentHistory.length > 0 && (
            <div className={styles.paymentHistory}>
              <p style={{ fontSize: '11px', fontWeight: '700', opacity: '0.6', marginBottom: '8px' }}>PAYMENT HISTORY</p>
              {paymentHistory.map((pay, pIdx) => (
                <div key={pIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
                  <span>{pay.date} ({pay.mode})</span>
                  <span style={{ fontWeight: '700' }}>Rs. {pay.amount}</span>
                </div>
              ))}
              <hr />
            </div>
          )}

          <p><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="12" y1="10" x2="12" y2="10"></line><line x1="2" y1="10" x2="22" y2="10"></line></svg> Total: Rs. {totalAmount}</p>
          <p><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Paid: Rs. {advancePaid}</p>
          <p className={styles.balance}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Balance: Rs. {balance}</p>

          {status !== "paid" && (
            <div className={styles.payment}>
              <input
                type="number"
                placeholder="Amount (Rs.)"
                value={nextPayment}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setNextPayment(e.target.value)}
              />
              <input
                type="date"
                value={nextPaymentDate}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setNextPaymentDate(e.target.value)}
              />
              <select
                value={nextPaymentMode}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setNextPaymentMode(e.target.value)}
                style={{ padding: '8px', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-light)' }}
              >
                <option>Cash</option>
                <option>UPI</option>
                <option>Card</option>
                <option>Bank Transfer</option>
              </select>
              <button className={styles.payBtn} onClick={handlePayment}>
                Update Payment
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingCard;
