import { useEffect, useRef, useState } from "react";
import { useChat } from "../../context/ChatContext";
import { useIsMobileGame } from "../../hooks/useIsMobileGame";
import { BUZZER_DESKTOP, BUZZER_MOBILE } from "../../constants/GameConstants";
import ahhhSound from "../../assets/sounds/ahhh.mp3";
import faaahSound from "../../assets/sounds/faaah.mp3";
import wowSound from "../../assets/sounds/anime-wow.mp3";
import emotionalDamageSound from "../../assets/sounds/emotional-damage.mp3";

const SOUNDS = {
	ahhh: ahhhSound,
	faaah: faaahSound,
	wow: wowSound,
	emotionalDamage: emotionalDamageSound
};

const BUZZERS = [
	{ name: 'ahhh', label: '👹' },
	{ name: 'faaah', label: '💀' },
	{ name: 'wow', label: '✨' },
	{ name: 'emotionalDamage', label: '💔​' }
];

function SoundBuzzers({ lobbyId }) {
	const { emit } = useChat();
	const isMobile = useIsMobileGame();
	const [open, setOpen] = useState(false);
	const containerRef = useRef(null);

	useEffect(() => {
		if (!open)
			return;
		const handleClick = (e) => {
			if (containerRef.current && !containerRef.current.contains(e.target))
				setOpen(false);
		};
		document.addEventListener('mousedown', handleClick);
		document.addEventListener('touchstart', handleClick);
		return () => {
			document.removeEventListener('mousedown', handleClick);
			document.removeEventListener('touchstart', handleClick);
		};
	}, [open]);

	const playSound = (name) => {
		const src = SOUNDS[name];
		if (src)
			new Audio(src).play().catch(() => {});
		emit('chat:sound', { lobbyId, sound: name });
	};

	const { buttonSizeClass, buttonPx, buttonGap, containerPositionClass } = isMobile ? BUZZER_MOBILE : BUZZER_DESKTOP;
	const buttonBase = 'flex cursor-pointer items-center justify-center rounded-full border-2 border-[rgba(180,60,255,0.4)] bg-[radial-gradient(circle_at_40%_35%,rgba(40,10,60,0.9),rgba(10,5,20,0.95))] text-white shadow-[0_0_12px_rgba(140,40,200,0.25),inset_0_-3px_6px_rgba(0,0,0,0.4)] transition-[transform,box-shadow,border-color] duration-150 ease-in-out hover:scale-[1.12] hover:border-[rgba(0,220,255,0.6)] hover:shadow-[0_0_20px_rgba(0,200,255,0.35),inset_0_-3px_6px_rgba(0,0,0,0.4)] active:scale-[0.92] active:shadow-[0_0_8px_rgba(180,60,255,0.5),inset_0_2px_8px_rgba(0,0,0,0.6)]';

	return (
		<div
			ref={containerRef}
			className={`absolute z-10 ${containerPositionClass}`}
			style={{ width: buttonPx, height: buttonPx }}
		>
			{BUZZERS.map(({ name, label }, i) => {
				const offset = open ? (BUZZERS.length - i) * (buttonPx + buttonGap) : i * 4;
				return (
					<button
						key={name}
						className={`absolute bottom-0 right-0 ${buttonBase} ${buttonSizeClass}`}
						style={{
							transform: `translateY(-${offset}px)`,
							zIndex: BUZZERS.length - i,
							transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.15s ease, border-color 0.15s ease',
							pointerEvents: open || i === 0 ? 'auto' : 'none'
						}}
						onClick={() => {
							if (!open) {
								setOpen(true);
								return;
							}
							playSound(name);
						}}
						title={name}
						aria-label={open ? name : 'Open sound buzzers'}
					>
						{label}
					</button>
				);
			})}
		</div>
	);
}

export { SOUNDS };
export default SoundBuzzers;
