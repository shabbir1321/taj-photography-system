import styles from "./InvoicePreview.module.css";

const InvoicePreview = ({ invoice, setInvoice }) => {
  return (
    <div className={styles.wrapper}>
      <p className={styles.previewLabel}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        PREMIUM BILL PREVIEW
      </p>

      <div className={styles.invoice}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.brandSection}>
            <input
              className={styles.studioName}
              value={invoice.studioName}
              onChange={(e) => setInvoice({ ...invoice, studioName: e.target.value })}
            />
            <textarea
              className={styles.business}
              value={invoice.businessDetails}
              onChange={(e) => setInvoice({ ...invoice, businessDetails: e.target.value })}
              rows={3}
            />
          </div>

          <div className={styles.invoiceMeta}>
            <h2 className={styles.invoiceTitle}>INVOICE</h2>
            <div className={styles.metaDetails}>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Invoice No:</span>
                <span className={styles.metaValue}>{invoice.invoiceNo}</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Date:</span>
                <span className={styles.metaValue}>{invoice.invoiceDate}</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Status:</span>
                <span className={`${styles.statusBadge} ${styles[invoice.status]}`}>
                  {invoice.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* INFO GRID */}
        <div className={styles.infoGrid}>
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>BILL TO</h4>
            <div className={styles.clientInfo}>
              <p className={styles.clientName}>{invoice.clientName}</p>
              <p className={styles.clientDetail}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                {invoice.clientEmail || "No Email Provided"}
              </p>
              <p className={styles.clientDetail}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                {invoice.clientPhone || "No Phone Provided"}
              </p>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>EVENT DETAILS</h4>
            <div className={styles.eventInfo}>
              {(invoice.events && invoice.events.length > 0 ? invoice.events : [{ date: invoice.eventDate, functionName: invoice.description, location: "" }]).map((ev, idx) => (
                <div key={idx} className={styles.eventItem}>
                  <p className={styles.eventFunctionName}>{ev.functionName || "Main Event"}</p>
                  <p className={styles.eventDate}>
                    {ev.date} {ev.time ? `• ${ev.time}` : ""} {ev.location ? `• ${ev.location}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PAYMENT TABLE */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '70%' }}>SERVICE DESCRIPTION</th>
                <th className={styles.alignRight}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.serviceDesc}>{invoice.description}</td>
                <td className={styles.alignRight}>Rs. {invoice.totalAmount.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PAYMENT HISTORY */}
        {invoice.paymentHistory && invoice.paymentHistory.length > 0 && (
          <div className={styles.tableWrapper}>
            <h4 className={styles.sectionTitle}>PAYMENT HISTORY</h4>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>METHOD</th>
                  <th className={styles.alignRight}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {invoice.paymentHistory.map((pay, pIdx) => (
                  <tr key={pIdx}>
                    <td>{pay.date}</td>
                    <td>{pay.mode}</td>
                    <td className={styles.alignRight}>Rs. {pay.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SUMMARY & BALANCE */}
        <div className={styles.summarySection}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Subtotal:</span>
            <span className={styles.summaryValue}>Rs. {invoice.totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Total Received:</span>
            <span className={styles.summaryValue}>Rs. {invoice.paidAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className={styles.balanceSection}>
          <div className={styles.balanceBox}>
            <span className={styles.balanceLabel}>AMOUNT DUE</span>
            <span className={styles.balanceAmount}>Rs. {invoice.balance.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* FOOTER */}
        <div className={styles.footer}>
          <p className={styles.footerTitle}>Photography by Taj Studio</p>
          <p className={styles.footerText}>
            Thank you for choosing Taj Studio for your special moments.<br />
            This is a computer-generated document and does not require a signature.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
