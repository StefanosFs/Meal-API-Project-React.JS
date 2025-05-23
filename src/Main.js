import axios from 'axios'
import './style.css'
import { useEffect, useState, useCallback } from 'react'

const Main = () => {
 const [items, setItems] = useState([])
 const [selectedMeal, setSelectedMeal] = useState(null)
 const [recipe, setRecipe] = useState(null)
 const [currentCategory, setCurrentCategory] = useState('')
 const [loading, setLoading] = useState(false)

 const fetchRandomCategory = useCallback(async () => {
  setLoading(true)
  try {
    // Get all categories
    const categoriesResponse = await axios.get('https://www.themealdb.com/api/json/v1/1/categories.php')
    const categories = categoriesResponse.data.categories
    
    // Randomly select a category
    const randomCategory = categories[Math.floor(Math.random() * categories.length)]
    setCurrentCategory(randomCategory.strCategory)
    
    // Fetch meals for the selected category
    const mealsResponse = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${randomCategory.strCategory}`)
    setItems(mealsResponse.data.meals)
  } catch (err) {
    console.error('Error fetching recipes:', err)
  } finally {
    setLoading(false)
  }
 }, [])

 useEffect(() => {
  fetchRandomCategory()
 }, [fetchRandomCategory])

 const handleMealClick = async (idMeal) => {
  setLoading(true)
  try {
    const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`)
    setRecipe(response.data.meals[0])
    setSelectedMeal(idMeal)
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

 const itemsList = items.map(({idMeal, strMeal, strMealThumb}) => {
  return (
    <section 
      key={idMeal} 
      className='card' 
      onClick={() => handleMealClick(idMeal)}
    >
      <img src={strMealThumb} alt={strMeal}/>
      <section className='content'>
        <p>{strMeal}</p>
      </section>
    </section>
  )
 })

 return (
  <div className="main-container">
    <div className="header">
      <h2>Current Category: {currentCategory}</h2>
      <button 
        className="refresh-button" 
        onClick={fetchRandomCategory}
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
          <h2>{recipe.strMeal}</h2>
          <img src={recipe.strMealThumb} alt={recipe.strMeal} />
          <div className="recipe-details">
            <h3>Instructions:</h3>
            <div className="instructions">
              {recipe.strInstructions.split('. ').map((step, index) => (
                step && (
                  <p key={index} className="instruction-step">
                    <span className="step-number">{index + 1}.</span> {step}
                  </p>
                )
              ))}
            </div>
            <h3>Ingredients:</h3>
            <ul className="ingredients-list">
              {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => {
                const ingredient = recipe[`strIngredient${num}`]
                const measure = recipe[`strMeasure${num}`]
                return ingredient && measure && (
                  <li key={num}>
                    {measure} {ingredient}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    )}
  </div>
 )
}

export default Main