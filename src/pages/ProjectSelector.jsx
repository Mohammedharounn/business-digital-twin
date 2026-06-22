import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/elements/Card';
import { Button } from '../components/elements/Button';
import api from '../lib/api';

const TYPE_ICONS = {
    cafe: '☕', restaurant: '🍽️', gym: '💪', retail: '🛍️',
    salon: '💅', bakery: '🥐', coworking: '💻', laundry: '🫧'
};

function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ProjectSelector({ onContinue, onNewProject, onOpenProject }) {
    const { user } = useAuth();
    const { projects, activeProjectId, setActiveBusiness, setScenarios, setActiveProjectId, clearProjectData } = useAppStore();
    const [deleting, setDeleting] = useState(null);
    const [duplicating, setDuplicating] = useState(null);

    const handleOpenProject = async (project) => {
        try {
            await api.patch(`/business/${project._id}/active`);
        } catch (e) { /* continue even if patch fails */ }
        setActiveBusiness(project.config);
        setScenarios(project.scenarios || []);
        setActiveProjectId(project._id);
        onOpenProject(project);
    };

    const handleNewProject = () => {
        // App.handleStartNewProject owns clearing + creating the empty record
        onNewProject();
    };

    const handleRename = async (project) => {
        const name = window.prompt('Rename project:', project.projectName || project.businessName || 'Untitled Project');
        if (!name || !name.trim()) return;
        try {
            const res = await api.post('/business', { projectId: project._id, projectName: name.trim() });
            const updated = res.data?.data;
            const { setProjects } = useAppStore.getState();
            setProjects(projects.map(p => (p._id === project._id ? (updated || { ...p, projectName: name.trim() }) : p)));
        } catch (e) {
            alert('Failed to rename project');
        }
    };

    const handleDelete = async (project) => {
        if (!window.confirm(`Delete "${project.projectName || project.businessName}"? This cannot be undone.`)) return;
        setDeleting(project._id);
        try {
            await api.delete(`/business/${project._id}`);
            const { setProjects } = useAppStore.getState();
            setProjects(projects.filter(p => p._id !== project._id));
            if (activeProjectId === project._id) {
                clearProjectData();
            }
        } catch (e) {
            alert('Failed to delete project');
        } finally {
            setDeleting(null);
        }
    };

    const handleDuplicate = async (project) => {
        setDuplicating(project._id);
        try {
            const res = await api.post(`/business/${project._id}/duplicate`);
            if (res.data?.success) {
                const { setProjects } = useAppStore.getState();
                setProjects([res.data.data, ...projects]);
            }
        } catch (e) {
            alert('Failed to duplicate project');
        } finally {
            setDuplicating(null);
        }
    };

    const activeProject = projects.find(p => p._id === activeProjectId);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0f] overflow-y-auto">
            <div className="w-full max-w-3xl mx-auto px-4 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-3">Welcome Back</div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2">
                        {user?.name ? `Hello, ${user.name.split(' ')[0]}` : 'Your Projects'}
                    </h1>
                    <p className="text-zinc-500 text-sm">Choose a project to open, or start fresh.</p>
                </motion.div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    {/* Continue active project */}
                    {activeProject && (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            onClick={() => handleOpenProject(activeProject)}
                            className="col-span-1 sm:col-span-2 flex items-center gap-4 p-5 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl hover:bg-indigo-500/18 hover:border-indigo-400/50 transition-all text-left group"
                        >
                            <span className="text-3xl shrink-0">{TYPE_ICONS[activeProject.businessType] || '🏢'}</span>
                            <div className="min-w-0">
                                <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Continue Last Project</div>
                                <div className="text-base font-bold text-white truncate">{activeProject.projectName || activeProject.businessName}</div>
                                <div className="text-[10px] text-zinc-500 capitalize">{activeProject.businessType} · {activeProject.location}</div>
                            </div>
                            <span className="ml-auto text-indigo-400 text-xl group-hover:translate-x-1 transition-transform shrink-0">▶</span>
                        </motion.button>
                    )}

                    {/* New Project */}
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        onClick={handleNewProject}
                        className={`flex flex-col items-center justify-center gap-2 p-5 bg-white/[0.02] border border-white/8 rounded-2xl hover:bg-white/[0.05] hover:border-white/15 transition-all ${activeProject ? '' : 'sm:col-span-3'}`}
                    >
                        <span className="text-3xl">✨</span>
                        <div className="text-sm font-bold text-white">New Project</div>
                        <div className="text-[10px] text-zinc-600 text-center leading-relaxed">Start a completely empty workspace</div>
                    </motion.button>
                </div>

                {/* Saved Projects List */}
                {projects.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Saved Projects</div>
                            <div className="flex-1 h-px bg-white/5" />
                            <div className="text-[9px] text-zinc-700">{projects.length} project{projects.length !== 1 ? 's' : ''}</div>
                        </div>

                        <div className="space-y-2">
                            <AnimatePresence>
                                {projects.map((project, i) => (
                                    <motion.div
                                        key={project._id}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 8 }}
                                        transition={{ delay: i * 0.04 }}
                                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer group
                                            ${project._id === activeProjectId
                                                ? 'bg-indigo-500/6 border-indigo-500/20'
                                                : 'bg-white/[0.02] border-white/6 hover:bg-white/[0.04] hover:border-white/12'
                                            }`}
                                        onClick={() => handleOpenProject(project)}
                                    >
                                        <span className="text-xl shrink-0">{TYPE_ICONS[project.businessType] || '🏢'}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-white truncate">
                                                    {project.projectName || project.businessName}
                                                </span>
                                                {project._id === activeProjectId && (
                                                    <span className="text-[8px] font-black text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">Active</span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-zinc-600 capitalize mt-0.5">
                                                {project.businessType} · {project.location} · Updated {formatDate(project.updatedAt)}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                            onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleRename(project)}
                                                className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-white/8 rounded-lg transition-all text-xs"
                                                title="Rename"
                                            >
                                                ✎
                                            </button>
                                            <button
                                                onClick={() => handleDuplicate(project)}
                                                disabled={duplicating === project._id}
                                                className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-white/8 rounded-lg transition-all text-xs"
                                                title="Duplicate"
                                            >
                                                {duplicating === project._id ? '⏳' : '⎘'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(project)}
                                                disabled={deleting === project._id}
                                                className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all text-xs"
                                                title="Delete"
                                            >
                                                {deleting === project._id ? '⏳' : '✕'}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

                {projects.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center py-8 text-zinc-700 text-sm"
                    >
                        No saved projects yet. Start your first one above.
                    </motion.div>
                )}

                <div className="mt-8 text-center text-[9px] text-zinc-800 uppercase tracking-widest">
                    Deleting a project is permanent and cannot be undone
                </div>
            </div>
        </div>
    );
}
