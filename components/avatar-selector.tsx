'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { PRESET_AVATARS } from '@/lib/avatars';
import Image from 'next/image';

interface AvatarSelectorProps {
    selectedAvatar: string | null;
    onSelect: (avatar: string) => void;
}

export default function AvatarSelector({ selectedAvatar, onSelect }: AvatarSelectorProps) {
    return (
        <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Or Choose Preset Avatar
            </h3>
            <div className="grid grid-cols-4 gap-3 max-h-[240px] overflow-y-auto custom-scrollbar pr-2">
                {PRESET_AVATARS.map((avatar) => {
                    const isSelected = selectedAvatar === avatar;
                    return (
                        <button
                            key={avatar}
                            type="button"
                            onClick={() => onSelect(avatar)}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 group ${isSelected
                                    ? 'border-primary shadow-lg shadow-primary/20'
                                    : 'border-white/10 hover:border-white/20'
                                }`}
                        >
                            <Image
                                src={avatar}
                                alt="Avatar option"
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                            />
                            {isSelected && (
                                <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                        <Check className="w-5 h-5 text-black" strokeWidth={3} />
                                    </div>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
