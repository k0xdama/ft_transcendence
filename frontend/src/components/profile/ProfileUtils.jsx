import { DEFAULT_PP_PATH } from '../../constants/ProfileConstant'
import { PLAYER_ROUTE } from '../../constants/ApiRoutes'
 
export const buildAvatarUrl = (userId, ppPath) =>
	ppPath && ppPath !== DEFAULT_PP_PATH
		? `${PLAYER_ROUTE}/${userId}/profile-picture`
		: null
 
export const formatJoinDate = (dateStr) =>
	new Date(dateStr).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	})
 
export const transformFriendEntry = (user) => ({
	id: user.auth_user_id,
	username: user.username,
	avatarUrl: buildAvatarUrl(user.auth_user_id, user.pp_path),
	status: 'offline'
})
 
export const transformRequestEntry = (req) => ({
	id: req.auth_user_id,
	username: req.username,
	avatarUrl: buildAvatarUrl(req.auth_user_id, req.pp_path),
	requestedAt: req.requested_at
})
 
export const extractStats = (playerData) => ({
	gamesPlayed:  playerData.played_game    || 0,
	gamesWon:     playerData.won            || 0,
	gamesLost:    (playerData.played_game - playerData.won) || 0,
	totalScore:   playerData.score          || 0,
	totalActions: playerData.actions_played || 0,
	triosOf7:     playerData.trio_of_7      || 0,
	totalCombos:  playerData.combo,
	longestCombo: playerData.longest_combo  || 0,
	perfectGames: playerData.perfect_game   || 0
})
