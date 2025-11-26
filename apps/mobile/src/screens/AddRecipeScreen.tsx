import React, { useState } from 'react'
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, Switch } from 'react-native'
import { api } from '../lib/api'

export default function AddRecipeScreen({ navigation, route }: any) {
    const { user, mockId, group, url } = route.params
    const [title, setTitle] = useState('')
    const [sourceUrl, setSourceUrl] = useState(url || '')
    const [useAI, setUseAI] = useState(!!url) // Auto-enable AI if shared via URL
    const [loading, setLoading] = useState(false)
    const [ingredients, setIngredients] = useState('') // Simple text for MVP
    const [steps, setSteps] = useState('') // Simple text for MVP

    const handleSave = async () => {
        setLoading(true)
        try {
            // Parse ingredients/steps from text if manual
            const ingredientsList = ingredients.split('\n').filter(i => i.trim())
            const stepsList = steps.split('\n').filter(s => s.trim())

            await api.post('/recipes', {
                title,
                sourceUrl,
                useAI,
                groupId: group.id,
                ingredients: ingredientsList,
                steps: stepsList
            }, { 'x-mock-user-id': mockId })

            navigation.goBack()
        } catch (error: any) {
            Alert.alert('Error', error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.label}>Title</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} />

            <Text style={styles.label}>Source URL</Text>
            <TextInput style={styles.input} value={sourceUrl} onChangeText={setSourceUrl} autoCapitalize="none" />

            <View style={styles.row}>
                <Text style={styles.label}>Use AI Extraction (Paid)</Text>
                <Switch value={useAI} onValueChange={setUseAI} />
            </View>

            {!useAI && (
                <>
                    <Text style={styles.label}>Ingredients (one per line)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={ingredients}
                        onChangeText={setIngredients}
                        multiline
                    />

                    <Text style={styles.label}>Steps (one per line)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={steps}
                        onChangeText={setSteps}
                        multiline
                    />
                </>
            )}

            <Button title={loading ? "Saving..." : "Save Recipe"} onPress={handleSave} disabled={loading} />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    label: { fontSize: 16, fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, backgroundColor: 'white' },
    textArea: { height: 100, textAlignVertical: 'top' },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 10 }
})
