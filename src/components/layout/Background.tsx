export default function Background() {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#FAFAFA] pointer-events-none">
            {/* Micro-dot pattern */}
            <div
                className="absolute inset-0 opacity-[0.4]"
                style={{
                    backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                    maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
                }}
            />

            {/* Subtle Gradient Glow */}
            <div
                className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full opacity-30 blur-[120px] animate-pulse-slow"
                style={{ background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)' }}
            />
            <div
                className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full opacity-20 blur-[100px]"
                style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)' }}
            />
        </div>
    );
}
