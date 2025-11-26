import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity, Alert, SectionList } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../lib/api'

export default function ShoppingCartScreen({ navigation, route }: any) {
    const { user, mockId, group } = route.params
    const [cart, setCart] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useFocusEffect(
        useCallback(() => {
            fetchCart()
        }, [])
    )

    const fetchCart = async () => {
        try {
            const data = await api.get(`/groups/${group.id}/shopping-cart`, { 'x-mock-user-id': mockId })
            setCart(data)
        } catch (error: any) {
            console.log('Error fetching cart:', error.message)
        }
    }

    const regenerateCart = async () => {
        setLoading(true)
        try {
            // Use current week start
            const d = new Date()
            const day = d.getDay(), diff = d.getDate() - day + (day == 0 ? -6 : 1)
            const weekStartDate = new Date(d.setDate(diff)).toISOString().split('T')[0]

            const data = await api.post(`/groups/${group.id}/shopping-cart`, { weekStartDate }, { 'x-mock-user-id': mockId })
            setCart(data)
        } catch (error: any) {
            Alert.alert('Error', error.message)
        } finally {
            setLoading(false)
        }
    }

    const toggleItem = async (item: any) => {
        try {
            // Optimistic update
            const newCart = cart.map(c => c.id === item.id ? { ...c, checkedOff: !c.checkedOff } : c)
            setCart(newCart)

            await api.patch(`/groups/${group.id}/shopping-cart/${item.id}`, {
                checkedOff: !item.checkedOff
            }, { 'x-mock-user-id': mockId })
        } catch (error: any) {
            Alert.alert('Error', error.message)
            fetchCart() // Revert on error
        }
    }

    // Group by category
    const sections = Object.values(cart.reduce((acc: any, item: any) => {
        const cat = item.category || 'MISC'
        if (!acc[cat]) acc[cat] = { title: cat, data: [] }
        acc[cat].data.push(item)
        return acc
    }, {}))

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Shopping Cart</Text>
                <Button title={loading ? "..." : "Regenerate"} onPress={regenerateCart} disabled={loading} />
            </View>

            <SectionList
                sections={sections as any}
                keyExtractor={(item) => item.id}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={styles.sectionHeader}>{title}</Text>
                )}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.item} onPress={() => toggleItem(item)}>
                        <Text style={[styles.itemText, item.checkedOff && styles.checkedText]}>
                            {item.checkedOff ? '☑' : '☐'} {item.ingredient} ({item.quantity} {item.unit})
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 50 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 24, fontWeight: 'bold' },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', backgroundColor: '#eee', padding: 5, marginTop: 10 },
    item: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    itemText: { fontSize: 16 },
    checkedText: { textDecorationLine: 'line-through', color: '#aaa' }
})
