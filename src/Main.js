import axios from 'axios'
import './style.css'
import { useEffect, useState, useCallback, Suspense, lazy } from 'react'

// Lazy load the recipe modal component
const RecipeModal = lazy(() => import('./RecipeModal'))

const Main = () => {
 const [items, setItems] = useState([])
 const [selectedMeal, setSelectedMeal] = useState(null)
 const [recipe, setRecipe] = useState(null)
 const [currentCategory, setCurrentCategory] = useState('')
 const [loading, setLoading] = useState(false)
 const [imageLoadStatus, setImageLoadStatus] = useState({})

 const fetchRandomCategory = useCallback(async () => {
  setLoading(true)
  setItems([]) // Clear items immediately for better UX
  try {
    // Fetch categories and meals in parallel
    const [categoriesResponse, mealsResponse] = await Promise.all([
      axios.get('https://www.themealdb.com/api/json/v1/1/categories.php'),
      axios.get('https://www.themealdb.com/api/json/v1/1/random.php')
    ])
    
    const categories = categoriesResponse.data.categories
    const randomCategory = categories[Math.floor(Math.random() * categories.length)]
    setCurrentCategory(randomCategory.strCategory)
    
    const meals = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${randomCategory.strCategory}`)
    setItems(meals.data.meals)
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
  if (selectedMeal === idMeal) {
    closeRecipe()
    return
  }
  
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

 const handleImageLoad = (idMeal) => {
  setImageLoadStatus(prev => ({
    ...prev,
    [idMeal]: true
  }))
 }

 const itemsList = items.map(({idMeal, strMeal, strMealThumb}) => {
  const isImageLoaded = imageLoadStatus[idMeal]
  
  return (
    <section 
      key={idMeal} 
      className={`card ${!isImageLoaded ? 'loading' : ''}`}
      onClick={() => handleMealClick(idMeal)}
    >
      <img 
        src={strMealThumb} 
        alt={strMeal}
        loading="lazy"
        onLoad={() => handleImageLoad(idMeal)}
        style={{ opacity: isImageLoaded ? 1 : 0 }}
      />
      {!isImageLoaded && <div className="image-placeholder" />}
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
    
    {loading && items.length === 0 ? (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading recipes...</p>
      </div>
    ) : (
      <div className="items-container">{itemsList}</div>
    )}

    {selectedMeal && recipe && (
      <Suspense fallback={
        <div className="modal-loading">
          <div className="loading-spinner" />
          <p>Loading recipe details...</p>
        </div>
      }>
        <RecipeModal
          recipe={recipe}
          onClose={closeRecipe}
        />
      </Suspense>
    )}
  </div>
 )
}

export default Main