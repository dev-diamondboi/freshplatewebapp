import express from 'express'
import recipeCtrl from '../Controllers/recipe.controller.js'
import authCtrl from '../Controllers/auth.controller.js'

const router = express.Router()

router.route('/api/recipes')
  .post(authCtrl.requireSignin, authCtrl.setUser, recipeCtrl.createRecipe)
  .get(recipeCtrl.getAllRecipes)
  
router.route('/api/recipes/:recipeId')
  .get(authCtrl.requireSignin, recipeCtrl.read)
  .put(authCtrl.requireSignin, authCtrl.hasAuthorization, recipeCtrl.updateRecipe)
  .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, recipeCtrl.deleteRecipe)

router.param('recipeId', recipeCtrl.recipeByID)

export default router