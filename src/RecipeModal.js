import React from 'react'

const RecipeModal = ({ recipe, onClose }) => {
  return (
    <div className="recipe-modal">
      <div className="recipe-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>{recipe.strMeal}</h2>
        <img 
          src={recipe.strMealThumb} 
          alt={recipe.strMeal}
          loading="lazy"
        />
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
  )
}

export default RecipeModal 