import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import styles from "./AddBooking.module.css";

const AddBooking = () => {
  const navigate = useNavigate();

  // Client
  const [clientName, setClientName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");

  // Events (Multiple)
  const [events, setEvents] = useState([
    { date: "", time: "", location: "", functionName: "" },
  ]);

  const [eventType, setEventType] = useState("Wedding");

  // Payment
  const [totalAmount, setTotalAmount] = useState("");
  const [advancePaid, setAdvancePaid] = useState("");
  const [advanceDate, setAdvanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState("Cash");

  const total = Number(totalAmount) || 0;
  const advance = Number(advancePaid) || 0;
  const balance = Math.max(total - advance, 0);

  const addEvent = () => {
    setEvents([...events, { date: "", time: "", location: "", functionName: "" }]);
  };

  const removeEvent = (index) => {
    if (events.length > 1) {
      setEvents(events.filter((_, i) => i !== index));
    }
  };

  const updateEvent = (index, field, value) => {
    const updatedEvents = [...events];
    updatedEvents[index][field] = value;
    setEvents(updatedEvents);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Minimal validation
    const hasWaitRequired = events.some(ev => !ev.date);
    if (!clientName || hasWaitRequired || !totalAmount) {
      alert("Please fill required fields (Client Name, Event Dates, and Total Amount)");
      return;
    }

    // Use first event for top-level compatibility
    const firstEvent = events[0];

    // Build initial payment history if advance is paid
    const paymentHistory = [];
    if (advance > 0) {
      paymentHistory.push({
        amount: advance,
        date: advanceDate,
        mode: paymentMode,
      });
    }

    const bookingData = {
      clientName,
      phone: `${countryCode}${phone}`,
      eventType,
      events, // Full events array
      eventDate: firstEvent.date,
      eventTime: firstEvent.time,
      location: firstEvent.location,

      totalAmount: total,
      advancePaid: advance,
      balance,
      paymentHistory, // Track payment history

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
      <div className={styles.wrapper}>
        <h2 className={styles.heading}>New Booking Record</h2>

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

            <div className={styles.phoneInput}>
              <label className={styles.countrySelect}>
                Code
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  <option value="+91">+91 (IN)</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+971">+971 (UAE)</option>
                  <option value="+966">+966 (KSA)</option>
                  <option value="+61">+61 (AU)</option>
                </select>
              </label>

              <label className={styles.phoneField}>
                Phone Number
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </label>
            </div>

            <label style={{ marginTop: '15px', display: 'block' }}>
              Main Event Type
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                <option>Wedding</option>
                <option>Birthday</option>
                <option>Pre-Wedding</option>
                <option>Baby Shower</option>
                <option>Maternity</option>
                <option>Other</option>
              </select>
            </label>
          </div>

          {/* Events */}
          <div className={styles.group}>
            <div className={styles.groupHeader}>
              <h4 className={styles.groupTitle}>Schedule (Dates)</h4>
              <button type="button" className={styles.addBtn} onClick={addEvent}>
                + Add Date
              </button>
            </div>

            {events.map((event, index) => (
              <div key={index} className={styles.eventRow}>
                <div className={styles.eventIndex}>Date {index + 1}</div>
                <div className={styles.eventFields}>
                  <label>
                    What function? (e.g. Reception, Haldi)
                    <input
                      type="text"
                      value={event.functionName}
                      onChange={(e) => updateEvent(index, "functionName", e.target.value)}
                      placeholder="Enter function name"
                    />
                  </label>
                  <div className={styles.dateTimeRow}>
                    <label>
                      Date
                      <input
                        type="date"
                        value={event.date}
                        onChange={(e) => updateEvent(index, "date", e.target.value)}
                      />
                    </label>
                    <label>
                      Time
                      <input
                        type="time"
                        value={event.time}
                        onChange={(e) => updateEvent(index, "time", e.target.value)}
                      />
                    </label>
                  </div>
                  <label>
                    Location
                    <input
                      type="text"
                      value={event.location}
                      onChange={(e) => updateEvent(index, "location", e.target.value)}
                      placeholder="Event location"
                    />
                  </label>
                </div>
                {events.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeEvent(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
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
                placeholder="Rs."
              />
            </label>

            <label>
              Advance Paid
              <input
                type="number"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(e.target.value)}
                placeholder="Rs."
              />
            </label>

            <div className={styles.dateTimeRow}>
              <label>
                Payment Date
                <input
                  type="date"
                  value={advanceDate}
                  onChange={(e) => setAdvanceDate(e.target.value)}
                />
              </label>
              <label>
                Payment Mode
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Card</option>
                  <option>Bank Transfer</option>
                </select>
              </label>
            </div>

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
          Confirm Record
        </button>
      </div>
    </>
  );
};

export default AddBooking;
