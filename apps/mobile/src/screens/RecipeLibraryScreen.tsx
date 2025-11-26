import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../lib/api'

export default function RecipeLibraryScreen({ navigation, route }: any) {
    const { user, mockId, group } = route.params
    const [recipes, setRecipes] = useState<any[]>([])

    useFocusEffect(
        useCallback(() => {
            fetchRecipes()
        }, [])
    )

    const fetchRecipes = async () => {
        try {
            const data = await api.get(`/recipes?groupId=${group.id}`, { 'x-mock-user-id': mockId })
            setRecipes(data)
        } catch (error: any) {
            Alert.alert('Error', error.message)
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Recipes</Text>
                <Button title="Add" onPress={() => navigation.navigate('AddRecipe', { user, mockId, group })} />
            </View>

            <FlatList
                data={recipes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.item}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.itemSubtitle}>{item.servings} servings • {item.isAIExtracted ? 'AI' : 'Manual'}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 24, fontWeight: 'bold' },
    item: { padding: 15, backgroundColor: 'white', marginBottom: 10, borderRadius: 8 },
    itemTitle: { fontSize: 18, fontWeight: 'bold' },
    itemSubtitle: { color: '#666', marginTop: 5 }
})
