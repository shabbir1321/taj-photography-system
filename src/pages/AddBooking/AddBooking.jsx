import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import styles from "./AddBooking.module.css";

const AddBooking = () => {
  const navigate = useNavigate();

  // Client
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");

  // Event
  const [eventType, setEventType] = useState("Wedding");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [location, setLocation] = useState("");

  // Payment
  const [totalAmount, setTotalAmount] = useState("");
  const [advancePaid, setAdvancePaid] = useState("");

  const total = Number(totalAmount) || 0;
  const advance = Number(advancePaid) || 0;
  const balance = Math.max(total - advance, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Minimal validation
    if (!clientName || !eventDate || !totalAmount) {
      alert("Please fill required fields");
      return;
    }

    const bookingData = {
      clientName,
      phone,
      eventType,
      eventDate,
      eventTime,
      location,

      totalAmount: total,
      advancePaid: advance,
      balance,

      status:
        balance === 0
          ? "paid"
          : advance > 0
          ? "advance"
          : "pending",

      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "bookings"), bookingData);
      navigate("/");
    } catch (error) {
      console.error("Error saving booking:", error);
      alert("Failed to save booking");
    }
  };

  return (
    <>
      {/* FORM CONTENT */}
      <div className={styles.wrapper}>
        <h2 className={styles.heading}>Add Booking</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Client */}
          <div className={styles.group}>
            <h4 className={styles.groupTitle}>Client Details</h4>

            <label>
              Client Name
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter client name"
              />
            </label>

            <label>
              Phone Number
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </label>
          </div>

          {/* Event */}
          <div className={styles.group}>
            <h4 className={styles.groupTitle}>Event Details</h4>

            <label>
              Event Type
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                <option>Wedding</option>
                <option>Birthday</option>
                <option>Pre-Wedding</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              Event Date
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </label>

            <label>
              Event Time
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
              />
            </label>

            <label>
              Location
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Event location"
              />
            </label>
          </div>

          {/* Payment */}
          <div className={styles.group}>
            <h4 className={styles.groupTitle}>Payment Details</h4>

            <label>
              Total Amount
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="₹"
              />
            </label>

            <label>
              Advance Paid
              <input
                type="number"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(e.target.value)}
                placeholder="₹"
              />
            </label>

            <label>
              Balance
              <input type="number" value={balance} disabled />
            </label>
          </div>

          {/* Notes */}
          <div className={styles.group}>
            <h4 className={styles.groupTitle}>Notes</h4>
            <textarea placeholder="Special instructions, deliverables, etc." />
          </div>
        </form>
      </div>

      {/* ACTION BAR */}
      <div className={styles.actionBar}>
        <button type="submit" className={styles.submit} onClick={handleSubmit}>
          Save Booking
        </button>
      </div>
    </>
  );
};

export default AddBooking;
