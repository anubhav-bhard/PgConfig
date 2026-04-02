import React from 'react';
import { ConfigForm } from './components/ConfigForm';
import { ConfigResults } from './components/ConfigResults';
import { PGConfig, ServerSpecs } from './types';
import { calculatePGConfig } from './lib/pg-calculator';
import { Database, Github, Home, BookOpen, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [config, setConfig] = React.useState<PGConfig | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentSpecs, setCurrentSpecs] = React.useState<ServerSpecs | null>(null);

  const handleCalculate = (specs: ServerSpecs) => {
    setIsLoading(true);
    setCurrentSpecs(specs);
    setTimeout(() => {
      const result = calculatePGConfig(specs);
      setConfig(result);
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white text-slate-900 py-6 border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-primary rounded-xl shadow-lg shadow-brand-primary/20">
              <Database size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter leading-none text-slate-900">PGCONFIG</h1>
              <p className="text-[10px] text-brand-primary font-bold uppercase tracking-[0.2em]">Expert Builder</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-10">
            <a href="#" className="nav-link">Platform</a>
            <a href="#" className="nav-link">Industries</a>
            <a href="https://github.com/anubhav-bhard/pgconfig" target="_blank" rel="noopener noreferrer" className="nav-link">Contribute</a>
            <button className="btn-primary">Get Started</button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Input Section */}
        <section>
          <ConfigForm onCalculate={handleCalculate} isLoading={isLoading} />
        </section>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {config && (
            <motion.section
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="glass-card p-0 overflow-hidden"
            >
              <ConfigResults config={config} currentWorkload={currentSpecs?.workload || 'web'} />
            </motion.section>
          )}
        </AnimatePresence>

        {!config && !isLoading && (
          <div className="py-20 text-center space-y-4">
            <div className="inline-block p-6 bg-white rounded-full shadow-sm border border-slate-200">
              <Database size={48} className="text-slate-200" />
            </div>
            <h2 className="text-2xl font-bold text-slate-400">Ready to Build Your Config</h2>
            <p className="text-slate-400 max-w-md mx-auto">Adjust the server and database parameters above to generate an optimized PostgreSQL configuration.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <ShieldCheck size={14} />
            <span>Powered by PGConfig Expert Engine</span>
          </div>
          <div className="text-slate-400 text-xs">
            © 2026 BusinessNext PostgreSQL Configurator. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
