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
      className={`${styles.card} ${isToday ? styles.today : ""}`}
      onClick={() => !isEditing && onToggle(id)}
    >
      {/* HEADER */}
      <div className={styles.header}>
        <p className={styles.name}>{clientName}</p>

        {!isEditing && (
          <div className={styles.actions}>
            <button
              className={styles.iconBtn}
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              ✏️
            </button>
            <button
              className={styles.iconBtn}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {!isEditing && (
        <>
          <p className={styles.reason}>{eventType} Shoot</p>
          <div className={styles.footer}>
            <span>{eventDate}</span>
            <span className={`${styles.status} ${styles[status]}`}>
              ● {status}
            </span>
          </div>
        </>
      )}

      {/* EDIT BASIC DETAILS */}
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
            <button onClick={() => onSave(id)} className={styles.save}>
              Save
            </button>
            <button onClick={onCancel} className={styles.cancel}>
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
          <p>🔴 Balance: ₹{balance}</p>

          {/* PAYMENT */}
          {status !== "paid" && (
            <div className={styles.payment}>
              <label>
                Next Payment
                <input
                  type="number"
                  value={nextPayment}
                  onChange={(e) => setNextPayment(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="₹"
                />
              </label>

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
