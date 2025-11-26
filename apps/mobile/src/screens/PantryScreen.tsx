import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, Button, StyleSheet, TextInput, Alert, TouchableOpacity } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../lib/api'

export default function PantryScreen({ navigation, route }: any) {
    const { user, mockId, group } = route.params
    const [pantry, setPantry] = useState<any[]>([])
    const [newItem, setNewItem] = useState('')
    const [quantity, setQuantity] = useState('1')

    useFocusEffect(
        useCallback(() => {
            fetchPantry()
        }, [])
    )

    const fetchPantry = async () => {
        try {
            const data = await api.get(`/groups/${group.id}/pantry`, { 'x-mock-user-id': mockId })
            setPantry(data)
        } catch (error: any) {
            console.log('Error fetching pantry:', error.message)
        }
    }

    const addItem = async () => {
        if (!newItem) return
        try {
            await api.post(`/groups/${group.id}/pantry`, {
                ingredient: newItem,
                quantity,
                unit: 'unit'
            }, { 'x-mock-user-id': mockId })
            setNewItem('')
            fetchPantry()
        } catch (error: any) {
            Alert.alert('Error', error.message)
        }
    }

    const deleteItem = async (id: string) => {
        try {
            await api.delete(`/groups/${group.id}/pantry/${id}`, { 'x-mock-user-id': mockId })
            fetchPantry()
        } catch (error: any) {
            Alert.alert('Error', error.message)
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pantry</Text>

            <View style={styles.inputRow}>
                <TextInput
                    style={[styles.input, { flex: 2 }]}
                    placeholder="Item"
                    value={newItem}
                    onChangeText={setNewItem}
                />
                <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Qty"
                    value={quantity}
                    onChangeText={setQuantity}
                />
                <Button title="Add" onPress={addItem} />
            </View>

            <FlatList
                data={pantry}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text style={styles.itemText}>{item.ingredient} ({item.quantity})</Text>
                        <Button title="X" onPress={() => deleteItem(item.id)} color="red" />
                    </View>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 50 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    inputRow: { flexDirection: 'row', marginBottom: 20 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginRight: 10, borderRadius: 5 },
    item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    itemText: { fontSize: 16 }
})
