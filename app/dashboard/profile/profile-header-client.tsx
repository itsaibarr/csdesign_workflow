'use client';

import { useState, useRef } from 'react';
import { User, Sparkles, Mail, Calendar, X, Loader2, Camera, Upload, Trash2, AlertTriangle, LogOut } from 'lucide-react';
import { updateProfile } from '@/app/actions/profile';
import { useRouter } from 'next/navigation';
import { signOut, deleteUser } from '@/lib/auth-client';
import AvatarSelector from '@/components/avatar-selector';

interface ProfileHeaderClientProps {
    user: {
        id: string;
        name: string;
        email: string;
        image: string | null;
        role: string;
        createdAt: Date;
    };
}

export default function ProfileHeaderClient({ user }: ProfileHeaderClientProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name,
        image: user.image || '',
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file (JPG/PNG).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const maxSize = 400; // Resize to 400x400 max for avatar using canvas

                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx?.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                setFormData(prev => ({ ...prev, image: dataUrl }));
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            await updateProfile({
                name: formData.name,
                image: formData.image,
            });
            setIsEditing(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("Are you absolutely sure? This action cannot be undone.")) return;

        setIsLoading(true);
        try {
            await deleteUser({
                callbackURL: "/login" // Redirect to login after deletion
            });
        } catch (error) {
            console.error(error);
            alert("Failed to delete account");
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="glass-panel rounded-[2.5rem] p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="relative group cursor-pointer" onClick={() => setIsEditing(true)}>
                        <div className="w-32 h-32 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:border-primary/30 transition-all duration-500">
                            {user.image ? (
                                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-16 h-16 text-muted-foreground group-hover:text-primary transition-colors" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                                <span className="text-[10px] uppercase font-bold text-white tracking-widest flex items-center gap-1">
                                    <Camera className="w-3 h-3" /> Update
                                </span>
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-xl flex items-center justify-center glow-primary border-4 border-background">
                            <Sparkles className="text-black w-4 h-4 fill-black" />
                        </div>
                    </div>

                    <div className="text-center md:text-left space-y-2 flex-grow">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-widest text-primary">
                            System Node: {user.role}
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tighter text-gradient">{user.name}</h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {user.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                        >
                            Settings
                        </button>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-3 rounded-2xl bg-primary text-black text-sm font-bold uppercase tracking-widest hover:scale-105 transition-all glow-primary active:scale-95"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-[#0F0F12] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-2xl font-bold tracking-tight mb-6">Edit Profile</h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Display Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-white/20"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Avatar Image</label>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative group w-16 h-16 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                                            {formData.image ? (
                                                <>
                                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => setFormData({ ...formData, image: '' })}
                                                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Remove Avatar"
                                                        type="button"
                                                    >
                                                        <Trash2 className="w-5 h-5 text-red-500" />
                                                    </button>
                                                </>
                                            ) : (
                                                <User className="w-8 h-8 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                                            >
                                                <Upload className="w-3 h-3" />
                                                Upload Photo
                                            </button>
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/png, image/jpeg"
                                            className="hidden"
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                        Upload a JPG or PNG file. Image will be automatically resized for optimal performance.
                                    </p>

                                    {/* Divider */}
                                    <div className="relative py-3">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-white/10"></div>
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="px-3 text-[10px] uppercase tracking-widest text-muted-foreground bg-[#0F0F12]">
                                                Or
                                            </span>
                                        </div>
                                    </div>

                                    {/* Avatar Selector */}
                                    <AvatarSelector
                                        selectedAvatar={formData.image.startsWith('/avatars/') ? formData.image : null}
                                        onSelect={(avatar) => setFormData({ ...formData, image: avatar })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    disabled={isLoading}
                                    className="flex-1 py-3 rounded-xl bg-primary text-black text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all glow-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-[#0F0F12] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsSettingsOpen(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-2xl font-bold tracking-tight mb-6">Settings</h2>

                        <div className="space-y-6">
                            {/* Standard Actions */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Account Actions</label>
                                <button
                                    onClick={() => signOut()}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>

                            {/* Danger Zone */}
                            <div className="space-y-2 pt-4 border-t border-white/10">
                                <label className="text-xs font-bold uppercase tracking-widest text-red-500 flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3" /> Danger Zone
                                </label>
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-4">
                                    <p className="text-xs text-red-200/70 leading-relaxed">
                                        Deleting your account is permanent. All your data, artifacts, and team memberships will be wiped locally and from the server.
                                    </p>
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={isLoading}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-500 transition-all text-sm font-bold uppercase tracking-widest disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4" />
                                                Delete Account
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
