import * as model from './model.js';
import recipeView from './views/recipeView.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

const controlRecipies = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;

    // render spinner until waiting recipe
    recipeView.renderSpinner();

    // 0 update results view
    resultsView.update(model.getSearchResults());

    // 1 Update bookmark view
    bookmarksView.update(model.state.bookmarks);

    // 2 Loading recipe
    await model.loadRecipe(id);

    // 3 render recipe
    recipeView.render(model.state.recipe);
  } catch (error) {
    console.error(error);
    recipeView.renderError('something brokes');
  }
};

const controlSearchResults = async function () {
  try {
    // 1 get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2 render spinner
    resultsView.renderSpinner();

    // 3 load search results
    await model.loadSearchResults(query);

    // 4 render results
    resultsView.render(model.getSearchResults());

    // 5 render pagination buttons
    paginationView.render(model.state.search);
  } catch (error) {
    throw error;
  }
};

const controlPagination = function (gotoPage) {
  // 3 render new results
  resultsView.render(model.getSearchResults(gotoPage));

  // 4 render new pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  recipeView.update(model.state.recipe);
};

const controlAddBookMark = function () {
  // 1 - Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else if (model.state.recipe.bookmarked)
    model.deleteBookmark(model.state.recipe.id);

  // 2 - update recipe view
  recipeView.update(model.state.recipe);

  // 3 - render mookbarks
  bookmarksView.render(model.state.bookmarks);
  // model.addBookmark(model.state.recipe);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Render spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (error) {
    console.error('Error with upload', error);
    addRecipeView.renderError(error.message);
  }
};

const controlBookmarks = () => {
  bookmarksView.render(model.state.bookmarks);
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandler(controlRecipies);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookMark(controlAddBookMark);
  searchView.addEventHandlerSearch(controlSearchResults);
  paginationView.addHandler(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
