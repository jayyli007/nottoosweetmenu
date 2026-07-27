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
    // card thumbnail always shows the first photo; cycling through the
    // rest only happens in the expanded modal
    card.innerHTML = `
        <img src="${item.images[0]}" alt="${item.name}">
        <h3>${item.name}</h3>
        <p>${item.price}</p>
        <p>${item.batchSize}</p>
    `;

    card.addEventListener("click", () => openModal(item));

    return card;
}


// --- item popup modal: click a card to open it, "Add to Cart" hands the
// item off to the order page via localStorage since menu.js and order.js
// are separate pages with no shared state ---
const modalOverlay = document.getElementById("item-modal");
const modalImg = document.getElementById("modal-img");
const modalPrevBtn = document.getElementById("modal-prev-btn");
const modalNextBtn = document.getElementById("modal-next-btn");
const modalName = document.getElementById("modal-name");
const modalPrice = document.getElementById("modal-price");
const modalDescription = document.getElementById("modal-description");
const modalBatchSize = document.getElementById("modal-batch-size");
const modalAddBtn = document.getElementById("modal-add-btn");

let selectedItem = null;
let currentImageIndex = 0;

function showImage(index) {
    currentImageIndex = index;
    modalImg.src = selectedItem.images[currentImageIndex];
    modalImg.alt = selectedItem.name;

    // only show an arrow when there's actually somewhere left to scroll
    modalPrevBtn.classList.toggle("hidden", currentImageIndex === 0);
    modalNextBtn.classList.toggle("hidden", currentImageIndex === selectedItem.images.length - 1);
}

function openModal(item) {
    selectedItem = item;
    showImage(0);
    modalName.textContent = item.name;
    modalPrice.textContent = item.price;
    modalDescription.textContent = item.description;
    modalBatchSize.textContent = item.batchSize;
    modalOverlay.classList.remove("hidden");
}

modalPrevBtn.addEventListener("click", () => showImage(currentImageIndex - 1));
modalNextBtn.addEventListener("click", () => showImage(currentImageIndex + 1));

function closeModal() {
    modalOverlay.classList.add("hidden");
}

modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) closeModal();
});
document.getElementById("modal-close-btn").addEventListener("click", closeModal);

modalAddBtn.addEventListener("click", () => {
    localStorage.setItem("pendingCartItem", selectedItem.name);
    window.location.href = "order.html";
});


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
