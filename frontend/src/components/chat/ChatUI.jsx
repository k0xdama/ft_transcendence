import { IconClose } from '../icons/Icons'

export const CHAT_ROUTE = '/api/chat'

export function UnreadBadge({ count }) {
	if (!count || count <= 0)
		return null

	return (
		<span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[0.6rem] font-bold text-white">
			{count > 99 ? '99+' : count}
		</span>
	)
}

export function MobileCloseBtn({ onClick, ariaLabel = 'Close' }) {
	return (
		<button
			className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/50 text-xs text-white/80"
			onClick={onClick}
			aria-label={ariaLabel}
		>
			<IconClose />
		</button>
	)
}

/*
	Floating round toggle used to open chat panels on mobile
	Caller provides its own position/size classes so gameboard (absolute, small)
	and viewport chats (fixed, larger) can share the same shell
*/
export function MobileChatFab({
	icon,
	unread,
	onClick,
	hidden = false,
	ariaLabel,
	positionClassName,
	sizeClassName = 'h-12 w-12 text-xl',
}) {
	return (
		<button
			className={`${positionClassName} ${sizeClassName} z-30 flex items-center justify-center rounded-full border border-purple-mid bg-[rgba(10,5,20,0.9)] text-purple-pale shadow-card transition-all hover:bg-[rgba(20,10,40,0.95)] ${hidden ? 'hidden' : ''}`}
			onClick={onClick}
			aria-label={ariaLabel}
		>
			{icon}
			<UnreadBadge count={unread} />
		</button>
	)
}

// Fullscreen mobile chat container
export function MobileChatPanel({ children, zIndex = 150, className = '' }) {
	return (
		<div
			className={`fixed inset-0 flex flex-col bg-[rgba(10,5,20,0.95)] backdrop-blur-md ${className}`}
			style={{ zIndex }}
		>
			{children}
		</div>
	)
}

export function MobilePanelHeader({ title, onClose, ariaLabelClose }) {
	return (
		<div className="flex items-center justify-between border-b border-white/[0.08] px-3 py-2">
			<span className="text-[0.75rem] uppercase tracking-ui text-purple-pale/70">{title}</span>
			<MobileCloseBtn onClick={onClose} ariaLabel={ariaLabelClose} />
		</div>
	)
}

export function MessagesScroll({ bottomRef, children }) {
	return (
		<div className="min-h-0 flex flex-1 flex-col items-start gap-[0.2rem] overflow-y-auto px-3 py-2 text-[0.8rem] [scrollbar-color:rgba(255,255,255,0.2)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-[2px] [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar]:w-1">
			{children}
			<div ref={bottomRef} />
		</div>
	)
}

export function TypingLine({ users }) {
	if (!users || users.length === 0)
		return null
	return (
		<p className="m-0 shrink-0 px-3 py-[0.2rem] text-left text-[0.7rem] italic text-white/45">
			{users.join(', ')} {users.length === 1 ? 'is' : 'are'} typing...
		</p>
	)
}

export function QuickReplyBar({ replies, onSelect }) {
	return (
		<div className="shrink-0 flex gap-[0.35rem] overflow-x-auto border-t border-white/[0.08] px-[0.6rem] py-[0.3rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
			{replies.map(text => (
				<button
					key={text}
					className="shrink-0 rounded-full border border-white/20 bg-transparent px-[0.6rem] py-[0.2rem] text-center font-sans text-[0.72rem] text-white/75 transition-colors duration-150 hover:border-[#9d4edd] hover:bg-[rgba(157,78,221,0.15)] hover:text-white"
					onClick={() => onSelect(text)}
				>
					{text}
				</button>
			))}
		</div>
	)
}

export function ChatInputBar({
	value,
	onChange,
	onKeyDown,
	onSend,
	placeholder = 'Type a message...',
	maxLength,
	inputRef,
}) {
	return (
		<div className="shrink-0 flex border-t border-white/10">
			<input
				ref={inputRef}
				className="flex-1 border-none bg-transparent px-[0.6rem] py-[0.4rem] font-sans text-[0.8rem] text-white outline-none placeholder:text-white/35"
				value={value}
				onChange={onChange}
				onKeyDown={onKeyDown}
				placeholder={placeholder}
				maxLength={maxLength}
			/>
			<button
				className="cursor-pointer rounded-none border-none border-l border-white/10 bg-transparent px-[0.6rem] py-[0.4rem] text-base text-[#9d4edd] hover:border-transparent hover:bg-white/5"
				onClick={onSend}
			>
				Send
			</button>
		</div>
	)
}

// Normalize a raw chat payload from the server into the shape used by the UI.
export function mapChatMessage(userId, msg) {
	return {
		id: msg.id,
		senderId: msg.sender_id,
		author: msg.sender_id === userId ? 'You' : msg.username,
		text: msg.content,
		type: msg.message_type,
	}
}
