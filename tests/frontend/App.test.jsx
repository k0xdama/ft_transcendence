import { describe, it, expect} from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../../frontend/src/App.jsx'

describe('App component', () => {
	it('renders the title', () => {
		render(<App />)
		expect(screen.getByText('Garou Loup')).toBeDefined()
	})
})