'use client';

import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Mail, Send, Twitter, Linkedin, Github, Globe, Heart, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export function Footer() {
  const { t, language } = useI18n();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleNewsletterSignup = () => {
    if (email) {
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
      setEmail('');
    }
  };

  const footerLinks = {
    product: {
      en: ['Features', 'Pricing', 'Security', 'API'],
      si: ['විශේෂාංග', 'මිල ගණන්', 'ආරක්ෂාව', 'API']
    },
    company: {
      en: ['About Us', 'Blog', 'Careers', 'Press'],
      si: ['අපි ගැන', 'බ්ලොග්', 'රැකියා', 'පුවත්']
    },
    legal: {
      en: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'],
      si: ['රහස්‍යතා ප්‍රතිපත්තිය', 'සේවා කොන්දේසි', 'කුකී ප්‍රතිපත්තිය', 'GDPR']
    },
    support: {
      en: ['Help Center', 'Documentation', 'Community', 'Contact Us'],
      si: ['උදව් මධ්‍යස්ථානය', 'ලේඛනගත කිරීම', 'ප්‍රජාව', 'අමතන්න']
    }
  };

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-blue-400' },
    { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:text-blue-600' },
    { icon: Github, href: '#', label: 'GitHub', color: 'hover:text-gray-900' },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-xl bg-linear-to-r from-primary to-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                  UB
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    UniBridge
                  </h3>
                  <p className="text-xs text-gray-500">Education Connected</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {language === 'en' 
                  ? 'UniBridge is a secure university platform that connects students, parents, and lecturers through seamless communication and academic management.'
                  : 'යුනිබ්‍රිජ් යනු සිසුන්, දෙමාපියන් සහ දේශකයන් සුමට සන්නිවේදනය සහ අධ්‍යාපන කළමනාකරණය තුළින් සම්බන්ධ කරන ආරක්ෂිත විශ්වවිද්‍යාල වේදිකාවකි.'}
              </p>
              <div className="flex gap-3">
                {socialLinks.map((social, idx) => (
                  <motion.a
                    key={idx}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 rounded-lg bg-gray-50 text-gray-600 ${social.color} transition-all hover:bg-gray-100`}
                    aria-label={social.label}
                  >
                    <social.icon className="h-4 w-4" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Links Sections */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                {language === 'en' ? 'Product' : 'නිෂ්පාදනය'}
              </h4>
              <ul className="space-y-2">
                {footerLinks.product[language === 'en' ? 'en' : 'si'].map((item, idx) => (
                  <li key={idx}>
                    <a href="#" className="text-sm text-gray-600 hover:text-primary transition-colors flex items-center gap-1 group">
                      <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                {language === 'en' ? 'Company' : 'සමාගම'}
              </h4>
              <ul className="space-y-2">
                {footerLinks.company[language === 'en' ? 'en' : 'si'].map((item, idx) => (
                  <li key={idx}>
                    <a href="#" className="text-sm text-gray-600 hover:text-primary transition-colors flex items-center gap-1 group">
                      <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                {language === 'en' ? 'Legal' : 'නීතිමය'}
              </h4>
              <ul className="space-y-2">
                {footerLinks.legal[language === 'en' ? 'en' : 'si'].map((item, idx) => (
                  <li key={idx}>
                    <a href="#" className="text-sm text-gray-600 hover:text-primary transition-colors flex items-center gap-1 group">
                      <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-8 border-t border-gray-100">
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {language === 'en' ? 'Stay Updated' : 'යාවත්කාලීන රැඳෙන්න'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {language === 'en'
                    ? 'Get the latest updates about notices, announcements, and academic events delivered to your inbox.'
                    : 'දැනුවත්කිරීම්, නිවේදන සහ අධ්‍යාපනික සිදුවීම් පිළිබඳ නවතම යාවත්කාලීන කිරීම් ඔබගේ ඊමේල් ලබා ගන්න.'}
                </p>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder={language === 'en' ? 'Enter your email' : 'ඔබගේ ඊමේල් ඇතුළත් කරන්න'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleNewsletterSignup}
                    className="bg-linear-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white gap-2 shadow-sm"
                  >
                    {isSubmitted ? (
                      <>
                        <Heart className="h-4 w-4 fill-current" />
                        {language === 'en' ? 'Subscribed!' : 'දායක විය!'}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {language === 'en' ? 'Subscribe' : 'දායක වන්න'}
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="py-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <p>© {currentYear} UniBridge. {language === 'en' ? 'All rights reserved.' : 'සියලුම හිමිකම් ඇවිරිණි.'}</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary transition-colors">
              {language === 'en' ? 'Privacy' : 'රහස්‍යතාව'}
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              {language === 'en' ? 'Terms' : 'කොන්දේසි'}
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              {language === 'en' ? 'Cookies' : 'කුකීස්'}
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              {language === 'en' ? 'Contact' : 'අමතන්න'}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}