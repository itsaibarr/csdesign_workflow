import SideNav from '@/app/ui/dashboard/sidenav';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-background">
            <div className="w-full flex-none md:w-72 p-4">
                <SideNav />
            </div>
            <div className="flex-grow p-4 md:overflow-y-auto">
                <main className="h-full w-full glass-panel rounded-[2rem] p-8 md:p-12 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
