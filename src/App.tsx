import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { OverviewView } from './components/OverviewView';
import { InvestigationsView } from './components/InvestigationsView';
import { RecoveryActionsView } from './components/RecoveryActionsView';
import { RevenueLeaksView } from './components/RevenueLeaksView';
import { TransactionsView } from './components/TransactionsView';
import { CustomersView } from './components/CustomersView';
import { AuditTrailView } from './components/AuditTrailView';
import { SettingsView } from './components/SettingsView';
import { InvestigationDetailModal } from './components/InvestigationDetailModal';
import { ApprovalModal } from './components/ApprovalModal';
import { AIChatInvestigator } from './components/AIChatInvestigator';
import { ScanModal } from './components/ScanModal';

const MainLayout: React.FC = () => {
  const { currentTab, selectedInvestigation, closeInvestigationModal } = useApp();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0F172A] font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50">
        {/* Global Top Navbar */}
        <TopNavbar />

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto relative custom-scrollbar bg-slate-50">
          {currentTab === 'overview' && <OverviewView />}
          {currentTab === 'investigations' && <InvestigationsView />}
          {currentTab === 'actions' && <RecoveryActionsView />}
          {currentTab === 'leaks' && <RevenueLeaksView />}
          {currentTab === 'transactions' && <TransactionsView />}
          {currentTab === 'customers' && <CustomersView />}
          {currentTab === 'audit' && <AuditTrailView />}
          {currentTab === 'settings' && <SettingsView />}
        </main>

        {/* Floating AI Forensic Investigator Chat */}
        <AIChatInvestigator />

        {/* AI Revenue Investigator Scan Modal */}
        <ScanModal />

        {/* Forensic Investigation Detail Modal */}
        {selectedInvestigation && (
          <InvestigationDetailModal
            investigation={selectedInvestigation}
            onClose={closeInvestigationModal}
          />
        )}

        {/* Merchant Bounded Action Authorization Modal */}
        <ApprovalModal />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
