// Preset avatar paths
export const PRESET_AVATARS = [
    '/avatars/avatar-1.png',
    '/avatars/avatar-2.png',
    '/avatars/avatar-3.png',
    '/avatars/avatar-4.png',
    '/avatars/avatar-6.png',
    '/avatars/avatar-7.png',
    '/avatars/avatar-8.png',
    '/avatars/avatar-9.png',
    '/avatars/avatar-10.png',
    '/avatars/avatar-11.png',
] as const;

export type PresetAvatar = typeof PRESET_AVATARS[number];
