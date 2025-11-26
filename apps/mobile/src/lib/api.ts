import { Platform } from 'react-native'

// Use your machine's local IP for iOS simulator/real device
// For Android emulator, use 10.0.2.2
const API_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api'
    : 'http://192.168.1.16:3000/api'

export const api = {
    async get(endpoint: string, headers: any = {}) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        })
        return handleResponse(res)
    },

    async post(endpoint: string, body: any, headers: any = {}) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify(body)
        })
        return handleResponse(res)
    },

    async put(endpoint: string, body: any, headers: any = {}) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify(body)
        })
        return handleResponse(res)
    },

    async patch(endpoint: string, body: any, headers: any = {}) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify(body)
        })
        return handleResponse(res)
    },

    async delete(endpoint: string, headers: any = {}) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        })
        return handleResponse(res)
    }
}

async function handleResponse(res: Response) {
    if (!res.ok) {
        const text = await res.text()
        try {
            const json = JSON.parse(text)
            throw new Error(json.error || 'API Error')
        } catch (e: any) {
            throw new Error(text || `API Error: ${res.status}`)
        }
    }
    return res.json()
}
