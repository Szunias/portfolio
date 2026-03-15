/**
 * IS Monogram Logo mark.
 * Combines "I" (solid bar) and "S" (audio-waveform curve) letterforms.
 */
const LogoMark = ({ size = 22, className = '' }: { size?: number; className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        className={className}
    >
        {/* I — solid frequency bar with top/bottom serifs */}
        <rect x="3" y="3" width="4.5" height="26" rx="1.5" fill="currentColor" />
        <rect x="1" y="3" width="9" height="2.5" rx="1.25" fill="currentColor" />
        <rect x="1" y="26.5" width="9" height="2.5" rx="1.25" fill="currentColor" />

        {/* S — smooth stroke path suggesting a waveform/sine curve */}
        <path
            d="M 15 8.5 C 18 4, 27 4, 27 9.5 C 27 13.5, 21 15, 18 16 C 15 17, 13 19, 13 22 C 13 26, 19 28.5, 25 25"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
        />

        {/* Small waveform accent dots along S curve */}
        <circle cx="21" cy="6.5" r="1.2" fill="currentColor" />
        <circle cx="19" cy="25.5" r="1.2" fill="currentColor" />
    </svg>
);

export default LogoMark;
