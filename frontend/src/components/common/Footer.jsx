import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Phone, Mail, MapPin, Clock, ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Purpose */}
          <div>
            <div className="flex items-center gap-2.5 text-white mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base tracking-tight">CampusTrack</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              A centralized, transparent, and secure Lost & Found management system designed for college students, faculty, and security administration.
            </p>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
              <Clock className="w-4 h-4" />
              <span>Office Desk: Mon - Sat (8:30 AM - 6:00 PM)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Quick Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/items" className="hover:text-indigo-400 transition">
                  Browse All Items
                </Link>
              </li>
              <li>
                <Link to="/report-lost" className="hover:text-rose-400 transition">
                  Report a Lost Item
                </Link>
              </li>
              <li>
                <Link to="/report-found" className="hover:text-emerald-400 transition">
                  Report a Found Item
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-indigo-400 transition">
                  Student Dashboard & Claims
                </Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-amber-400 transition">
                  Security Staff Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Verification Guidelines */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Verification & Safety</h4>
            <ul className="space-y-2 text-slate-400 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">•</span>
                Physical recovery requires presenting your valid College ID.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">•</span>
                Security cross-checks identifying features before item release.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">•</span>
                Sensitive internal item details remain protected against fake claims.
              </li>
            </ul>
          </div>

          {/* Contact & Campus Helpdesk */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Campus Security Office</h4>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Central Security Room, Ground Floor, Admin Block</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Helpline: +91 (080) 2345-6789 / Ext: 402</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>lostandfound@college.edu</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} College Lost & Found Management System. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with React, Node.js & MongoDB
          </p>
        </div>
      </div>
    </footer>
  );
};
