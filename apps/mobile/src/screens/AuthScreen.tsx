import React, { useState } from 'react'
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native'
import { api } from '../lib/api'

export default function AuthScreen({ navigation, route }: any) {
    const [email, setEmail] = useState('test@example.com') // Default for dev
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        setLoading(true)
        try {
            // For MVP, we just use the mock auth header logic in backend
            // In a real app, we'd use Clerk/Auth0 SDK here

            // We'll simulate login by checking if backend accepts us
            // We'll pass 'x-mock-user-id' header with the email or a known ID
            // But wait, backend expects ID or AuthID.
            // Seed script created user with email 'test@example.com' and authId 'test-auth-id'.
            // Let's assume we use 'test-auth-id' if email is 'test@example.com'

            const mockId = email === 'test@example.com' ? 'test-auth-id' : email

            const user = await api.get('/auth/me', { 'x-mock-user-id': mockId })

            // Pass user and mockId to next screen
            navigation.replace('GroupSwitcher', { user, mockId })
        } catch (error: any) {
            Alert.alert('Login Failed', error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mealy</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />
            <Button title={loading ? "Logging in..." : "Login"} onPress={handleLogin} disabled={loading} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 40,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 20,
        borderRadius: 5,
    },
})
