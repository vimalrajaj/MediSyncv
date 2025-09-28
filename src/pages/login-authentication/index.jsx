import React from 'react';
import LoginForm from './components/LoginForm';
import Icon from '../../components/AppIcon';
import GovHeaderBar from '../../components/GovHeaderBar';

const LoginAuthentication = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <GovHeaderBar />

      {/* Main Content - Full Width Grid */}
  <main className="relative flex-1 w-full grid lg:grid-cols-2 min-h-[calc(100vh-72px)] overflow-hidden bg-gradient-to-br from-teal-50 via-white to-indigo-50">
        {/* Decorative gradient shapes only for main (exclude header) */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-white to-green-600 opacity-70" />
          <div className="absolute -left-40 -top-40 w-[34rem] h-[34rem] bg-teal-200/40 rounded-full blur-3xl" />
          <div className="absolute right-[-6rem] bottom-[-6rem] w-[28rem] h-[28rem] bg-indigo-200/40 rounded-full blur-3xl" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] bg-white/40 rounded-full blur-[120px]" />
        </div>
        {/* Hero / Information Panel */}
        <section className="relative flex items-center justify-center p-8 lg:p-14">
          <div className="relative max-w-2xl mx-auto space-y-10">
            <div className="flex items-center space-x-4">
              <Icon name="Shield" size={54} className="text-teal-600 drop-shadow" />
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
                Unified AYUSH Terminology & Morbidity Intelligence
              </h2>
            </div>
            <p className="text-lg lg:text-xl text-gray-700 leading-relaxed font-medium">
              A national platform enabling standardized AYUSH clinical terminology, dual coding (NAMASTE & ICD-11), and secure ABHA-linked FHIR R4 interoperability for research, governance, and clinical excellence.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Feature icon="CheckCircle" color="text-green-600" label="FHIR R4 Interoperability" />
              <Feature icon="Shield" color="text-blue-600" label="ABHA Secure Access" />
              <Feature icon="FileText" color="text-purple-600" label="NAMASTE + ICD-11 Coding" />
              <Feature icon="Award" color="text-orange-600" label="Standards & Auditability" />
            </div>
            <div className="pt-4 border-t border-gray-200/60">
              <p className="text-sm text-gray-500 tracking-wide uppercase font-semibold">Powered by Team InterOpX</p>
            </div>
          </div>
        </section>

        {/* Login Panel */}
        <section className="relative flex items-stretch p-0">
          <div className="relative w-full h-full flex">
            <LoginForm />
          </div>
        </section>
      </main>
    </div>
  );
};

// Small feature component for cleaner JSX
const Feature = ({ icon, color, label }) => (
  <div className="flex items-center space-x-3 bg-white/70 border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
    <Icon name={icon} size={20} className={color} />
    <span className="text-gray-800 text-sm font-medium">{label}</span>
  </div>
);

export default LoginAuthentication;