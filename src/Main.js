import axios from 'axios'
import './style.css'
import { useEffect, useState } from 'react'

const Main = () => {
 const [items, setItems] = useState([])
 const [selectedMeal, setSelectedMeal] = useState(null)
 const [recipe, setRecipe] = useState(null)
 const [currentCategory, setCurrentCategory] = useState('')

 const fetchRandomCategory = async () => {
  try {
    // First get all categories
    const categoriesResponse = await axios.get('https://www.themealdb.com/api/json/v1/1/categories.php')
    const categories = categoriesResponse.data.categories
    
    // Randomly select a category
    const randomCategory = categories[Math.floor(Math.random() * categories.length)]
    setCurrentCategory(randomCategory.strCategory)
    
    // Fetch meals from the selected category
    const mealsResponse = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${randomCategory.strCategory}`)
    setItems(mealsResponse.data.meals)
  } catch (err) {
    console.log(err)
  }
 }

 useEffect(() => {
  fetchRandomCategory()
 }, [])

 const handleMealClick = async (idMeal) => {
  try {
    const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`)
    setRecipe(response.data.meals[0])
    setSelectedMeal(idMeal)
  } catch (err) {
    console.log(err)
  }
 }

 const closeRecipe = () => {
  setSelectedMeal(null)
  setRecipe(null)
 }

 const itemsList = items.map(({strMeal, strMealThumb, idMeal}) =>{
  return (
    <section 
      key={idMeal} 
      className='card' 
      onClick={() => handleMealClick(idMeal)}
    >
      <img src={strMealThumb} alt='meal-img'/>
      <section className='content'>
        <p>{strMeal}</p>
        <p>#{idMeal}</p>
      </section>
    </section>
  )
 }) 

 return (
  <div className="main-container">
    <div className="header">
      <h2>Current Category: {currentCategory}</h2>
      <button className="refresh-button" onClick={fetchRandomCategory}>
        Get New Recipes
      </button>
    </div>
    <div className="items-container">{itemsList}</div>
    {selectedMeal && recipe && (
      <div className="recipe-modal">
        <div className="recipe-content">
          <button className="close-button" onClick={closeRecipe}>×</button>
          <h2>{recipe.strMeal}</h2>
          <img src={recipe.strMealThumb} alt={recipe.strMeal} />
          <div className="recipe-details">
            <h3>Instructions:</h3>
            <p>{recipe.strInstructions}</p>
            <h3>Ingredients:</h3>
            <ul>
              {Object.keys(recipe).map(key => {
                if (key.startsWith('strIngredient') && recipe[key]) {
                  const measureKey = key.replace('strIngredient', 'strMeasure')
                  return (
                    <li key={key}>
                      {recipe[measureKey]} {recipe[key]}
                    </li>
                  )
                }
                return null
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