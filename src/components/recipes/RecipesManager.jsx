// src/recipes/RecipesManager.jsx
import React, { useState } from 'react'
import RecipeCategorySelector from './RecipeCategorySelector'
import RecipesList from './RecipesList'

const RecipesManager = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState(null)

  // Ако няма избрана категория, показваме избор на категории
  if (!selectedCategory) {
    return (
      <RecipeCategorySelector
        onSelectCategory={setSelectedCategory}
        onBack={onBack}
      />
    )
  }

  // Ако има избрана категория, показваме рецептите
  return (
    <RecipesList
      category={selectedCategory}
      onBack={onBack}
      onBackToCategories={() => setSelectedCategory(null)}
    />
  )
}

export default RecipesManager