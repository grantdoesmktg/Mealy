import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView, Button, StyleSheet, TouchableOpacity, Alert, Modal, FlatList } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../lib/api'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SLOTS = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'DESSERT']

export default function WeekPlannerScreen({ navigation, route }: any) {
    const { user, mockId, group } = route.params
    const [weekPlan, setWeekPlan] = useState<any>(null)
    const [recipes, setRecipes] = useState<any[]>([])
    const [modalVisible, setModalVisible] = useState(false)
    const [selectedDay, setSelectedDay] = useState('')
    const [selectedSlot, setSelectedSlot] = useState('')

    // Current week start (Monday)
    const getMonday = (d: Date) => {
        d = new Date(d)
        const day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -6 : 1)
        return new Date(d.setDate(diff))
    }
    const weekStartDate = getMonday(new Date()).toISOString().split('T')[0]

    useFocusEffect(
        useCallback(() => {
            fetchWeekPlan()
            fetchRecipes()
        }, [])
    )

    const fetchWeekPlan = async () => {
        try {
            const data = await api.get(`/groups/${group.id}/week-plan?weekStartDate=${weekStartDate}`, { 'x-mock-user-id': mockId })
            setWeekPlan(data)
        } catch (error: any) {
            // If 404 or empty, just null
            if (error.message.includes('404')) setWeekPlan(null)
            else console.log('Error fetching plan:', error.message)
        }
    }

    const fetchRecipes = async () => {
        try {
            const data = await api.get(`/recipes?groupId=${group.id}`, { 'x-mock-user-id': mockId })
            setRecipes(data)
        } catch (error: any) {
            console.log('Error fetching recipes:', error.message)
        }
    }

    const openAssignModal = (day: string, slot: string) => {
        setSelectedDay(day)
        setSelectedSlot(slot)
        setModalVisible(true)
    }

    const assignRecipe = async (recipe: any) => {
        try {
            // Construct new assignments list
            const currentAssignments = weekPlan?.assignments || []
            // Remove existing for this slot
            const filtered = currentAssignments.filter((a: any) => !(a.day === selectedDay && a.slot === selectedSlot))

            const newAssignment = {
                recipeId: recipe.id,
                day: selectedDay,
                slot: selectedSlot,
                isLeftover: false
            }

            const updatedAssignments = [...filtered, newAssignment]

            await api.post(`/groups/${group.id}/week-plan`, {
                weekStartDate,
                assignments: updatedAssignments
            }, { 'x-mock-user-id': mockId })

            setModalVisible(false)
            fetchWeekPlan()
        } catch (error: any) {
            Alert.alert('Error', error.message)
        }
    }

    const getAssignment = (day: string, slot: string) => {
        return weekPlan?.assignments?.find((a: any) => a.day === day && a.slot === slot)
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Week of {weekStartDate}</Text>

            <ScrollView>
                {DAYS.map(day => (
                    <View key={day} style={styles.dayContainer}>
                        <Text style={styles.dayTitle}>{day}</Text>
                        {SLOTS.map(slot => {
                            const assignment = getAssignment(day, slot)
                            return (
                                <View key={slot} style={styles.slotRow}>
                                    <Text style={styles.slotName}>{slot}</Text>
                                    {assignment ? (
                                        <TouchableOpacity style={styles.assignedCard} onPress={() => openAssignModal(day, slot)}>
                                            <Text style={styles.recipeTitle}>{assignment.recipe.title}</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <Button title="+" onPress={() => openAssignModal(day, slot)} />
                                    )}
                                </View>
                            )
                        })}
                    </View>
                ))}
            </ScrollView>

            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Select Recipe for {selectedDay} {selectedSlot}</Text>
                    <FlatList
                        data={recipes}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.modalItem} onPress={() => assignRecipe(item)}>
                                <Text style={styles.modalItemText}>{item.title}</Text>
                            </TouchableOpacity>
                        )}
                    />
                    <Button title="Cancel" onPress={() => setModalVisible(false)} />
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, paddingTop: 50 },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    dayContainer: { marginBottom: 20, backgroundColor: '#fff', padding: 10, borderRadius: 8 },
    dayTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    slotRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
    slotName: { width: 80, fontSize: 12, color: '#666' },
    assignedCard: { flex: 1, padding: 10, backgroundColor: '#e0e0e0', borderRadius: 5 },
    recipeTitle: { fontWeight: 'bold' },
    modalContainer: { flex: 1, padding: 20, paddingTop: 50 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    modalItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    modalItemText: { fontSize: 16 }
})
