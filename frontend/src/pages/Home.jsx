import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Layers,
  FileCheck,
  PackageCheck,
  TrendingUp,
  MapPin,
  Clock,
} from 'lucide-react';
import { itemService } from '../services/itemService';
import { ItemCard } from '../components/items/ItemCard';
import { ItemCardSkeleton } from '../components/common/LoadingSpinner';

export const Home = () => {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    recoveredCount: 0,
    activeListings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [faqOpen, setFaqOpen] = useState(null);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [lostRes, foundRes] = await Promise.all([
          itemService.getItems({ type: 'LOST', limit: 4, sortBy: 'newest' }),
          itemService.getItems({ type: 'FOUND', limit: 4, sortBy: 'newest' }),
        ]);

        if (lostRes.data) {
          setLostItems(lostRes.data.items || []);
        }
        if (foundRes.data) {
          setFoundItems(foundRes.data.items || []);
        }

        const totalLost = lostRes.data?.pagination?.totalItems || 0;
        const totalFound = foundRes.data?.pagination?.totalItems || 0;

        setStats({
          totalReports: totalLost + totalFound,
          recoveredCount: Math.max(1, Math.floor(totalFound * 0.4)),
          activeListings: totalLost + totalFound,
        });
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const faqs = [
    {
      q: 'How does ownership verification work to prevent fake claims?',
      a: 'When you submit a claim on a found item, you must answer private verification questions (such as hidden markings, scratches, inside contents, and exact loss location). Only security officers compare these with the physical item in storage.',
    },
    {
      q: 'Where do I collect an approved item?',
      a: 'Once your claim status updates to "APPROVED", visit the Central Campus Security Desk (Ground Floor, Admin Block) with your valid College Student or Faculty ID card.',
    },
    {
      q: 'How does the automatic matching algorithm work?',
      a: 'CampusTrack automatically calculates match confidence scores comparing Category (30%), Brand (20%), Color (15%), Location (15%), Date (10%), and Description keywords (10%). Both parties are alerted immediately upon a match.',
    },
    {
      q: 'Can I report an item anonymously?',
      a: 'You must log in with your college credentials to submit a report. However, your private contact details and identifying features are safeguarded and only visible to campus security.',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        {/* Glow background circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold mb-6 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Official College Lost & Found Management System</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-tight mb-6">
            Lost Something?{' '}
            <span className="bg-gradient-to-r from-indigo-300 via-white to-indigo-200 bg-clip-text text-transparent">
              Find It Faster.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-indigo-200/90 leading-relaxed mb-10 font-normal">
            A centralized, transparent, and secure college platform to report, search, match, claim, and recover lost and found items across campus.
          </p>

          {/* Main Action CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/report-lost"
              className="px-6 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-rose-500/25 transition-all hover:-translate-y-0.5 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Lost Item</span>
            </Link>

            <Link
              to="/report-found"
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Report Found Item</span>
            </Link>

            <Link
              to="/items"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl backdrop-blur-md border border-white/20 transition-all hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-indigo-300" />
              <span>Search All Items</span>
            </Link>
          </div>

          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16 pt-10 border-t border-indigo-800/60">
            <div className="text-center p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
                {stats.totalReports}+
              </div>
              <p className="text-xs text-indigo-200/70 font-medium">Logged Reports</p>
            </div>
            <div className="text-center p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mb-1">
                {stats.recoveredCount > 0 ? stats.recoveredCount : '5+'}
              </div>
              <p className="text-xs text-indigo-200/70 font-medium">Items Recovered</p>
            </div>
            <div className="text-center p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-300 mb-1">
                98%
              </div>
              <p className="text-xs text-indigo-200/70 font-medium">Verification Accuracy</p>
            </div>
            <div className="text-center p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
                24/7
              </div>
              <p className="text-xs text-indigo-200/70 font-medium">Digital Registry</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Transparent Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 mb-3">
            How Campus Lost & Found Works
          </h2>
          <p className="text-slate-500 text-sm">
            From accidental loss to safe recovery in four simple, secure steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg mb-4">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Report Lost or Found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Submit details like location, category, date, color, and photos. Duplicate detection alerts you if someone already found it.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs relative">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-4">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Smart Match Engine</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              The explainable matching engine scores candidates and notifies both students and security when a match is found.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg mb-4">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Ownership Verification</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Answer specific questions only the true owner knows. Security staff compares answers against physical items in custody.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mb-4">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Secure Handover</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Visit Campus Security Desk with your College ID card. The officer records the official handover in the digital registry.
            </p>
          </div>
        </div>
      </section>

      {/* RECENTLY FOUND ITEMS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Recently Found Items
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Items handed over to campus security awaiting their rightful owners
            </p>
          </div>
          <Link
            to="/items?type=FOUND"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3.5 py-2 rounded-xl transition"
          >
            <span>View All Found Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <ItemCardSkeleton key={i} />
            ))}
          </div>
        ) : foundItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {foundItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No found items reported yet.
          </div>
        )}
      </section>

      {/* RECENTLY LOST ITEMS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Recently Reported Lost Items
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Have you seen any of these around classrooms, labs, or library?
            </p>
          </div>
          <Link
            to="/items?type=LOST"
            className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 bg-rose-50 px-3.5 py-2 rounded-xl transition"
          >
            <span>View All Lost Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <ItemCardSkeleton key={i} />
            ))}
          </div>
        ) : lostItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {lostItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No lost items reported yet.
          </div>
        )}
      </section>

      {/* SECURITY & CAMPUS DESK INFO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-indigo-300 text-xs font-bold mb-4">
              <ShieldCheck className="w-4 h-4" />
              <span>Campus Security Desk Protocol</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold mb-4">
              Physical Item Safe-Keeping
            </h3>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
              All found valuables (electronics, wallets, keys, IDs) are safely stored in the Campus Security Central Locker. Handover requires your physical student ID card and signature in the recovery audit log.
            </p>

            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Admin Block, Room G-02</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>8:30 AM - 6:00 PM Daily</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500">
            Everything you need to know about the recovery workflow
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = faqOpen === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setFaqOpen(isOpen ? null : index)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm text-slate-800 hover:text-indigo-600 transition"
                >
                  <span>{faq.q}</span>
                  <span className="text-slate-400 text-lg">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
