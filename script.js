/*
THIS IS THE MENU PAGE DESIGN 
IT FOLLOWS AN INDIVIDUAL ITEM --> MENU --> FILTERED MENU STRUCTURE 
*/

let allItems = [];   // top-level scope, so render/filter can both reach it later


// converts menu.json ---> a workable array, stores it, then triggers first render
fetch("menu.json")
    .then(sealedData => sealedData.json())
    .then(realData => {
        allItems = realData;   // save the fetched array outside the callback
        render(allItems);       // initial render, showing everything
        renderFilters(allItems);   // build the checkboxes, once
    });


// generates a card (element) based on HTML array data
// renders 1 item into 1 card 
function createCard(item) {     
    const card = document.createElement("div");         // create a real document object model (DOM) element in memory
    card.className = "card";                            // CSS hook for later styling (grid layout, spacing, etc.)
    card.dataset.category = item.category;              // sets a data-category="..." attribute, used later to filter cards by category
    
    // build the card's inner HTML from the item's fields
    card.innerHTML = `                              
        <img src="${item.image}" alt="${item.name}">
        <h3>${item.name}</h3>
        <p>${item.price}</p>
        <p>${item.description}</p>
    `;
    return card;
}


// global declaration of <div id ="menu">
// card displayer
const menuContainer = document.getElementById("menu")
const filtersContainer = document.getElementById("filters")

// loops through each datapoint, calling createCard individually for each one
// fully renders the entire page upon landing 
// gets fed the narrowed-down array from 'filter'
function render(items) {
    menuContainer.innerHTML = "";

    for (const item of items) {
        const card = createCard(item);
        menuContainer.appendChild(card)     // input: card js object --> output: addition to menuContainer
    }
}

function filter(selectedCategories) {
    if (selectedCategories.length === 0) {
        render(allItems);
        return;
    }

    const filteredItems = allItems.filter(item => selectedCategories.includes(item.category)); // filters based on single 'catergory' excluding all those unchecked
    render(filteredItems);
}
// narrows the array down 

function renderFilters(items) {

    // isolate categories into a list
    const categoriesTemp = items.map(item => item.category);     
    const categories = [...new Set(categoriesTemp)];     

    // category checkbox logic 
    for (const category of categories){

        const checkbox = document.createElement("input")
        checkbox.type = "checkbox"
        checkbox.value = category
        checkbox.className = "category-checkbox"   // shared class so we can query all of them together later

        const label = document.createElement("label");      // wrapper element that displays text and functionality 
        label.appendChild(checkbox);        // element label is a parent node to element checkbox 
        label.append(category);

        checkbox.addEventListener('change', () => {
            const allCheckboxes = document.querySelectorAll(".category-checkbox");
            const selectedCategories = Array.from(allCheckboxes)        // JS array --> Nodelist to conduct real functions 
                .filter(cb => cb.checked)
                .map(cb => cb.value);
            filter(selectedCategories);
        });

        filtersContainer.appendChild(label);
    }
}
