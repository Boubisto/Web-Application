document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#menu').addEventListener('click', () => load_cookbook('menu'));
    document.querySelector('#added').addEventListener('click', () => load_cookbook('added'));
    document.querySelector('#saved').addEventListener('click', () => load_cookbook('favorite'));
    document.querySelector('#add').addEventListener('click', write_recipe);
    document.querySelector('#add-form').onsubmit = add_recipe;
  
    // By default, load the menu
    load_cookbook('menu');
  });
  
  function write_recipe() {
  
    // Show add view and hide other views
    document.querySelector('#recipes-view').style.display = 'none';
    document.querySelector('#add-view').style.display = 'block';
    document.querySelector('#recipe-view').style.display = 'none';
  
    // Clear out composition fields
    document.querySelector('#add-title').value = '';
    document.querySelector('#add-description').value = '';
    document.querySelector('#add-ingredients').value = '';
  }
  
  function load_cookbook(cookbook) {
    
    // Show the cookbook and hide other views
    document.querySelector('#recipes-view').style.display = 'block';
    document.querySelector('#add-view').style.display = 'none';
    document.querySelector('#recipe-view').style.display = 'none';
  
    // Show the cookbook name
    document.querySelector('#recipes-view').innerHTML = `<h3>${cookbook.charAt(0).toUpperCase() + cookbook.slice(1)}</h3>`;
  
    
      // Request for recipes from the cookbook
      fetch(`/recipes/${cookbook}`)
          .then(response => response.json())
          .then(recipes => {
              recipes.forEach(recipe => {
                  const div = document.createElement("div");
                  div.innerHTML = `
                      <div style="color: grey;"></div>
                      <span><b>Creator:</b> ${recipe.creator}</span><br>
                      <span><b>Title:</b> ${recipe.title} recipe</span>
                      <span style="float: right;">${recipe.timestamp}</span><hr>`
                  //div.className = "cookbook-email"
                  
  
                  // display the content of recipe
                  div.addEventListener('click', function() {
                      fetch(`/recipes/${recipe.id}`)
                          .then(response => response.json())
                          .then(recipe => {
                             
                              // load details on page
                              loadRecipe(recipe, cookbook)
                          });
                  })
  
                  div.style.backgroundColor = "white";

                  document.querySelector("#recipes-view").append(div)
              })
          });
  
  };
  
  function loadRecipe(recipeData, fromCookbook) {
    document.querySelector('#recipes-view').style.display = 'none';
    document.querySelector('#add-view').style.display = 'none';
    document.querySelector('#recipe-view').style.display = 'block';
  
    const recipeTitle = document.createElement("div");
    //recipeTitle.innerHTML = recipeData.title;
    recipeTitle.className = 'recipe-title';
  
    const detailedInfo = document.createElement("div");
    detailedInfo.innerHTML = `
        <div>
            <span><b>Creator:</b> </span>${recipeData.creator}<br>
            <span><b>Title:</b> </span>${recipeData.title}<br>
            <span><b>Description:</b> </span>${recipeData.description}<br>
            <span><b>Ingredients:</b> </span>${recipeData.ingredients}
            <span style="float: right">${recipeData.timestamp}</span>
        </div>    `
    const creatorSection = document.createElement("div");
    creatorSection.innerHTML = `<span>From: </span>${recipeData.creator}`;
  
    const titleSection = document.createElement("div");
    titleSection.innerHTML = `<span>title: </span>${recipeData.title}`;
  
    const timestampSection = document.createElement("div");
    timestampSection.innerHTML = `<span>Timestamp: </span>${recipeData.timestamp}`;
  
 
  
    // Load the components to be displayed
    document.querySelector('#recipe-view').innerHTML = "";
    document.querySelector('#recipe-view').append(recipeTitle)
    document.querySelector('#recipe-view').append(detailedInfo)
  
    // Add save button
    if (fromCookbook === "menu") {
        const saveButton = document.createElement("button");
        saveButton.innerHTML = "Add to Favorite"
        saveButton.addEventListener('click', function() {
            fetch(`/recipes/${recipeData.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                  saved: true
                })
            })
          load_cookbook("menu")
              
        })
        document.querySelector('#recipe-view').append(saveButton)
    } else if (fromCookbook === "favorite") {
        const unsaveButton = document.createElement("button");
        unsaveButton.innerHTML = "Move to menu"
        unsaveButton.addEventListener('click', function() {
            fetch(`/recipes/${recipeData.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    saved: false
                  })
            })
          load_cookbook("menu")
            
        })
        document.querySelector('#recipe-view').append(unsaveButton)
    }
    document.querySelector('#recipe-view').append(descriptionSection)
  }
  
  function add_recipe(){
      const title = document.querySelector('#add-title').value;
      const description = document.querySelector('#add-description').value;
      const ingredients = document.querySelector('#add-ingredients').value;
      fetch('/recipes', {
          method: 'POST',
          body: JSON.stringify({
          title: title,
          description: description,
          ingredients: ingredients
          })
      })
      .then(response => response.json())
          .then(result => {
              if ("message" in result) {
                  // The recipe was added successfully!
                  load_cookbook('added');
              }
              if ("error" in result) {
                  // There was an error in adding the recipe
                  console.log("error" in result);            
              }
          })
          .catch(error => {
              console.log(error);
          });
      return false;
  }