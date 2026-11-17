import './styles/theme.css'
import './styles/win98.css'
import { mount } from 'svelte'
import App from './App.svelte'
import Admin from './admin/Admin.svelte'

const isAdmin = location.pathname.replace(/\/+$/, '') === '/admin'

mount(isAdmin ? Admin : App, { target: document.getElementById('app')! })
