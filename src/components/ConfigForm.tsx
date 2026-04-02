import React from 'react';
import { ServerSpecs, WorkloadType, StorageType, OSType, ArchType } from '../types';
import { Minus, Plus, Server, Database as DbIcon } from 'lucide-react';

interface ConfigFormProps {
  onCalculate: (specs: ServerSpecs) => void;
  isLoading: boolean;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({ onCalculate, isLoading }) => {
  const [specs, setSpecs] = React.useState<ServerSpecs>({
    os: 'linux',
    arch: 'x86_64',
    vcpu: 2,
    ram: 4,
    concurrency: 100,
    workload: 'web',
    storage: 'ssd',
    pgVersion: 18,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(specs);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSpecs(prev => ({
      ...prev,
      [name]: name === 'pgVersion' ? Number(value) : value,
    }));
  };

  const updateNumeric = (name: keyof ServerSpecs, delta: number) => {
    setSpecs(prev => {
      const val = (prev[name] as number) + delta;
      return { ...prev, [name]: Math.max(1, val) };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Server Section */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Server size={20} className="text-brand-primary" />
            <h3 className="font-bold text-slate-800">Server</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Operating system</label>
              <select name="os" value={specs.os} onChange={handleSelectChange} className="input-field">
                <option value="linux">GNU/Linux Based</option>
                <option value="windows">Windows</option>
                <option value="macos">macOS</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Architecture</label>
              <select name="arch" value={specs.arch} onChange={handleSelectChange} className="input-field">
                <option value="x86_64">64 Bits (x86-64)</option>
                <option value="arm64">ARM 64</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Storage type</label>
              <select name="storage" value={specs.storage} onChange={handleSelectChange} className="input-field">
                <option value="ssd">SSD Storage</option>
                <option value="hdd">HDD Storage</option>
                <option value="network">Network Storage</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Number of CPUs</label>
              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-md border border-slate-200">
                <button type="button" onClick={() => updateNumeric('vcpu', -1)} className="btn-icon h-8 w-8 flex items-center justify-center"><Minus size={14} /></button>
                <input 
                  type="number" 
                  value={specs.vcpu} 
                  onChange={(e) => setSpecs(prev => ({ ...prev, vcpu: Math.max(1, parseInt(e.target.value) || 0) }))}
                  className="flex-1 text-center font-bold bg-transparent border-none focus:ring-0 p-0 w-full"
                />
                <button type="button" onClick={() => updateNumeric('vcpu', 1)} className="btn-icon h-8 w-8 flex items-center justify-center"><Plus size={14} /></button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Total Memory (GB)</label>
              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-md border border-slate-200">
                <button type="button" onClick={() => updateNumeric('ram', -1)} className="btn-icon h-8 w-8 flex items-center justify-center"><Minus size={14} /></button>
                <input 
                  type="number" 
                  value={specs.ram} 
                  onChange={(e) => setSpecs(prev => ({ ...prev, ram: Math.max(1, parseInt(e.target.value) || 0) }))}
                  className="flex-1 text-center font-bold bg-transparent border-none focus:ring-0 p-0 w-full"
                />
                <button type="button" onClick={() => updateNumeric('ram', 1)} className="btn-icon h-8 w-8 flex items-center justify-center"><Plus size={14} /></button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Max connections</label>
              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-md border border-slate-200">
                <button type="button" onClick={() => updateNumeric('concurrency', -10)} className="btn-icon h-8 w-8 flex items-center justify-center"><Minus size={14} /></button>
                <input 
                  type="number" 
                  value={specs.concurrency} 
                  onChange={(e) => setSpecs(prev => ({ ...prev, concurrency: Math.max(1, parseInt(e.target.value) || 0) }))}
                  className="flex-1 text-center font-bold bg-transparent border-none focus:ring-0 p-0 w-full"
                />
                <button type="button" onClick={() => updateNumeric('concurrency', 10)} className="btn-icon h-8 w-8 flex items-center justify-center"><Plus size={14} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Database Section */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <DbIcon size={20} className="text-brand-primary" />
            <h3 className="font-bold text-slate-800">Database</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Application profile</label>
              <select name="workload" value={specs.workload} onChange={handleSelectChange} className="input-field">
                <option value="web">General web applications</option>
                <option value="oltp">OLTP (High Concurrency)</option>
                <option value="analytics">Data Warehouse / Analytics</option>
                <option value="mixed">Mixed workload</option>
                <option value="desktop">Desktop application</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">PostgreSQL Version</label>
              <select name="pgVersion" value={specs.pgVersion} onChange={handleSelectChange} className="input-field">
                <option value={18}>18 (Latest)</option>
                <option value={17}>17</option>
                <option value={16}>16</option>
                <option value={15}>15</option>
                <option value={14}>14</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button type="submit" disabled={isLoading} className="btn-primary min-w-[200px]">
          {isLoading ? 'Generating...' : 'Generate Configuration'}
        </button>
      </div>
    </form>
  );
};
