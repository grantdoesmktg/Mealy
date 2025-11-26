import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native'
import { api } from '../lib/api'

export default function GroupSwitcherScreen({ navigation, route }: any) {
    const { user, mockId } = route.params
    const [groups, setGroups] = useState<any[]>([])
    const [newGroupName, setNewGroupName] = useState('')
    const [inviteCode, setInviteCode] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchGroups()
    }, [])

    const fetchGroups = async () => {
        try {
            const data = await api.get('/groups', { 'x-mock-user-id': mockId })
            setGroups(data)
        } catch (error: any) {
            Alert.alert('Error', error.message)
        }
    }

    const createGroup = async () => {
        if (!newGroupName) return
        try {
            await api.post('/groups', { name: newGroupName }, { 'x-mock-user-id': mockId })
            setNewGroupName('')
            fetchGroups()
        } catch (error: any) {
            Alert.alert('Error', error.message)
        }
    }

    const joinGroup = async () => {
        if (!inviteCode) return
        try {
            await api.post('/groups/join', { inviteCode }, { 'x-mock-user-id': mockId })
            setInviteCode('')
            fetchGroups()
        } catch (error: any) {
            Alert.alert('Error', error.message)
        }
    }

    const selectGroup = (group: any) => {
        // Navigate to Main Tab Navigator with group context
        navigation.replace('Main', { user, mockId, group })
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Groups</Text>

            <FlatList
                data={groups}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.groupItem} onPress={() => selectGroup(item)}>
                        <Text style={styles.groupName}>{item.name}</Text>
                        <Text style={styles.groupRole}>{item.members.length} members</Text>
                    </TouchableOpacity>
                )}
            />

            <View style={styles.section}>
                <Text style={styles.subtitle}>Create Group</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Group Name"
                    value={newGroupName}
                    onChangeText={setNewGroupName}
                />
                <Button title="Create" onPress={createGroup} />
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Join Group</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Invite Code"
                    value={inviteCode}
                    onChangeText={setInviteCode}
                />
                <Button title="Join" onPress={joinGroup} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    groupItem: {
        padding: 15,
        backgroundColor: '#f0f0f0',
        marginBottom: 10,
        borderRadius: 8,
    },
    groupName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    groupRole: {
        color: '#666',
    },
    section: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 20,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
})
