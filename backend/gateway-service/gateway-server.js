import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { router } from './src/routes/proxy-router.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({
	origin: 'http://localhost:5173',
	credentials: true
}))

app.use(cookieParser())
app.use('/api', router)

app.listen(PORT, () => {
	console.log(`Gateway running on port ${PORT}`)
})
