import { useChat } from "../../context/ChatContext";
import ahhhSound from "../../assets/sounds/ahhh.mp3";
import faaahSound from "../../assets/sounds/faaahh.mp3";
import "./SoundBuzzers.css";

const SOUNDS = {
	ahhh: ahhhSound,
	faaahh: faaahSound
};

const BUZZERS = [
	{ name: 'ahhh', label: '😱' },
	{ name: 'faaahh', label: '💀' }
];

function SoundBuzzers({ lobbyId }) {
	const { emit } = useChat();

	const playSound = (name) => {
		const src = SOUNDS[name];
		if (src)
			new Audio(src).play().catch(() => {});
		emit('chat:sound', { lobbyId, sound: name });
	};

	return (
		<div className="sound-buzzers">
			{BUZZERS.map(({ name, label }) => (
				<button
					key={name}
					className="buzzer-btn"
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
