import axios from 'axios'
import './style.css'
import { useEffect, useState, useCallback } from 'react'

const Main = () => {
 const [items, setItems] = useState([])
 const [selectedMeal, setSelectedMeal] = useState(null)
 const [recipe, setRecipe] = useState(null)
 const [currentDiet, setCurrentDiet] = useState('')
 const [loading, setLoading] = useState(false)

 const API_KEY = process.env.REACT_APP_SPOONACULAR_API_KEY
 const DIET_TYPES = ['vegetarian', 'vegan', 'gluten-free', 'ketogenic', 'paleo', 'whole30']

 const fetchRandomDiet = useCallback(async () => {
  setLoading(true)
  try {
    // Randomly select a diet type
    const randomDiet = DIET_TYPES[Math.floor(Math.random() * DIET_TYPES.length)]
    setCurrentDiet(randomDiet)
    
    // Fetch recipes for the selected diet
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/complexSearch`, {
        params: {
          apiKey: API_KEY,
          diet: randomDiet,
          number: 12,
          addRecipeInformation: false,
          instructionsRequired: true,
          fillIngredients: true,
          addRecipeNutrition: true,
          maxReadyTime: 60,
          sort: 'healthiness',
          sortDirection: 'desc'
        }
      }
    )
    setItems(response.data.results)
  } catch (err) {
    console.error('Error fetching recipes:', err)
  } finally {
    setLoading(false)
  }
 }, [API_KEY])

 useEffect(() => {
  fetchRandomDiet()
 }, [fetchRandomDiet])

 const handleMealClick = async (id) => {
  setLoading(true)
  try {
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/${id}/information`, {
        params: {
          apiKey: API_KEY,
          includeNutrition: true
        }
      }
    )
    setRecipe(response.data)
    setSelectedMeal(id)
  } catch (err) {
    console.error('Error fetching recipe details:', err)
  } finally {
    setLoading(false)
  }
 }

 const closeRecipe = () => {
  setSelectedMeal(null)
  setRecipe(null)
 }

 const itemsList = items.map(({id, title, image, readyInMinutes, healthScore}) => {
  return (
    <section 
      key={id} 
      className='card' 
      onClick={() => handleMealClick(id)}
    >
      <img src={image} alt={title}/>
      <section className='content'>
        <p>{title}</p>
        <div className="recipe-meta">
          <span className="health-score" style={{ 
            color: healthScore > 70 ? '#4CAF50' : 
                   healthScore > 40 ? '#FFA500' : '#FF4444'
          }}>
            Health Score: {healthScore}%
          </span>
          <span className="cooking-time">⏱️ {readyInMinutes} mins</span>
        </div>
      </section>
    </section>
  )
 }) 

 return (
  <div className="main-container">
    <div className="header">
      <h2>Current Diet: {currentDiet.charAt(0).toUpperCase() + currentDiet.slice(1)}</h2>
      <button 
        className="refresh-button" 
        onClick={fetchRandomDiet}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Get New Recipes'}
      </button>
    </div>
    {loading && !selectedMeal ? (
      <div className="loading">Loading recipes...</div>
    ) : (
      <div className="items-container">{itemsList}</div>
    )}
    {selectedMeal && recipe && (
      <div className="recipe-modal">
        <div className="recipe-content">
          <button className="close-button" onClick={closeRecipe}>×</button>
          <h2>{recipe.title}</h2>
          <img src={recipe.image} alt={recipe.title} />
          <div className="recipe-meta-info">
            <span className="health-score" style={{ 
              color: recipe.healthScore > 70 ? '#4CAF50' : 
                     recipe.healthScore > 40 ? '#FFA500' : '#FF4444'
            }}>
              Health Score: {recipe.healthScore}%
            </span>
            <span>⏱️ {recipe.readyInMinutes} mins</span>
            <span>👥 {recipe.servings} servings</span>
          </div>
          <div className="recipe-details">
            <h3>Instructions:</h3>
            <div className="instructions">
              {recipe.analyzedInstructions[0]?.steps.map((step, index) => (
                <p key={index} className="instruction-step">
                  <span className="step-number">{index + 1}.</span> {step.step}
                </p>
              ))}
            </div>
            <h3>Ingredients:</h3>
            <ul className="ingredients-list">
              {recipe.extendedIngredients.map((ingredient, index) => (
                <li key={index}>
                  {ingredient.amount} {ingredient.unit} {ingredient.name}
                </li>
              ))}
            </ul>
            {recipe.nutrition && (
              <>
                <h3>Nutrition Information (per serving):</h3>
                <div className="nutrition-info">
                  {recipe.nutrition.nutrients.slice(0, 6).map((nutrient, index) => (
                    <div key={index} className="nutrient">
                      <span className="nutrient-name">{nutrient.name}:</span>
                      <span className="nutrient-amount">
                        {Math.round(nutrient.amount)}{nutrient.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
 )
}

export default Main