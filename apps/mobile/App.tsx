import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import AuthScreen from './src/screens/AuthScreen'
import GroupSwitcherScreen from './src/screens/GroupSwitcherScreen'
import RecipeLibraryScreen from './src/screens/RecipeLibraryScreen'
import WeekPlannerScreen from './src/screens/WeekPlannerScreen'
import ShoppingCartScreen from './src/screens/ShoppingCartScreen'
import PantryScreen from './src/screens/PantryScreen'
import SettingsScreen from './src/screens/SettingsScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function MainTabs({ route }: any) {
  const { user, mockId, group } = route.params
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Recipes" component={RecipeLibraryScreen} initialParams={{ user, mockId, group }} />
      <Tab.Screen name="Plan" component={WeekPlannerScreen} initialParams={{ user, mockId, group }} />
      <Tab.Screen name="Cart" component={ShoppingCartScreen} initialParams={{ user, mockId, group }} />
      <Tab.Screen name="Pantry" component={PantryScreen} initialParams={{ user, mockId, group }} />
      <Tab.Screen name="Settings" component={SettingsScreen} initialParams={{ user, mockId, group }} />
    </Tab.Navigator>
  )
}

import AddRecipeScreen from './src/screens/AddRecipeScreen'

// ... imports

import * as Linking from 'expo-linking'

const prefix = Linking.createURL('/')

const linking: any = {
  prefixes: [prefix, 'mealy://'],
  config: {
    screens: {
      Auth: 'auth',
      GroupSwitcher: 'groups',
      Main: {
        screens: {
          Recipes: 'recipes',
          Plan: 'plan',
          Cart: 'cart',
          Pantry: 'pantry',
          Settings: 'settings',
        },
      },
      AddRecipe: 'share', // mealy://share?url=...
    },
  },
}

export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        <Stack.Screen name="GroupSwitcher" component={GroupSwitcherScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="AddRecipe" component={AddRecipeScreen} options={{ title: 'Add Recipe' }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
