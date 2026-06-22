import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
    variant?: 'rectangular' | 'circular' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'rectangular' }) => {
    return (
        <div
            className={cn(
                "animate-pulse bg-white/[0.05] border border-white/5",
                variant === 'circular' ? "rounded-full" : "rounded-xl",
                className
            )}
        />
    );
};

export const DashboardSkeleton = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32" />
                ))}
            </div>

            <div className="grid grid-cols-12 gap-8">
                <Skeleton className="col-span-12 lg:col-span-8 h-[450px]" />
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    <Skeleton className="h-52" />
                    <Skeleton className="h-52" />
                </div>
            </div>
        </div>
    );
};

export const ReportSkeleton = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end mb-12">
                <div className="space-y-3">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-12 w-48" />
            </div>
            {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-64 w-full" />
            ))}
        </div>
    );
};
