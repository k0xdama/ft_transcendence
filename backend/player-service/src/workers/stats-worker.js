import	{ createClient }	from 'redis';
import	{ db }				from '../db/queries.js';
import	fs					from 'fs';

const	REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const	REDIS_PASSWORD = fs.readFileSync('/run/secrets/redis_passwd', 'utf-8').trim();
class StatsWorker {
	constructor() {
		this.redisClient = null;
		this.isRunning = false;
	}

	async connect() {
		this.redisClient = createClient({
			url: REDIS_URL,
			password: REDIS_PASSWORD
		});

		this.redisClient.on('error', (err) => {
			console.error('❌ Redis Client Error:', err);
		});

		this.redisClient.on('connect', () => {
            console.log('✅ Stats worker connected to Redis');
        });

        await this.redisClient.connect();
	}

	async start() {
		if (this.isRunning) {
			console.log('⚠️  Stats worker is already running');
			return;
		}

		await this.connect();
		this.isRunning = true;

		console.log('🔄 Stats worker started, listening for game results...');
		
		// Boucle infinie qui écoute Redis
		while (this.isRunning) {
			try {
				// BRPOP bloque jusqu'à ce qu'un élément soit disponible
                // Timeout de 5 secondes pour permettre l'arrêt gracieux
				const result = await this.redisClient.brPop('game results', 5);

				if (result) {
					const gameStats = JSON.parse(result.element);
					console.log('📊 New game result received:', gameStats.gameId);

					await this.processGameStats(gameStats);
				}

			} catch (error) {
				console.error('❌ Error processing game result:', error);
				// Continue même en cas d'erreur
			}
		}
	}

	async processGameStats(gameStats) {
		console.log('===== PROCESSING GAME STATS =====');
        console.log(`Game ID: ${gameStats.gameId}`);
        console.log(`Mode: ${gameStats.gameMode}, Type: ${gameStats.gameType}`);
        console.log(`Players: ${gameStats.players.length}`);

		try {
			for(const playerStats of gameStats.players) {
				await this.updatePlayerStats(playerStats, gameStats);
			}

			console.log(`✅ Stats updated for game ${gameStats.gameId}`);
		} catch (error) {
			console.error('❌ Failed to update stats:', error);
            throw error;
		}
	}

	async updatePlayerStats(playerStats, gameStats) {
		const userId = playerStats.userId;

		try {
			// Récupérer le player par auth_user_id
			const player = await db.oneOrNone(
                'SELECT id, won, rank, score, actionsPlayed, combo, trioOf7, perfectGame FROM player.users WHERE auth_user_id = $1',
                [userId]
            );

			if (!player) {
				console.error(`⚠️  Player not found: ${userId}`);
                return;
			}

			// Calculer les nouvelles stats
            const newStats = {
                won: (player.won || 0) + (playerStats.won ? 1 : 0),
                // rank: on ne stocke pas le rank moyen, seulement le dernier
                rank: playerStats.rank,
                score: (player.score || 0) + playerStats.score,
                actionsPlayed: (player.actionsPlayed || 0) + playerStats.actionsPlayed,
                combo: Math.max(player.combo || 0, playerStats.achievements.COMBO),
                trioOf7: (player.trioOf7 || 0) + playerStats.achievements.TRIO_OF_7,
                perfectGame: (player.perfectGame || 0) + playerStats.achievements.PERFECT_GAME
            };

			// Mettre à jour dans la DB
            await db.none(`
                UPDATE player.users 
                SET 
                    won = $1,
                    rank = $2,
                    score = $3,
                    actionsPlayed = $4,
                    combo = $5,
                    trioOf7 = $6,
                    perfectGame = $7
                WHERE id = $8
            `, [
                newStats.won,
                newStats.rank,
                newStats.score,
                newStats.actionsPlayed,
                newStats.combo,
                newStats.trioOf7,
                newStats.perfectGame,
                player.id
            ]);

			console.log(`  ✅ Updated stats for player ${userId}: +${playerStats.score} score, rank ${playerStats.rank}`);

		} catch (error) {
			console.error(`  ❌ Failed to update player ${userId}:`, error);
            throw error;
		}

	}

	async stop() {
		console.log('🛑 Stopping stats worker...');
		this.isRunning = false;

		if (this.redisClient) {
			await this.redisClient.quit();
		}

		console.log('✅ Stats worker stopped');
	}

}

// Créer une instance singleton
export const statsWorker = new StatsWorker();

	// async name(params) => {
		
	// }

	// async function name(params) {
		
	// }