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
	"bottom-left": "bottom-[3vh] left-[10vw]"
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
