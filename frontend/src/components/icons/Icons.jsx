function Icon({ glyph, className = '', label }) {
	return (
		<span
			className={className}
			role={label ? 'img' : undefined}
			aria-label={label}
			aria-hidden={label ? undefined : 'true'}
		>
			{glyph}
		</span>
	)
}

// ─── Actions ─────────────────────────────────────────────────
export const IconClose       = (p) => <Icon glyph="✕"  label="Close"    {...p} />
export const IconMinimize    = (p) => <Icon glyph="−"  label="Minimize" {...p} />
export const IconCheck       = (p) => <Icon glyph="✓"  label="Done"     {...p} />
export const IconDoubleCheck = (p) => <Icon glyph="✓✓" label="Read"     {...p} />
export const IconDecline     = (p) => <Icon glyph="✗"  label="Decline"  {...p} />
export const IconLock        = (p) => <Icon glyph="🔒" label="Lock"     {...p} />
export const IconProfile     = (p) => <Icon glyph="☰" label="Profile"  {...p} />

// ─── Chat & messaging ────────────────────────────────────────
export const IconChat     = (p) => <Icon glyph="💬" label="Chat"     {...p} />
export const IconMessages = (p) => <Icon glyph="✉️" label="Messages" {...p} />
export const IconSystem   = (p) => <Icon glyph="⚙"  label="System"   {...p} />

// ─── Gameplay ────────────────────────────────────────────────
export const IconCrown       = (p) => <Icon glyph="👑" label="Host"         {...p} />
export const IconRotatePhone = (p) => <Icon glyph="📱" label="Rotate phone" {...p} />

// ─── Stats & achievements ────────────────────────────────────
export const IconStar     = (p) => <Icon glyph="⭐" label="Star"        {...p} />
export const IconStarGlow = (p) => <Icon glyph="🌟" label="Legend"      {...p} />
export const IconSkull    = (p) => <Icon glyph="💀" label="Defeat"      {...p} />
export const IconSparkles = (p) => <Icon glyph="✨" label="Achievement" {...p} />
