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
import TestView from '../src/components/gameboard/TestView'

afterEach(cleanup)

const withRouter = (component, initialPath = '/') => (
	render(<MemoryRouter initialEntries={[initialPath]}>{component}</MemoryRouter>)
)
// ##############
// ### NavBar ###
// ##############
describe('NavBar', () => {
	it('affiche le nom du jeu comme lien vers /', () => {
		withRouter(<NavBar />)
		const brand = screen.getByText('Garou Loup')
		expect(brand).toBeDefined()
	})

	it('affiche les liens Login et Register', () => {
		withRouter(<NavBar />)
		expect(screen.getByText('Log in')).toBeDefined()
		expect(screen.getByText('Register')).toBeDefined()
	})
})

// ################
// ### HomeView ###
// ################
describe('HomeView', () => {
	it('affiche le titre du jeu', () => {
		withRouter(<HomeView />)
		expect(screen.getByText('Trois Cartes')).toBeDefined()
	})

	it('affiche les boutons de navigation', () => {
		withRouter(<HomeView />)
		expect(screen.getByText('Create game')).toBeDefined()
		expect(screen.getByText('Join game')).toBeDefined()
		expect(screen.getByText('Test Game')).toBeDefined()
	})
})

// ######################
// ### CreateGameView ###
// ######################
describe('CreateGameView', () => {
	it('affiche le titre et le champ Max Players', () => {
		withRouter(<CreateGameView />)
		expect(screen.getByText('Create New Game')).toBeDefined()
		expect(screen.getByText('Max players')).toBeDefined()
	})

	it('le champ nombre de joueurs a une valeur pas défaut de 4', () => {
		withRouter(<CreateGameView />)
		const input = screen.getByRole('spinbutton')
		expect(input.defaultValue).toBe('4')
	})

	it('affiche le bouton Create', () => {
		withRouter(<CreateGameView />)
		expect(screen.getByRole('button', { name: 'Create' })).toBeDefined()
	})
})

// ####################
// ### JoinGameView ###
// ####################
describe('JoinGameView', () => {
	it('affiche le titre et le champ Game ID', () => {
		withRouter(<JoinGameView />)
		expect(screen.getByText('Join Game')).toBeDefined()
		expect(screen.getByText('Game ID')).toBeDefined()
	})

	it('affiche le bouton Join', () => {
		withRouter(<JoinGameView />)
		expect(screen.getByRole('button', {name: 'Join'})).toBeDefined()
	})
})

// #################
// ### LoginView ###
// #################
describe('LoginView', () => {
	it('affiche les champs et le bouton de connexion', () => {
		withRouter(<LoginView />)
		expect(screen.getByRole('button', {name: 'Log in'})).toBeDefined()
		const inputs = document.querySelectorAll('input')
		expect(inputs.length).toBe(2)
	})

	it('affiche une erreur si les champs sont vides à la soumission', async () => {
		withRouter(<LoginView />)
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

		withRouter(<LoginView />)
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

		withRouter(<LoginView />)
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
		withRouter(<RegisterView />)
        expect(screen.getByText('Create a new account')).toBeDefined()
        expect(screen.getByRole('button', { name: 'Register'})).toBeDefined()
		const inputs = document.querySelectorAll('input')
        expect(inputs.length).toBe(4)
	})

	it('affiche une erreur si les mots de passe ne correspondent pas', async () => {
        withRouter(<RegisterView />)
		const inputs = document.querySelectorAll('input')
        fireEvent.change(inputs[2], { target: { name: 'password', value: 'abcdef' } })
        fireEvent.change(inputs[3], { target: { name: 'confirmPassword', value: 'xxxxxx' } })
        fireEvent.click(screen.getByRole('button', { name: 'Register' }))

        await waitFor(() => {
            expect(screen.getByText('Passwords do not match')).toBeDefined()
        })
    })

	it('affiche une erreur si l\'email est invalide', async () => {
        withRouter(<RegisterView />)
		const inputs = document.querySelectorAll('input')
        fireEvent.change(inputs[1], { target: { name: 'email', value: 'pasunemail' } })
        fireEvent.change(inputs[2], { target: { name: 'password', value: 'abcdef' } })
        fireEvent.change(inputs[3], { target: { name: 'confirmPassword', value: 'abcdef' } })
        fireEvent.click(screen.getByRole('button', { name: 'Register' }))

        await waitFor(() => {
            expect(screen.getByText('Email must be valid')).toBeDefined()
        })
    })

	it('affiche une erreur si le mot de passe fait moins de 6 caractères', async () => {
        withRouter(<RegisterView />)
		const inputs = document.querySelectorAll('input')
        fireEvent.change(inputs[1], { target: { name: 'email', value: 'user@test.com' } })
        fireEvent.change(inputs[2], { target: { name: 'password', value: 'abc' } })
        fireEvent.change(inputs[3], { target: { name: 'confirmPassword', value: 'abc' } })
        fireEvent.click(screen.getByRole('button', { name: 'Register' }))

        await waitFor(() => {
            expect(screen.getByText('Password must be 6 or more characters long')).toBeDefined()
        })
    })

	it('appelle l\'API et affiche un succès si l\'inscription est valide', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ message: 'Registration successful' })
        }))

        withRouter(<RegisterView />)
		const inputs = document.querySelectorAll('input')
        fireEvent.change(inputs[0], { target: { name: 'username', value: 'testuser' } })
        fireEvent.change(inputs[1], { target: { name: 'email', value: 'user@test.com' } })
        fireEvent.change(inputs[2], { target: { name: 'password', value: 'abcdef' } })
        fireEvent.change(inputs[3], { target: { name: 'confirmPassword', value: 'abcdef' } })
        fireEvent.click(screen.getByRole('button', { name: 'Register' }))

        await waitFor(() => {
            expect(screen.getByText('Registration successful')).toBeDefined()
        })

        vi.unstubAllGlobals()
    })
})
