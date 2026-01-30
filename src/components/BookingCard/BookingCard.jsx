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
}) => {
  const [nextPayment, setNextPayment] = useState("");

  const handlePayment = (e) => {
    e.stopPropagation();
    if (!nextPayment || Number(nextPayment) <= 0) return;

    onPaymentUpdate(
      id,
      Number(nextPayment),
      totalAmount,
      advancePaid
    );
    setNextPayment("");
  };

  return (
    <div
      className={`${styles.card} 
        ${isToday ? styles.today : ""} 
        ${isOpen ? styles.active : ""}`}
      onClick={() => !isEditing && onToggle(id)}
    >
      {/* HEADER */}
      <div className={styles.header}>
        <div>
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
              ✏️
            </button>
            <button
              className={styles.iconBtn}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
              title="Delete"
            >
              🗑️
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
          <p>⏰ {eventTime}</p>
          <p>📍 {location}</p>
          <p>📞 {phone}</p>

          <hr />

          <p>💰 Total: ₹{totalAmount}</p>
          <p>💳 Paid: ₹{advancePaid}</p>
          <p className={styles.balance}>🔴 Balance: ₹{balance}</p>

          {status !== "paid" && (
            <div className={styles.payment}>
              <input
                type="number"
                placeholder="Next payment ₹"
                value={nextPayment}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setNextPayment(e.target.value)}
              />
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
