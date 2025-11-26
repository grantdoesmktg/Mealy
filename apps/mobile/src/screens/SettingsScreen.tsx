import React, { useState } from 'react'
import { View, Text, Button, StyleSheet, Alert, Linking } from 'react-native'
import { api } from '../lib/api'

export default function SettingsScreen({ navigation, route }: any) {
    const { user, mockId } = route.params
    const [loading, setLoading] = useState(false)

    const handleUpgrade = async () => {
        setLoading(true)
        try {
            // Create checkout session
            const data = await api.post('/subscriptions/create-checkout-session', {
                priceId: 'price_dummy_monthly' // In real app, fetch from config
            }, { 'x-mock-user-id': mockId })

            if (data.url) {
                Linking.openURL(data.url)
            } else {
                Alert.alert('Error', 'No checkout URL returned')
            }
        } catch (error: any) {
            Alert.alert('Error', error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>

            <View style={styles.section}>
                <Text style={styles.label}>User</Text>
                <Text style={styles.value}>{user.email}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Subscription Tier</Text>
                <Text style={styles.value}>{user.subscriptionTier}</Text>
                {user.subscriptionTier === 'FREE' && (
                    <Button title={loading ? "Loading..." : "Upgrade to Paid"} onPress={handleUpgrade} disabled={loading} />
                )}
            </View>

            <View style={styles.section}>
                <Button title="Logout" onPress={() => navigation.replace('Auth')} color="red" />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 50 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    section: { marginBottom: 30 },
    label: { fontSize: 14, color: '#666', marginBottom: 5 },
    value: { fontSize: 18, marginBottom: 10 }
})
