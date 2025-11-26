import { model } from './gemini'

export async function extractRecipeFromUrl(url: string) {
    const prompt = `
    Extract the recipe from the following URL: ${url}
    
    Return a JSON object with the following schema:
    {
      "title": "Recipe Title",
      "ingredients": ["1 cup flour", "2 eggs"],
      "steps": ["Mix ingredients", "Bake at 350F"],
      "servings": 4,
      "imageUrl": "https://example.com/image.jpg"
    }
    
    If you cannot extract it, return null.
    Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
  `

    try {
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Clean up markdown if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()

        return JSON.parse(jsonStr)
    } catch (error) {
        console.error('Error extracting recipe:', error)
        return null
    }
}

export async function extractRecipeFromText(text: string) {
    const prompt = `
    Extract the recipe from the following text:
    ${text}
    
    Return a JSON object with the following schema:
    {
      "title": "Recipe Title",
      "ingredients": ["1 cup flour", "2 eggs"],
      "steps": ["Mix ingredients", "Bake at 350F"],
      "servings": 4
    }
    
    If you cannot extract it, return null.
    Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
  `

    try {
        const result = await model.generateContent(prompt)
        const response = await result.response
        const responseText = response.text()

        const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim()

        return JSON.parse(jsonStr)
    } catch (error) {
        console.error('Error extracting recipe:', error)
        return null
    }
}
