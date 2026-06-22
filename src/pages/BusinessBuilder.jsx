import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BUSINESS_TYPES } from '../engine/SimulationEngine'

const WIZARD_STEPS = [
    { id: 1, name: 'Industry', icon: '🏪' },
    { id: 2, name: 'Spatial', icon: '📍' },
    { id: 3, name: 'Operatives', icon: '👥' },
    { id: 4, name: 'Revenue', icon: '💰' },
    { id: 5, name: 'Assets', icon: '🔧' },
    { id: 6, name: 'Review', icon: '🚀' }
];

export default function BusinessBuilder({ onComplete, onBack }) {
    const [step, setStep] = useState(1);
    const [config, setConfig] = useState({
        businessType: '',
        businessName: '',
        location: '',
        country: 'US',
        sqft: 1500,
        rent: 4000,
        employees: 6,
        avgSalary: 3200,
        avgTicket: 20,
        dailyCustomers: 80,
        operatingDays: 26,
        equipmentCost: 50000,
        renovationBudget: 30000,
        marketingBudget: 5000,
        notes: ''
    });

    const updateConfig = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const selectBusinessType = (typeId) => {
        const bt = BUSINESS_TYPES.find(b => b.id === typeId);
        if (bt) {
            setConfig(prev => ({
                ...prev,
                businessType: typeId,
                avgTicket: bt.defaults.avgTicket,
                dailyCustomers: bt.defaults.dailyCustomers,
                employees: bt.defaults.employees,
                rent: bt.defaults.rent,
                sqft: bt.defaults.sqft,
                equipmentCost: bt.defaults.equipmentCost
            }));
        }
    };

    const canProceed = () => {
        switch (step) {
            case 1: return config.businessType !== '';
            case 2: return config.sqft > 0 && config.rent > 0;
            case 3: return config.employees > 0;
            case 4: return config.avgTicket > 0 && config.dailyCustomers > 0;
            case 5: return config.equipmentCost >= 0;
            case 6: return true;
            default: return false;
        }
    };

    const handleNext = () => {
        if (step < 6) setStep(step + 1);
        else onComplete(config);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else onBack();
    };

    const selectedType = BUSINESS_TYPES.find(b => b.id === config.businessType);

    return (
        <div className="min-h-screen bg-[#02040a] flex flex-col items-center py-20 px-10 relative overflow-hidden">
            {/* Background Aura */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-indigo-600/5 blur-[160px] pointer-events-none"></div>

            {/* Header / Logo */}
            <div className="mb-16 flex flex-col items-center">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black font-black text-xs shadow-xl mb-4">DT</div>
                <h1 className="text-xl font-display font-bold text-white uppercase tracking-[0.4em]">Initialization Wizard</h1>
                <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em] mt-2">Constructing Virtual Entity v3.0</div>
            </div>

            {/* Stepper */}
            <div className="w-full max-w-[800px] flex justify-between items-center mb-16 relative">
                <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 -z-10"></div>
                {WIZARD_STEPS.map((s) => (
                    <div key={s.id} className="flex flex-col items-center gap-3">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all duration-500
                            ${step >= s.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-[#0a0c12] border-white/5 text-zinc-700'}`}>
                            {step > s.id ? '✓' : s.id}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${step >= s.id ? 'text-indigo-400' : 'text-zinc-800'}`}>{s.name}</span>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

                {/* AI / Suggestion Panel (Side) */}
                <div className="hidden md:block md:col-span-4 glass-panel p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">🤖</span>
                        <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Astra Assistant</h3>
                    </div>
                    <div className="p-4 bg-indigo-600/5 border border-indigo-500/10 rounded-xl">
                        <p className="text-[11px] text-indigo-300 font-medium leading-relaxed italic">
                            "{step === 1 && "Choose an industry archetype to load preset hardware and operational workflows into the kernel."}
                            {step === 2 && "Physical geography dictates burn-rate. Our engine benchmarks square-footage against local market density."}
                            {step === 3 && "Operative count is your primary throughput lever. High efficiency offsets lower staffing quotas."}
                            {step === 4 && "Revenue mapping uses stochastic modeling. Conservative daily estimates ensure capital resilience."}
                            {step === 5 && "Asset depreciation is auto-calculated. High-spec equipment increases initial seed requirement but lowers long-term maintenance."}
                            {step === 6 && "Model validation complete. Ready to synchronize virtual twin with current configuration."}"
                        </p>
                    </div>
                    {selectedType && (
                        <div className="pt-6 border-t border-white/5">
                            <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-3">Loaded Archetype</h4>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{selectedType.icon}</span>
                                <span className="text-xs font-bold text-white tracking-widest uppercase">{selectedType.name}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content Panel (Main) */}
                <div className="md:col-span-8 w-full glass-panel p-10 min-h-[500px] flex flex-col shadow-premium border-white/5">

                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="mb-10">
                                    <h2 className="text-3xl font-display font-bold text-white tracking-tighter mb-2">
                                        {WIZARD_STEPS[step - 1].name}
                                    </h2>
                                    <p className="text-sm text-zinc-500 font-medium">Configure parameters for virtual simulation.</p>
                                </div>

                                {step === 1 && (
                                    <div className="grid grid-cols-2 gap-4">
                                        {BUSINESS_TYPES.map(bt => (
                                            <button
                                                key={bt.id}
                                                className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 group
                                                    ${config.businessType === bt.id
                                                        ? 'bg-indigo-600/10 border-indigo-600/50 shadow-[0_0_30px_rgba(99,102,241,0.1)]'
                                                        : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
                                                onClick={() => selectBusinessType(bt.id)}
                                            >
                                                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{bt.icon}</div>
                                                <div className="text-xs font-black text-white uppercase tracking-widest mb-2">{bt.name}</div>
                                                <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">{bt.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Entity Designation</label>
                                                <input className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-indigo-500 transition-all font-bold"
                                                    placeholder="e.g. AURORA-01" value={config.businessName} onChange={(e) => updateConfig('businessName', e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Coordinate Registry</label>
                                                <input className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-indigo-500 transition-all font-bold"
                                                    placeholder="e.g. Tokyo, JP" value={config.location} onChange={(e) => updateConfig('location', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Spatial Capacity (sqft)</label>
                                                <input type="number" className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-indigo-500 transition-all font-mono"
                                                    value={config.sqft} onChange={(e) => updateConfig('sqft', parseInt(e.target.value) || 0)} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Lease Burn ($/mo)</label>
                                                <input type="number" className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-indigo-500 transition-all font-mono"
                                                    value={config.rent} onChange={(e) => updateConfig('rent', parseInt(e.target.value) || 0)} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Operative Count</label>
                                                <input type="number" className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-indigo-500 transition-all font-mono"
                                                    value={config.employees} onChange={(e) => updateConfig('employees', parseInt(e.target.value) || 0)} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Avg Resource Remuneration</label>
                                                <input type="number" className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-indigo-500 transition-all font-mono"
                                                    value={config.avgSalary} onChange={(e) => updateConfig('avgSalary', parseInt(e.target.value) || 0)} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Avg Transaction Intensity ($)</label>
                                                <input type="number" className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-indigo-500 transition-all font-mono"
                                                    value={config.avgTicket} onChange={(e) => updateConfig('avgTicket', parseFloat(e.target.value) || 0)} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Daily Customer Ingress</label>
                                                <input type="number" className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-indigo-500 transition-all font-mono"
                                                    value={config.dailyCustomers} onChange={(e) => updateConfig('dailyCustomers', parseInt(e.target.value) || 0)} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 5 && (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Asset Acquisition Budget ($)</label>
                                            <input type="number" className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-indigo-500 transition-all font-mono"
                                                value={config.equipmentCost} onChange={(e) => updateConfig('equipmentCost', parseInt(e.target.value) || 0)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Initial Deployment Directives</label>
                                            <textarea className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-indigo-500 transition-all h-32 font-medium"
                                                placeholder="Enter mission constraints or scaling goals..." value={config.notes} onChange={(e) => updateConfig('notes', e.target.value)} />
                                        </div>
                                    </div>
                                )}

                                {step === 6 && (
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Type', val: selectedType?.name },
                                            { label: 'Identity', val: config.businessName || 'UNNAMED' },
                                            { label: 'Spatial', val: `${config.sqft} sqft` },
                                            { label: 'Payroll', val: `E£${(config.employees * config.avgSalary).toLocaleString()}/mo` },
                                            { label: 'Intensity', val: `E£${config.avgTicket} avg` },
                                            { label: 'Seed', val: `E£${config.equipmentCost.toLocaleString()}` }
                                        ].map((r, i) => (
                                            <div key={i} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl">
                                                <div className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-1">{r.label}</div>
                                                <div className="text-xs font-bold text-white tracking-widest uppercase">{r.val}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-12 pt-10 border-t border-white/5">
                        <button className="text-[10px] font-black text-zinc-700 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2" onClick={handleBack}>
                            <span>←</span> {step === 1 ? "Exit Wizard" : "Previous Step"}
                        </button>
                        <button
                            className={`btn btn-primary px-10 py-4 text-xs ${!canProceed() ? 'opacity-20 grayscale pointer-events-none' : ''}`}
                            onClick={handleNext}
                        >
                            {step === 6 ? "Synchronize Kernel 🚀" : "Execute Next Phase →"}
                        </button>
                    </div>
                </div>

            </div>

            {/* Version Flag */}
            <div className="absolute bottom-10 right-10 text-[9px] font-black text-zinc-900 tracking-[0.5em] uppercase">SYSTEM_INIT_MODE // SECURE_REG</div>
        </div>
    )
}
