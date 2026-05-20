'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/src/components/admin/Sidebar';
import { SF_STYLES } from '@/src/lib/constants/styles';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Shared Layout for the Admin Portal
 * Includes the Sidebar and main content area
 * Also handles authentication protection for admin routes
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for admin token in localStorage
    const adminToken = localStorage.getItem('adminToken');
    const isLoginPage = pathname === '/admin/login';

    if (!adminToken && !isLoginPage) {
      // Not logged in and not on login page -> redirect to login
      router.replace('/admin/login');
    } else if (adminToken && isLoginPage) {
      // Logged in but on login page -> redirect to dashboard
      router.replace('/admin/dashboard');
    } else {
      // Authorized state
      setIsAuthorized(true);
    }
    setIsLoading(false);
  }, [pathname, router]);

  // Don't show anything while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f2f1]">
        <div className="text-sm font-semibold text-[#605e5c]">Verifying session...</div>
      </div>
    );
  }

  // On login page, don't show the sidebar layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Only render children if authorized
  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: SF_STYLES.colors.background }}>
      <Sidebar />
      <main 
        className="flex-1 min-h-screen"
        style={{ marginLeft: SF_STYLES.sidebarWidth }}
      >
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

