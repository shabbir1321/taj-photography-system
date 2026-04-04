export const MOCK_BOOKINGS = [
  {
    id: "demo-1",
    userId: "demo-user",
    clientName: "Rohan & Priya",
    eventType: "Wedding",
    eventDate: "2026-04-15",
    eventTime: "10:00 AM",
    location: "Grand Heritage Resort",
    phone: "9876543210",
    totalAmount: 150000,
    advancePaid: 50000,
    balance: 100000,
    status: "advance",
    createdAt: new Date().toISOString(),
    events: [
      { date: "2026-04-15", functionName: "Wedding Ceremony", location: "Grand Heritage Resort", time: "10:00 AM" }
    ],
    paymentHistory: [
      { date: "2026-03-01", amount: 50000, mode: "Online Transfer" }
    ]
  },
  {
    id: "demo-2",
    userId: "demo-user",
    clientName: "Amit Sharma",
    eventType: "Pre-Wedding",
    eventDate: "2026-03-31",
    eventTime: "04:00 PM",
    location: "Lal Bagh Palace",
    phone: "9765432109",
    totalAmount: 45000,
    advancePaid: 45000,
    balance: 0,
    status: "paid",
    createdAt: new Date().toISOString(),
    events: [
      { date: "2026-03-31", functionName: "Shoot at Palace", location: "Lal Bagh Palace", time: "04:00 PM" }
    ],
    paymentHistory: [
      { date: "2026-02-15", amount: 45000, mode: "Cash" }
    ]
  },
  {
    id: "demo-3",
    userId: "demo-user",
    clientName: "Shlok Verma",
    eventType: "Birthday",
    eventDate: "2026-04-01",
    eventTime: "07:00 PM",
    location: "The Fern Hotel",
    phone: "9123456789",
    totalAmount: 25000,
    advancePaid: 5000,
    balance: 20000,
    status: "advance",
    createdAt: new Date().toISOString(),
    events: [
      { date: "2026-04-01", functionName: "Birthday Party", location: "The Fern Hotel", time: "07:00 PM" }
    ],
    paymentHistory: [
      { date: "2026-03-20", amount: 5000, mode: "UPI" }
    ]
  }
];

export const MOCK_PROFILE = {
  studioName: "Demo Photography Studio",
  businessDetails: "Indore, Madhya Pradesh\n+91 9999999999",
  logoUrl: null // Uses standard camera icon
};
