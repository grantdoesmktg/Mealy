import { model } from './gemini'

export async function generateWeekPlan(preferences: string, existingRecipes: any[]) {
    const prompt = `
    Generate a weekly meal plan (Mon-Sun) for Breakfast, Lunch, Dinner.
    Preferences: ${preferences}
    
    You can use these existing recipes if they fit:
    ${JSON.stringify(existingRecipes.map(r => ({ id: r.id, title: r.title })))}
    
    Return a JSON object with the following schema:
    {
      "assignments": [
        {
          "day": "Mon",
          "slot": "DINNER",
          "recipeName": "Spaghetti", 
          "recipeId": "existing-id-if-used-or-null",
          "isLeftover": false
        }
      ]
    }
    
    Do not include markdown formatting.
  `

    try {
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()

        return JSON.parse(jsonStr)
    } catch (error) {
        console.error('Error generating week plan:', error)
        return null
    }
}
