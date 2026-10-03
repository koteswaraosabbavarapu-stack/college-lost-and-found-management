const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Notification = require('../models/Notification');
const Category = require('../models/Category');
const AuditLog = require('../models/AuditLog');

dotenv.config({ path: require('path').join(__dirname, '..', '.env') });

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to database. Clearing existing data...');

    await Promise.all([
      User.deleteMany(),
      Item.deleteMany(),
      Claim.deleteMany(),
      Notification.deleteMany(),
      Category.deleteMany(),
      AuditLog.deleteMany(),
    ]);

    console.log('[Seed] Seeding Categories...');
    const categoriesData = [
      { name: 'Electronics', description: 'Laptops, phones, headphones, chargers, calculators', icon: 'Laptop' },
      { name: 'Documents', description: 'Certificates, project files, notebooks, assignment folders', icon: 'FileText' },
      { name: 'Wallet', description: 'Wallets, purses, money clips, pouches', icon: 'Wallet' },
      { name: 'Keys', description: 'Hostel keys, bike/car keys, locker keys, keychains', icon: 'Key' },
      { name: 'Books', description: 'Textbooks, library books, novels, diaries', icon: 'BookOpen' },
      { name: 'Bags', description: 'Backpacks, laptop bags, duffle bags, totes', icon: 'ShoppingBag' },
      { name: 'Accessories', description: 'Watches, glasses, jewellery, umbrellas, caps', icon: 'Watch' },
      { name: 'Clothing', description: 'Jackets, hoodies, lab coats, sports jerseys', icon: 'Shirt' },
      { name: 'ID Cards', description: 'College ID cards, library cards, driving licenses, RFID cards', icon: 'CreditCard' },
      { name: 'Other', description: 'Water bottles, sports gear, musical instruments, etc.', icon: 'Package' },
    ];
    await Category.insertMany(categoriesData);

    console.log('[Seed] Seeding Users...');
    // Create Users
    const student1 = await User.create({
      name: 'Rahul Sharma',
      email: 'student@college.edu',
      collegeId: 'CS-2024-042',
      password: 'password123',
      role: 'USER',
      department: 'Computer Science & Engineering',
      phone: '+91 98765 43210',
    });

    const student2 = await User.create({
      name: 'Ananya Patel',
      email: 'ananya@college.edu',
      collegeId: 'EC-2024-118',
      password: 'password123',
      role: 'USER',
      department: 'Electronics & Communication',
      phone: '+91 98765 43211',
    });

    const securityStaff = await User.create({
      name: 'Chief Officer Vikram Rao',
      email: 'security@college.edu',
      collegeId: 'SEC-OFFICER-07',
      password: 'password123',
      role: 'SECURITY',
      department: 'Campus Safety & Security',
      phone: '+91 98765 43212',
    });

    const adminUser = await User.create({
      name: 'Dr. Meera Sen (Dean Admin)',
      email: 'admin@college.edu',
      collegeId: 'ADM-9901',
      password: 'password123',
      role: 'ADMIN',
      department: 'Dean Student Affairs & IT',
      phone: '+91 98765 43213',
    });

    console.log('[Seed] Seeding Items...');
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    // 1. Lost Item (Rahul)
    const lostMacbook = await Item.create({
      title: 'Space Grey MacBook Pro 14" M2',
      category: 'Electronics',
      type: 'LOST',
      description: 'Left my laptop on the study table near the reference section. It has a matte screen protector and stickers on the lid including GitHub and React logos.',
      brand: 'Apple',
      color: 'Space Grey',
      identifyingFeatures: 'Small scratch near USB-C port, GitHub Octocat sticker and React logo sticker on lid.',
      date: twoDaysAgo,
      approximateTime: '04:30 PM',
      location: 'Central Library',
      specificLocation: '2nd Floor Reference Section Table #14',
      reportedBy: student1._id,
      status: 'ACTIVE',
      contactPreference: 'PORTAL',
      history: [
        {
          action: 'REPORTED_LOST',
          performedBy: student1._id,
          timestamp: twoDaysAgo,
          notes: 'Reported lost by Rahul Sharma',
        },
      ],
    });

    // 2. Found Item (Matches Rahul's MacBook!)
    const foundMacbook = await Item.create({
      title: 'Apple MacBook Pro (Space Grey) in Sleeve',
      category: 'Electronics',
      type: 'FOUND',
      description: 'Found unattended laptop on 2nd floor library study table after evening closing. Deposited at Central Security Desk.',
      brand: 'Apple',
      color: 'Space Grey',
      identifyingFeatures: 'Has tech stickers on lid including Octocat and React. Battery was at 42%.',
      date: twoDaysAgo,
      approximateTime: '06:15 PM',
      location: 'Central Library',
      specificLocation: '2nd Floor study desk near books rack',
      reportedBy: securityStaff._id,
      status: 'ACTIVE',
      currentStorageLocation: 'Campus Security Main Office - Secure Locker B-04',
      history: [
        {
          action: 'REPORTED_FOUND',
          performedBy: securityStaff._id,
          timestamp: twoDaysAgo,
          notes: 'Logged into security locker B-04',
        },
      ],
    });

    // 3. Lost Item (Ananya)
    const lostWallet = await Item.create({
      title: 'Brown Fossil Leather Wallet with Student ID',
      category: 'Wallet',
      type: 'LOST',
      description: 'Lost my brown bi-fold wallet. Contains college ID card EC-2024-118, metro smart card, and some cash.',
      brand: 'Fossil',
      color: 'Brown',
      identifyingFeatures: 'Embossed initial "AP" in gold inside coin pocket.',
      date: oneDayAgo,
      approximateTime: '01:15 PM',
      location: 'Cafeteria',
      specificLocation: 'Near juice counter seating booth',
      reportedBy: student2._id,
      status: 'ACTIVE',
      contactPreference: 'PORTAL',
      history: [
        {
          action: 'REPORTED_LOST',
          performedBy: student2._id,
          timestamp: oneDayAgo,
          notes: 'Reported lost by Ananya Patel',
        },
      ],
    });

    // 4. Found Item - Sony Headphones (Open for Claim)
    const foundHeadphones = await Item.create({
      title: 'Sony WH-1000XM4 Wireless Headphones in Case',
      category: 'Electronics',
      type: 'FOUND',
      description: 'Found black over-ear Sony headphones with protective carry case in Audio-Visual Seminar Hall 3.',
      brand: 'Sony',
      color: 'Black',
      identifyingFeatures: 'Audio cable and airplane adapter inside zippered mesh pocket.',
      date: threeDaysAgo,
      approximateTime: '11:00 AM',
      location: 'Auditorium',
      specificLocation: 'Seminar Hall 3 Row F Seat 12',
      reportedBy: student1._id,
      status: 'ACTIVE',
      currentStorageLocation: 'Campus Security Main Office - Cabinet A-12',
      history: [
        {
          action: 'REPORTED_FOUND',
          performedBy: student1._id,
          timestamp: threeDaysAgo,
          notes: 'Handed over to security by student',
        },
      ],
    });

    // 5. Found Item - Bike Keys (Completed Handover)
    const handedOverKeys = await Item.create({
      title: 'Honda Motorcycle Key with Spider-Man Keychain',
      category: 'Keys',
      type: 'FOUND',
      description: 'Key found on asphalt in Student Two-Wheeler Parking Lot.',
      brand: 'Honda',
      color: 'Silver/Black',
      identifyingFeatures: 'Red Spider-Man silicone keychain with a small brass lock key attached.',
      date: fiveDaysAgo,
      approximateTime: '09:00 AM',
      location: 'Parking Lot',
      specificLocation: 'Near Gate 2 Bike Stand #45',
      reportedBy: securityStaff._id,
      status: 'HANDED_OVER',
      currentStorageLocation: 'Handed over to verified owner',
      history: [
        {
          action: 'REPORTED_FOUND',
          performedBy: securityStaff._id,
          timestamp: fiveDaysAgo,
          notes: 'Logged into desk',
        },
        {
          action: 'CLAIM_APPROVED',
          performedBy: securityStaff._id,
          timestamp: threeDaysAgo,
          notes: 'Claim approved after verified matching keychain and registration match.',
        },
        {
          action: 'HANDOVER_COMPLETED',
          performedBy: securityStaff._id,
          timestamp: twoDaysAgo,
          notes: 'Owner verified in person with College ID and Bike RC.',
        },
      ],
    });

    // 6. Lost Item - Casio Calculator
    await Item.create({
      title: 'Casio Scientific Calculator FX-991EX ClassWiz',
      category: 'Electronics',
      type: 'LOST',
      description: 'Forgot calculator on desk in Engineering Block Lab 204 during lab exam.',
      brand: 'Casio',
      color: 'Black/White',
      identifyingFeatures: 'Engraved initials "RS" on the back battery cover slider.',
      date: threeDaysAgo,
      approximateTime: '03:00 PM',
      location: 'Engineering Block',
      specificLocation: 'Lab 204 Bench 8',
      reportedBy: student1._id,
      status: 'ACTIVE',
      history: [
        {
          action: 'REPORTED_LOST',
          performedBy: student1._id,
          timestamp: threeDaysAgo,
          notes: 'Reported lost',
        },
      ],
    });

    // 7. Found Item - Water Bottle
    await Item.create({
      title: 'Milton 1L Stainless Steel Thermos Flask (Navy Blue)',
      category: 'Other',
      type: 'FOUND',
      description: 'Blue insulated water bottle left behind near badminton courts.',
      brand: 'Milton',
      color: 'Navy Blue',
      identifyingFeatures: 'Dent on the bottom rim, silver carabiner attached to handle.',
      date: oneDayAgo,
      approximateTime: '05:30 PM',
      location: 'Sports Complex',
      specificLocation: 'Badminton Court 2 spectator bench',
      reportedBy: securityStaff._id,
      status: 'ACTIVE',
      currentStorageLocation: 'Sports Complex Helpdesk',
      history: [
        {
          action: 'REPORTED_FOUND',
          performedBy: securityStaff._id,
          timestamp: oneDayAgo,
          notes: 'Found by groundskeeper',
        },
      ],
    });

    console.log('[Seed] Seeding Claims...');
    // PENDING Claim on Sony Headphones by Ananya
    const pendingClaim = await Claim.create({
      item: foundHeadphones._id,
      claimant: student2._id,
      verificationAnswers: {
        uniqueFeature: 'Has a small scratch on left ear cup slider and an airplane adapter in the case pouch',
        insideContents: 'Braided black 3.5mm audio jack wire and gold plated airplane two-prong converter',
        exactLocation: 'Left on the 6th row seat of Seminar Hall 3 after the Guest Lecture on AI',
        lastSeenTime: 'Friday around 10:45 AM before tea break',
        additionalDetails: 'Bluetooth device name is "Ananya XM4". I can connect my phone to prove ownership on spot.',
      },
      status: 'PENDING',
    });

    // COMPLETED Claim on Bike Keys by Rahul
    const completedClaim = await Claim.create({
      item: handedOverKeys._id,
      claimant: student1._id,
      verificationAnswers: {
        uniqueFeature: 'Spider-Man silicone character keychain with a small brass Godrej padlock key on same ring',
        insideContents: 'N/A (Key ring)',
        exactLocation: 'Fell from jacket pocket while parking my bike near Gate 2 Stand 45',
        lastSeenTime: 'Morning around 8:45 AM',
        additionalDetails: 'Honda Shine black key with chassis code tag',
      },
      status: 'COMPLETED',
      reviewedBy: securityStaff._id,
      reviewedAt: threeDaysAgo,
      reviewComment: 'Verified vehicle registration and physical matching keychain.',
      handoverDate: twoDaysAgo,
      handoverStaff: securityStaff._id,
      handoverNotes: 'Rahul Sharma presented College ID CS-2024-042 and matched bike registration.',
      claimantReceivedAck: true,
    });

    console.log('[Seed] Seeding Notifications...');
    await Notification.create([
      {
        user: student1._id,
        title: 'High Match Found (85%)! 🎉',
        message: `A found item "Apple MacBook Pro (Space Grey)" was reported at Central Library matching your lost report. Review and submit a claim!`,
        type: 'MATCH',
        relatedItem: foundMacbook._id,
        isRead: false,
      },
      {
        user: student1._id,
        title: 'Handover Completed! 🌟',
        message: `Your item "Honda Motorcycle Key with Spider-Man Keychain" has been officially marked as handed over.`,
        type: 'HANDOVER',
        relatedItem: handedOverKeys._id,
        relatedClaim: completedClaim._id,
        isRead: true,
      },
      {
        user: student2._id,
        title: 'Claim Under Review',
        message: `Your claim for "Sony WH-1000XM4 Wireless Headphones" has been received by Campus Security.`,
        type: 'CLAIM_STATUS',
        relatedItem: foundHeadphones._id,
        relatedClaim: pendingClaim._id,
        isRead: false,
      },
      {
        user: securityStaff._id,
        title: 'New Claim Pending Verification',
        message: `Ananya Patel submitted a claim for "Sony WH-1000XM4 Wireless Headphones". Please review.`,
        type: 'CLAIM_STATUS',
        relatedItem: foundHeadphones._id,
        relatedClaim: pendingClaim._id,
        isRead: false,
      },
      {
        user: adminUser._id,
        title: 'System Activity Alert',
        message: `Portal statistics: 7 items recorded, 1 recovery completed this week.`,
        type: 'SYSTEM',
        isRead: false,
      },
    ]);

    console.log('[Seed] Seeding Audit Logs...');
    await AuditLog.create([
      {
        action: 'USER_REGISTERED',
        entityType: 'AUTH',
        entityId: student1._id,
        performedBy: student1._id,
        performedByName: `${student1.name} (USER)`,
        details: { email: student1.email, collegeId: student1.collegeId },
      },
      {
        action: 'ITEM_REPORTED_LOST',
        entityType: 'ITEM',
        entityId: lostMacbook._id,
        performedBy: student1._id,
        performedByName: `${student1.name} (USER)`,
        details: { title: lostMacbook.title, category: lostMacbook.category },
      },
      {
        action: 'ITEM_REPORTED_FOUND',
        entityType: 'ITEM',
        entityId: foundMacbook._id,
        performedBy: securityStaff._id,
        performedByName: `${securityStaff.name} (SECURITY)`,
        details: { title: foundMacbook.title, storage: foundMacbook.currentStorageLocation },
      },
      {
        action: 'CLAIM_APPROVED',
        entityType: 'CLAIM',
        entityId: completedClaim._id,
        performedBy: securityStaff._id,
        performedByName: `${securityStaff.name} (SECURITY)`,
        details: { claimant: student1.name, itemTitle: handedOverKeys.title },
      },
      {
        action: 'HANDOVER_COMPLETED',
        entityType: 'CLAIM',
        entityId: completedClaim._id,
        performedBy: securityStaff._id,
        performedByName: `${securityStaff.name} (SECURITY)`,
        details: { claimant: student1.name, staff: securityStaff.name },
      },
    ]);

    console.log('===========================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('===========================================================');
    console.log('🔑 DEMO ACCOUNTS READY TO TEST:');
    console.log('1. Student User:');
    console.log('   Email:    student@college.edu');
    console.log('   Password: password123');
    console.log('2. Student User 2:');
    console.log('   Email:    ananya@college.edu');
    console.log('   Password: password123');
    console.log('3. Security Staff:');
    console.log('   Email:    security@college.edu');
    console.log('   Password: password123');
    console.log('4. Admin User:');
    console.log('   Email:    admin@college.edu');
    console.log('   Password: password123');
    console.log('===========================================================');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
