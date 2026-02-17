import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { db } from "../../firebase/firebase";
import InvoicePreview from "./InvoicePreview";
import styles from "./Payments.module.css";

const Payments = () => {
  const [bookings, setBookings] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bookings"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBookings(data);
    });
    return () => unsub();
  }, []);

  const suggestions = bookings.filter((b) =>
    b.clientName?.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (booking) => {
    setSelectedBooking(booking);
    setQuery(booking.clientName);

    setInvoice({
      studioName: "Taj Studio",
      businessDetails:
        "Badwani & Indore\n+91 7415856921",
      clientName: booking.clientName || "",
      clientPhone: booking.phone || "",
      clientEmail: booking.email || "",
      description: `${booking.eventType || "Event"} Photography`,
      eventDate: booking.eventDate || "",
      totalAmount: booking.totalAmount || 0,
      paidAmount: booking.advancePaid || 0,
      balance: booking.balance || 0,
      status: booking.status || "pending",
      events: booking.events || [],
      paymentHistory: booking.paymentHistory || [],
      invoiceNo: `INV-${Date.now()}`,
      invoiceDate: new Date().toLocaleDateString("en-IN"),
    });
  };

  const generatePDF = async () => {
    if (!invoice) return;
    setLoading(true);

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Champagne Brass & Charcoal Night palette
    const brassColor = [212, 175, 55]; // #D4AF37
    const charcoalColor = [26, 26, 26]; // #1A1A1A
    const mutedGray = [102, 102, 102];
    const lightGray = [238, 238, 238];

    try {
      // TOP ACCENT LINE
      doc.setFillColor(...brassColor);
      doc.rect(0, 0, pageWidth, 4, "F");

      // HEADER SECTION
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...charcoalColor);
      doc.text(invoice.studioName.toUpperCase(), 20, 25);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...mutedGray);
      doc.setLineHeightFactor(1.5);
      const businessLines = invoice.businessDetails.split("\n");
      businessLines.forEach((line, index) => {
        doc.text(line, 20, 32 + (index * 5));
      });

      // INVOICE LABEL (Right)
      doc.setFontSize(32);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...brassColor);
      doc.text("INVOICE", pageWidth - 20, 25, { align: "right" });

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...charcoalColor);
      doc.text(`No: ${invoice.invoiceNo}`, pageWidth - 20, 35, { align: "right" });
      doc.text(`Date: ${invoice.invoiceDate}`, pageWidth - 20, 40, { align: "right" });

      // STATUS (Badge style)
      const statusText = invoice.status.toUpperCase();
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      const statusX = pageWidth - 45;
      const statusY = 44;
      doc.setFillColor(...charcoalColor);
      doc.roundedRect(statusX, statusY, 25, 6, 1, 1, "F");
      doc.text(statusText, statusX + 12.5, statusY + 4.2, { align: "center" });

      // GRID LAYOUT (Bill To vs Events)
      const leftColX = 20;
      const rightColX = pageWidth / 2 + 10;
      const sectionY = 65;

      // Section Titles
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...brassColor);
      doc.text("BILL TO", leftColX, sectionY);
      doc.text("EVENT DETAILS", rightColX, sectionY);

      doc.setDrawColor(...lightGray);
      doc.setLineWidth(0.2);
      doc.line(leftColX, sectionY + 2, leftColX + 30, sectionY + 2);
      doc.line(rightColX, sectionY + 2, rightColX + 30, sectionY + 2);

      // Client Info
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...charcoalColor);
      doc.text(invoice.clientName, leftColX, sectionY + 10);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...mutedGray);
      if (invoice.clientPhone) doc.text(`Phone: ${invoice.clientPhone}`, leftColX, sectionY + 16);
      if (invoice.clientEmail) doc.text(`Email: ${invoice.clientEmail}`, leftColX, sectionY + 21);

      // Multi-Event Detail List
      let currentY = sectionY + 10;
      const eventList = invoice.events.length > 0 ? invoice.events : [{ date: invoice.eventDate, functionName: invoice.description, location: "" }];

      eventList.slice(0, 4).forEach((ev) => {
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...charcoalColor);
        doc.text(ev.functionName || "Event", rightColX, currentY);

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...mutedGray);
        doc.text(`${ev.date}${ev.location ? ` | ${ev.location}` : ""}`, rightColX, currentY + 4);
        currentY += 10;
      });

      // SERVICES TABLE
      autoTable(doc, {
        startY: 110,
        margin: { left: 20, right: 20 },
        head: [["SERVICE DESCRIPTION", "TOTAL"]],
        body: [
          [invoice.description, `Rs. ${invoice.totalAmount.toLocaleString('en-IN')}`],
        ],
        styles: {
          fontSize: 10,
          cellPadding: 8,
          lineColor: lightGray,
          lineWidth: 0.1,
          font: "helvetica",
        },
        headStyles: {
          fillColor: charcoalColor,
          textColor: 255,
          fontStyle: "bold",
        },
        columnStyles: {
          1: { halign: "right" }
        },
      });

      // PAYMENT HISTORY TABLE
      if (invoice.paymentHistory && invoice.paymentHistory.length > 0) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...brassColor);
        doc.text("PAYMENT HISTORY", 20, doc.lastAutoTable.finalY + 10);

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 13,
          margin: { left: 20, right: 20 },
          head: [["DATE", "METHOD", "AMOUNT"]],
          body: invoice.paymentHistory.map(p => [
            p.date,
            p.mode,
            `Rs. ${p.amount.toLocaleString('en-IN')}`
          ]),
          styles: {
            fontSize: 9,
            cellPadding: 4,
            font: "helvetica",
          },
          headStyles: {
            fillColor: lightGray,
            textColor: charcoalColor,
            fontStyle: "bold",
          },
          columnStyles: {
            2: { halign: "right" }
          },
          theme: 'striped'
        });
      }

      // TOTALS & BALANCE
      const finalY = doc.lastAutoTable.finalY + 20;
      const summaryX = pageWidth - 80;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...mutedGray);
      doc.text("Subtotal:", summaryX, finalY);
      doc.text("Amount Received:", summaryX, finalY + 6);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...charcoalColor);
      doc.text(`Rs. ${invoice.totalAmount.toLocaleString('en-IN')}`, pageWidth - 20, finalY, { align: "right" });
      doc.text(`- Rs. ${invoice.paidAmount.toLocaleString('en-IN')}`, pageWidth - 20, finalY + 6, { align: "right" });

      // BALANCE DUE SECTION
      const balanceY = finalY + 15;
      doc.setDrawColor(...charcoalColor);
      doc.setLineWidth(0.5);
      doc.line(summaryX - 10, balanceY, pageWidth - 20, balanceY);

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...mutedGray);
      doc.text("BALANCE DUE", summaryX, balanceY + 6);

      doc.setFontSize(18);
      doc.setTextColor(...charcoalColor);
      doc.setFont("helvetica", "bold");
      doc.text(`Rs. ${invoice.balance.toLocaleString('en-IN')}`, summaryX, balanceY + 15);

      // FOOTER
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...charcoalColor);
      doc.text(`Photography by Taj Studio`, pageWidth / 2, pageHeight - 25, { align: "center" });

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...mutedGray);
      doc.text("Professional Photography Services | Badwani & Indore | +91 7415856921", pageWidth / 2, pageHeight - 20, { align: "center" });
      doc.text("This is a computer-generated document and does not require a signature.", pageWidth / 2, pageHeight - 15, { align: "center" });


      const fileName = `Invoice_${invoice.clientName.replace(/\s+/g, "_")}_${invoice.invoiceNo}.pdf`;
      doc.save(fileName);

      setTimeout(() => {
        setLoading(false);
        if (invoice.clientPhone) {
          const phone = invoice.clientPhone.replace(/\D/g, "");
          window.open(`https://wa.me/${phone}`, "_blank");
        }
      }, 500);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      setLoading(false);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className={styles.payments}>
      <div className={styles.header}>
        <h2>Billing Center</h2>
        <p className={styles.sub}>Generate and send professional invoices</p>
      </div>

      {/* SEARCH */}
      <div className={styles.card}>
        <label className={styles.label}>Client Name</label>
        <input
          className={styles.input}
          value={query}
          placeholder="Search client..."
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedBooking(null);
            setInvoice(null);
          }}
        />

        {query && !selectedBooking && (
          <div className={styles.suggestions}>
            {suggestions.map((b) => (
              <div
                key={b.id}
                className={styles.suggestion}
                onClick={() => handleSelect(b)}
              >
                <strong>{b.clientName}</strong>
                <span>{b.eventType}</span>
              </div>
            ))}
            {suggestions.length === 0 && (
              <p className={styles.noResult}>No client found</p>
            )}
          </div>
        )}
      </div>

      {/* PREVIEW */}
      {invoice && (
        <div className={styles.previewWrap}>
          <InvoicePreview invoice={invoice} setInvoice={setInvoice} />
        </div>
      )}

      {/* ACTION */}
      {invoice && (
        <div className={styles.action}>
          <button
            className={styles.generate}
            onClick={generatePDF}
            disabled={loading}
          >
            {loading ? "Generating…" : "Generate Bill PDF"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Payments;
