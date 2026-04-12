import { useChat } from "../../context/ChatContext";
import { useIsMobileGame } from "../../hooks/useIsMobileGame";
import ahhhSound from "../../assets/sounds/ahhh.mp3";
import faaahSound from "../../assets/sounds/faaahh.mp3";
import "./SoundBuzzers.css";

const SOUNDS = {
	ahhh: ahhhSound,
	faaahh: faaahSound
};

const BUZZERS = [
	{ name: 'ahhh', label: '👹' },
	{ name: 'faaahh', label: '💀' }
];

function SoundBuzzers({ lobbyId }) {
	const { emit } = useChat();
	const isMobile = useIsMobileGame();

	const playSound = (name) => {
		const src = SOUNDS[name];
		if (src)
			new Audio(src).play().catch(() => {});
		emit('chat:sound', { lobbyId, sound: name });
	};

	return (
		<div className={`absolute z-10 flex ${isMobile ? 'bottom-[2vh] right-3 gap-2' : 'bottom-6 right-6 gap-3'}`}>
			{BUZZERS.map(({ name, label }) => (
				<button
					key={name}
					className={`flex cursor-pointer items-center justify-center rounded-full border-2 border-[rgba(180,60,255,0.4)] bg-[radial-gradient(circle_at_40%_35%,rgba(40,10,60,0.9),rgba(10,5,20,0.95))] text-white shadow-[0_0_12px_rgba(140,40,200,0.25),inset_0_-3px_6px_rgba(0,0,0,0.4)] transition-[transform,box-shadow,border-color] duration-150 ease-in-out hover:scale-[1.12] hover:border-[rgba(0,220,255,0.6)] hover:shadow-[0_0_20px_rgba(0,200,255,0.35),inset_0_-3px_6px_rgba(0,0,0,0.4)] active:scale-[0.92] active:shadow-[0_0_8px_rgba(180,60,255,0.5),inset_0_2px_8px_rgba(0,0,0,0.6)] ${isMobile ? 'h-9 w-9 text-[1rem]' : 'h-[52px] w-[52px] text-[1.4rem]'}`}
					onClick={() => playSound(name)}
					title={name}
				>
					{label}
				</button>
			))}
		</div>
	);
}

export { SOUNDS };
export default SoundBuzzers;
