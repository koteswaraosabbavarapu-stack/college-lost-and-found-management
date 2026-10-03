// In-browser mock database engine for static deployments (Surge, GitHub Pages, Netlify)
// Ensures 100% full-stack functionality works even without a connected live backend server

const DB_KEYS = {
  USERS: 'campustrack_users',
  ITEMS: 'campustrack_items',
  CLAIMS: 'campustrack_claims',
  NOTIFICATIONS: 'campustrack_notifications',
  AUDIT: 'campustrack_audit',
  CATEGORIES: 'campustrack_categories',
};

// Initial Seed Data
const DEFAULT_USERS = [
  {
    _id: 'usr_student_rahul',
    name: 'Rahul Sharma',
    email: 'student@college.edu',
    collegeId: 'CS-2024-042',
    password: 'password123',
    role: 'USER',
    department: 'Computer Science & Engineering',
    phone: '+91 98765 43210',
    avatar: '',
    isActive: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    _id: 'usr_student_ananya',
    name: 'Ananya Patel',
    email: 'ananya@college.edu',
    collegeId: 'EC-2024-118',
    password: 'password123',
    role: 'USER',
    department: 'Electronics & Communication',
    phone: '+91 98765 43211',
    avatar: '',
    isActive: true,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    _id: 'usr_security_vikram',
    name: 'Chief Officer Vikram Rao',
    email: 'security@college.edu',
    collegeId: 'SEC-OFFICER-07',
    password: 'password123',
    role: 'SECURITY',
    department: 'Campus Safety & Security',
    phone: '+91 98765 43212',
    avatar: '',
    isActive: true,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    _id: 'usr_admin_meera',
    name: 'Dr. Meera Sen (Dean Admin)',
    email: 'admin@college.edu',
    collegeId: 'ADM-9901',
    password: 'password123',
    role: 'ADMIN',
    department: 'Dean Student Affairs & IT',
    phone: '+91 98765 43213',
    avatar: '',
    isActive: true,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
];

const DEFAULT_ITEMS = [
  {
    _id: 'item_lost_macbook',
    title: 'Space Grey MacBook Pro 14" M2',
    category: 'Electronics',
    type: 'LOST',
    description: 'Left my laptop on the study table near the reference section. It has a matte screen protector and stickers on the lid including GitHub and React logos.',
    brand: 'Apple',
    color: 'Space Grey',
    identifyingFeatures: 'Small scratch near USB-C port, GitHub Octocat sticker and React logo sticker on lid.',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    approximateTime: '04:30 PM',
    location: 'Central Library',
    specificLocation: '2nd Floor Reference Section Table #14',
    reportedBy: DEFAULT_USERS[0],
    status: 'ACTIVE',
    contactPreference: 'PORTAL',
    currentStorageLocation: 'Campus Security Main Office',
    history: [
      { action: 'REPORTED_LOST', performedBy: DEFAULT_USERS[0], timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), notes: 'Reported lost by Rahul Sharma' },
    ],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    _id: 'item_found_macbook',
    title: 'Apple MacBook Pro (Space Grey) in Sleeve',
    category: 'Electronics',
    type: 'FOUND',
    description: 'Found unattended laptop on 2nd floor library study table after evening closing. Deposited at Central Security Desk.',
    brand: 'Apple',
    color: 'Space Grey',
    identifyingFeatures: 'Has tech stickers on lid including Octocat and React. Battery was at 42%.',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    approximateTime: '06:15 PM',
    location: 'Central Library',
    specificLocation: '2nd Floor study desk near books rack',
    reportedBy: DEFAULT_USERS[2],
    status: 'ACTIVE',
    currentStorageLocation: 'Campus Security Main Office - Secure Locker B-04',
    history: [
      { action: 'REPORTED_FOUND', performedBy: DEFAULT_USERS[2], timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), notes: 'Logged into security locker B-04' },
    ],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    _id: 'item_lost_wallet',
    title: 'Brown Fossil Leather Wallet with Student ID',
    category: 'Wallet',
    type: 'LOST',
    description: 'Lost my brown bi-fold wallet. Contains college ID card EC-2024-118, metro smart card, and some cash.',
    brand: 'Fossil',
    color: 'Brown',
    identifyingFeatures: 'Embossed initial "AP" in gold inside coin pocket.',
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    approximateTime: '01:15 PM',
    location: 'Cafeteria',
    specificLocation: 'Near juice counter seating booth',
    reportedBy: DEFAULT_USERS[1],
    status: 'ACTIVE',
    contactPreference: 'PORTAL',
    currentStorageLocation: 'Campus Security Main Office',
    history: [
      { action: 'REPORTED_LOST', performedBy: DEFAULT_USERS[1], timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), notes: 'Reported lost by Ananya Patel' },
    ],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    _id: 'item_found_headphones',
    title: 'Sony WH-1000XM4 Wireless Headphones in Case',
    category: 'Electronics',
    type: 'FOUND',
    description: 'Found black over-ear Sony headphones with protective carry case in Audio-Visual Seminar Hall 3.',
    brand: 'Sony',
    color: 'Black',
    identifyingFeatures: 'Audio cable and airplane adapter inside zippered mesh pocket.',
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    approximateTime: '11:00 AM',
    location: 'Auditorium',
    specificLocation: 'Seminar Hall 3 Row F Seat 12',
    reportedBy: DEFAULT_USERS[0],
    status: 'ACTIVE',
    currentStorageLocation: 'Campus Security Main Office - Cabinet A-12',
    history: [
      { action: 'REPORTED_FOUND', performedBy: DEFAULT_USERS[0], timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), notes: 'Handed over to security by student' },
    ],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    _id: 'item_handed_keys',
    title: 'Honda Motorcycle Key with Spider-Man Keychain',
    category: 'Keys',
    type: 'FOUND',
    description: 'Key found on asphalt in Student Two-Wheeler Parking Lot.',
    brand: 'Honda',
    color: 'Silver/Black',
    identifyingFeatures: 'Red Spider-Man silicone keychain with a small brass lock key attached.',
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    approximateTime: '09:00 AM',
    location: 'Parking Lot',
    specificLocation: 'Near Gate 2 Bike Stand #45',
    reportedBy: DEFAULT_USERS[2],
    status: 'HANDED_OVER',
    currentStorageLocation: 'Handed over to verified owner',
    history: [
      { action: 'REPORTED_FOUND', performedBy: DEFAULT_USERS[2], timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), notes: 'Logged into desk' },
      { action: 'CLAIM_APPROVED', performedBy: DEFAULT_USERS[2], timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), notes: 'Verified matching keychain.' },
      { action: 'HANDOVER_COMPLETED', performedBy: DEFAULT_USERS[2], timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), notes: 'Handed over to Rahul Sharma with ID check.' },
    ],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

const DEFAULT_CLAIMS = [
  {
    _id: 'claim_headphones_ananya',
    item: DEFAULT_ITEMS[3],
    claimant: DEFAULT_USERS[1],
    verificationAnswers: {
      uniqueFeature: 'Small scratch on left ear cup slider and airplane adapter in case',
      insideContents: 'Braided black 3.5mm audio jack wire',
      exactLocation: 'Seminar Hall 3 row 6 after AI lecture',
      lastSeenTime: 'Friday around 10:45 AM',
      additionalDetails: 'Bluetooth name is "Ananya XM4"',
    },
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    _id: 'claim_keys_rahul',
    item: DEFAULT_ITEMS[4],
    claimant: DEFAULT_USERS[0],
    verificationAnswers: {
      uniqueFeature: 'Spider-Man silicone character keychain with small brass Godrej key',
      insideContents: 'N/A',
      exactLocation: 'Gate 2 Bike Stand 45',
      lastSeenTime: 'Morning around 8:45 AM',
      additionalDetails: 'Honda Shine black key',
    },
    status: 'COMPLETED',
    reviewedBy: DEFAULT_USERS[2],
    reviewComment: 'Verified vehicle registration and physical matching keychain.',
    handoverDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    handoverStaff: DEFAULT_USERS[2],
    handoverNotes: 'Rahul Sharma presented College ID CS-2024-042.',
    claimantReceivedAck: true,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

const DEFAULT_NOTIFICATIONS = [
  {
    _id: 'notif_1',
    user: 'usr_student_rahul',
    title: 'High Match Found (100%)! 🎉',
    message: 'A found item "Apple MacBook Pro (Space Grey)" was reported at Central Library matching your lost report. Review and submit a claim!',
    type: 'MATCH',
    relatedItem: DEFAULT_ITEMS[1],
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    _id: 'notif_2',
    user: 'usr_student_rahul',
    title: 'Handover Completed! 🌟',
    message: 'Your item "Honda Motorcycle Key with Spider-Man Keychain" has been officially marked as handed over.',
    type: 'HANDOVER',
    relatedItem: DEFAULT_ITEMS[4],
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    _id: 'notif_3',
    user: 'usr_student_ananya',
    title: 'Claim Under Review',
    message: 'Your claim for "Sony WH-1000XM4 Wireless Headphones" has been received by Campus Security.',
    type: 'CLAIM_STATUS',
    relatedItem: DEFAULT_ITEMS[3],
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    _id: 'notif_4',
    user: 'usr_security_vikram',
    title: 'New Claim Pending Verification',
    message: 'Ananya Patel submitted a claim for "Sony WH-1000XM4 Wireless Headphones". Please review.',
    type: 'CLAIM_STATUS',
    relatedItem: DEFAULT_ITEMS[3],
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

// Helper to get collection from storage
export const getCollection = (key, defaultData = []) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(raw);
  } catch {
    return defaultData;
  }
};

export const setCollection = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initialize default storage on first load
export const initMockStorage = () => {
  if (!localStorage.getItem(DB_KEYS.USERS)) {
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem(DB_KEYS.ITEMS)) {
    localStorage.setItem(DB_KEYS.ITEMS, JSON.stringify(DEFAULT_ITEMS));
  }
  if (!localStorage.getItem(DB_KEYS.CLAIMS)) {
    localStorage.setItem(DB_KEYS.CLAIMS, JSON.stringify(DEFAULT_CLAIMS));
  }
  if (!localStorage.getItem(DB_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
  }
};

// Run initialization immediately
initMockStorage();

// Rule-based matching engine
export const computeMockMatches = (sourceItem, candidates) => {
  const matches = [];

  for (const candidate of candidates) {
    if (candidate._id === sourceItem._id) continue;
    if (candidate.type === sourceItem.type) continue;

    let score = 0;
    const breakdown = [];

    // Category (30 pts)
    if (sourceItem.category?.toLowerCase() === candidate.category?.toLowerCase()) {
      score += 30;
      breakdown.push({ criterion: 'Category Match', points: 30, maxPoints: 30, detail: `Both items categorized as "${sourceItem.category}"` });
    } else {
      breakdown.push({ criterion: 'Category Match', points: 0, maxPoints: 30, detail: 'Categories differ' });
    }

    // Brand (20 pts)
    const srcBrand = (sourceItem.brand || '').toLowerCase().trim();
    const candBrand = (candidate.brand || '').toLowerCase().trim();
    if (srcBrand && candBrand && (srcBrand === candBrand || srcBrand.includes(candBrand) || candBrand.includes(srcBrand))) {
      score += 20;
      breakdown.push({ criterion: 'Brand Match', points: 20, maxPoints: 20, detail: `Brand matches: "${sourceItem.brand}"` });
    } else {
      breakdown.push({ criterion: 'Brand Match', points: 0, maxPoints: 20, detail: 'Brands differ or not specified' });
    }

    // Color (15 pts)
    const srcColor = (sourceItem.color || '').toLowerCase().trim();
    const candColor = (candidate.color || '').toLowerCase().trim();
    if (srcColor && candColor && (srcColor === candColor || srcColor.includes(candColor) || candColor.includes(srcColor))) {
      score += 15;
      breakdown.push({ criterion: 'Color Match', points: 15, maxPoints: 15, detail: `Color matches: "${sourceItem.color}"` });
    } else {
      breakdown.push({ criterion: 'Color Match', points: 0, maxPoints: 15, detail: 'Colors differ or not specified' });
    }

    // Location (15 pts)
    const srcLoc = (sourceItem.location || '').toLowerCase().trim();
    const candLoc = (candidate.location || '').toLowerCase().trim();
    if (srcLoc && candLoc && srcLoc === candLoc) {
      score += 15;
      breakdown.push({ criterion: 'Location Similarity', points: 15, maxPoints: 15, detail: `Same campus location: "${sourceItem.location}"` });
    } else {
      breakdown.push({ criterion: 'Location Similarity', points: 0, maxPoints: 15, detail: 'Different campus zones' });
    }

    // Date proximity (10 pts)
    if (sourceItem.date && candidate.date) {
      const diffDays = Math.abs((new Date(sourceItem.date) - new Date(candidate.date)) / (1000 * 60 * 60 * 24));
      if (diffDays <= 2) {
        score += 10;
        breakdown.push({ criterion: 'Date Proximity', points: 10, maxPoints: 10, detail: 'Reported within 48 hours' });
      } else if (diffDays <= 7) {
        score += 6;
        breakdown.push({ criterion: 'Date Proximity', points: 6, maxPoints: 10, detail: 'Reported within 7 days' });
      }
    }

    // Keywords (10 pts)
    const srcWords = `${sourceItem.title} ${sourceItem.description}`.toLowerCase().split(/\s+/);
    const candWords = new Set(`${candidate.title} ${candidate.description}`.toLowerCase().split(/\s+/));
    const common = srcWords.filter((w) => w.length > 3 && candWords.has(w));
    if (common.length >= 2) {
      score += 10;
      breakdown.push({ criterion: 'Keyword Similarity', points: 10, maxPoints: 10, detail: `Common keywords: ${common.slice(0, 4).join(', ')}` });
    }

    if (score >= 20) {
      matches.push({
        item: candidate,
        score,
        percentage: Math.min(score, 100),
        breakdown,
      });
    }
  }

  matches.sort((a, b) => b.score - a.score);
  return matches;
};

export { DB_KEYS };
