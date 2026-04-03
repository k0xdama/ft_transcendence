import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach} from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import NavBar from '../src/components/NavBar'
import HomeView from '../src/components/HomeView'
import CreateGameView from '../src/components/lobby/CreateGameView'
import JoinGameView from '../src/components/lobby/JoinGameView'
import LoginView from '../src/components/auth/LoginView'
import RegisterView from '../src/components/auth/RegisterView'
import { AuthProvider } from '../src/context/AuthContext'

afterEach(cleanup)

const withRouterAndAuth = (component, initialPath = '/') => (
	render(
		<MemoryRouter initialEntries={[initialPath]}>
			<AuthProvider>
				{component}
			</AuthProvider>
		</MemoryRouter>
	)
)

beforeEach(() => {
	vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
		ok: false,
		json: () => Promise.resolve({})
	}))
})

afterEach(() => {
	vi.unstubAllGlobals()
	cleanup()
})

// ##############
// ### NavBar ###
// ##############
describe('NavBar', () => {
	it('affiche le nom du jeu comme lien vers /', () => {
		withRouterAndAuth(<NavBar />)
		const brand = screen.getByText('Triple')
		expect(brand).toBeDefined()
	})

	it('affiche les liens Login et Register', () => {
		withRouterAndAuth(<NavBar />)
		expect(screen.getByText('Log in')).toBeDefined()
		expect(screen.getByText('Register')).toBeDefined()
	})
})

// ################
// ### HomeView ###
// ################
describe('HomeView', () => {
	it('affiche le titre du jeu', () => {
		withRouterAndAuth(<HomeView />)
		expect(screen.getByText('Triple')).toBeDefined()
	})

	it('affiche les boutons de navigation', () => {
		withRouterAndAuth(<HomeView />)
		expect(screen.getByText('Create game')).toBeDefined()
		expect(screen.getByText('Join game')).toBeDefined()
		expect(screen.getByText('Test Game')).toBeDefined()
	})
})

// ######################
// ### CreateGameView ###
// ######################
describe('CreateGameView', () => {
	it('affiche le titre', () => {
		withRouterAndAuth(<CreateGameView />)
		expect(screen.getByText('Create New Game')).toBeDefined()
	})

	it('le champ nombre de joueurs a une valeur par défaut de 3', () => {
		withRouterAndAuth(<CreateGameView />)
		const input = screen.getByRole('spinbutton')
		expect(input.defaultValue).toBe('3')
	})

	it('affiche le bouton Create', () => {
		withRouterAndAuth(<CreateGameView />)
		expect(screen.getByRole('button', { name: 'Create' })).toBeDefined()
	})
})

// ####################
// ### JoinGameView ###
// ####################
describe('JoinGameView', () => {
	it('affiche le titre et le champ Game ID', () => {
		withRouterAndAuth(<JoinGameView />)
		expect(screen.getByText('Join Game')).toBeDefined()
		expect(screen.getByText('Game ID')).toBeDefined()
	})

	it('affiche le bouton Join', () => {
		withRouterAndAuth(<JoinGameView />)
		expect(screen.getByRole('button', {name: 'Join'})).toBeDefined()
	})
})

// #################
// ### LoginView ###
// #################
describe('LoginView', () => {
	it('affiche les champs et le bouton de connexion', () => {
		withRouterAndAuth(<LoginView />)
		expect(screen.getByRole('button', {name: 'Log in'})).toBeDefined()
		const inputs = document.querySelectorAll('input')
		expect(inputs.length).toBe(2)
	})

	it('affiche une erreur si les champs sont vides à la soumission', async () => {
		withRouterAndAuth(<LoginView />)
		fireEvent.click(screen.getByRole('button', { name : 'Log in'}))
		await waitFor(() => {
			expect(screen.getByText('Please enter username/email and password')).toBeDefined()
		})
	})

	it('apelle l\'API et affiche un succès si les identifiants sont corrects', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({message: 'Login successful'})
		}))

		withRouterAndAuth(<LoginView />)
		const inputs = document.querySelectorAll('input')
		fireEvent.change(inputs[0], { target: { name: 'id', value: 'user1'} })
		fireEvent.change(inputs[1], {target: {name: 'password', value: 'secret'} })
		fireEvent.click(screen.getByRole('button', {name: 'Log in'}))

		await waitFor(() => {
			expect(screen.getByText('Login successful')).toBeDefined()
		})

		vi.unstubAllGlobals()
	})
	
	it('affiche une erreur si l\'API répond avec une erreur', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
			ok: false,
			json: () => Promise.resolve({error: 'Invalid credentials'})
		}))

		withRouterAndAuth(<LoginView />)
		const inputs = document.querySelectorAll('input')
		fireEvent.change(inputs[0], { target: { name: 'id', value: 'user1'}})
		fireEvent.change(inputs[1], {target: {name: 'password', value: 'wrongpass'}})
		fireEvent.click(screen.getByRole('button', { name: 'Log in'}))

		await waitFor(() => {
			expect(screen.getByText('Invalid credentials')).toBeDefined()
		})

		vi.unstubAllGlobals()
	})
})

// ####################
// ### RegisterView ###
// ####################

describe('RegisterView', () => {
	it('affiche tous les champs du formulaire', () => {
		withRouterAndAuth(<RegisterView />)
        expect(screen.getByText('Create a new account')).toBeDefined()
        expect(screen.getByRole('button', { name: 'Register'})).toBeDefined()
		const inputs = document.querySelectorAll('input')
        expect(inputs.length).toBe(4)
	})

	it('affiche une erreur si les mots de passe ne correspondent pas', async () => {
        withRouterAndAuth(<RegisterView />)
		const inputs = document.querySelectorAll('input')
        fireEvent.change(inputs[2], { target: { name: 'password', value: 'abcdef' } })
        fireEvent.change(inputs[3], { target: { name: 'confirmPassword', value: 'xxxxxx' } })
        fireEvent.click(screen.getByRole('button', { name: 'Register' }))

        await waitFor(() => {
            expect(screen.getByText('Passwords do not match')).toBeDefined()
        })
    })

	it('affiche une erreur si l\'email est invalide', async () => {
        withRouterAndAuth(<RegisterView />)
		const inputs = document.querySelectorAll('input')
        fireEvent.change(inputs[1], { target: { name: 'email', value: 'pasunemail' } })
        fireEvent.change(inputs[2], { target: { name: 'password', value: 'abcdef' } })
        fireEvent.change(inputs[3], { target: { name: 'confirmPassword', value: 'abcdef' } })
        fireEvent.click(screen.getByRole('button', { name: 'Register' }))

        await waitFor(() => {
            expect(screen.getByText('Email must be valid')).toBeDefined()
        })
    })

	it('affiche une erreur si le mot de passe fait moins de 8 caractères', async () => {
        withRouterAndAuth(<RegisterView />)
		const inputs = document.querySelectorAll('input')
        fireEvent.change(inputs[1], { target: { name: 'email', value: 'user@test.com' } })
        fireEvent.change(inputs[2], { target: { name: 'password', value: 'abc' } })
        fireEvent.change(inputs[3], { target: { name: 'confirmPassword', value: 'abc' } })
        fireEvent.click(screen.getByRole('button', { name: 'Register' }))

        await waitFor(() => {
            expect(screen.getByText('Password must be 8 or more characters')).toBeDefined()
        })
    })

	it('appelle l\'API et affiche un succès si l\'inscription est valide', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ message: "testuser's account has been successfully created!" })
        }))

        withRouterAndAuth(<RegisterView />)
		const inputs = document.querySelectorAll('input')
        fireEvent.change(inputs[0], { target: { name: 'username', value: 'testuser' } })
        fireEvent.change(inputs[1], { target: { name: 'email', value: 'user@test.com' } })
        fireEvent.change(inputs[2], { target: { name: 'password', value: '@Bcd3fgh' } })
        fireEvent.change(inputs[3], { target: { name: 'confirmPassword', value: '@Bcd3fgh' } })
        fireEvent.click(screen.getByRole('button', { name: 'Register' }))

        await waitFor(() => {
            expect(screen.getByText("testuser's account has been successfully created!")).toBeDefined()
        })

        vi.unstubAllGlobals()
    })
})
