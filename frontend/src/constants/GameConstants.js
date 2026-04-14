export const LINKS = {
	1:  [6, 8],   2: [5, 9],  3: [4, 10], 4: [3, 11],
	5:  [2, 12],  6: [1],     7: [],      8: [1],
	9:  [2],      10: [3],    11: [4],    12: [5]
}

export const LAYOUTS = {
	3: {
		seats: ["top", "left"],
		playerSeat: "bottom-center"
	},
	4: {
		seats: ["top", "left", "right"],
	playerSeat: "bottom-center"
	},
	5: {
		seats: ["top-left", "top-right", "left", "right"],
		playerSeat: "bottom-right"
	},
	6: {
		seats: ["top-left", "top-right", "left", "right", "bottom-left"],
		playerSeat: "bottom-right"
	}
}

export const SEAT_DESKTOP = {
	top: "top-10 left-1/2 -translate-x-1/2",
	left: "left-[5vw] top-[calc(50%+var(--navbar-height)/2)] -translate-y-1/2",
	right: "right-[5vw] top-[calc(50%+var(--navbar-height)/2)] -translate-y-1/2",
	"top-left": "left-[22vw] top-[8vh]",
	"top-right": "right-[22vw] top-[8vh]",
	"bottom-left": "bottom-[8vh] left-[22vw]"
}

export const SEAT_MOBILE = {
	top: "top-1 left-1/2 -translate-x-1/2",
	left: "left-[2vw] top-1/2 -translate-y-1/2",
	right: "right-[2vw] top-1/2 -translate-y-1/2",
	"top-left": "left-[10vw] top-[3vh]",
	"top-right": "right-[10vw] top-[3vh]",
	"bottom-left": "bottom-[6vh] left-[10vw]"
}


export const REVEALED_SEAT = {
	top: "top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 flex-row",
	left: "left-[calc(100%+3rem)] top-1/2 -translate-y-1/2 flex-col",
	right: "right-[calc(100%+3rem)] top-1/2 -translate-y-1/2 flex-col",
	"top-left": "top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 flex-row",
	"top-right": "top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 flex-row",
	"bottom-left": "bottom-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 flex-row"
}

export const HAND_DESKTOP = {
	"bottom-center": "bottom-[2vh] left-1/2 -translate-x-1/2",
	"bottom-right": "bottom-[8vh] right-[22vw]"
}

export const HAND_MOBILE = {
	"bottom-center": "bottom-[6vh] left-1/2 -translate-x-1/2",
	"bottom-right": "bottom-[6vh] right-[10vw]"
}

export const GAME_MODES = [
	{ value: 'CLASSIC', label: 'Classic', desc: 'Win 3 trios' },
	{ value: 'LINKED',  label: 'Linked',  desc: 'Win 2 linked trios' }
]

export const PLAYER_OPTIONS = [3, 4, 5, 6]

export const COUNTDOWN_DESKTOP = {
	size: 70,
	radius: 28,
	strokeWidth: 4,
	labelClass: 'text-[0.6rem]'
}

export const COUNTDOWN_MOBILE = {
	size: 46,
	radius: 18,
	strokeWidth: 3,
	labelClass: 'text-[0.45rem]'
}

export const BUZZER_DESKTOP = {
	buttonSizeClass: 'h-[52px] w-[52px] text-[1.4rem]',
	buttonPx: 52,
	buttonGap: 12,
	containerPositionClass: 'bottom-6 right-6'
}

export const BUZZER_MOBILE = {
	buttonSizeClass: 'h-9 w-9 text-[1rem]',
	buttonPx: 36,
	buttonGap: 8,
	containerPositionClass: 'bottom-[6vh] right-3'
}

export const TRIO_DESKTOP = {
	arrowClass: 'border-b-[35px] border-l-[20px] border-r-[20px]',
	labelClass: '-bottom-[30px] text-[0.75rem]',
	cardPreviewClass: 'h-[3vw] w-[2.2vw]'
}

export const TRIO_MOBILE = {
	arrowClass: 'border-b-[18px] border-l-[10px] border-r-[10px]',
	labelClass: '-bottom-[16px] text-[0.5rem]',
	cardPreviewClass: 'h-[5vw] w-[3.7vw]'
}
