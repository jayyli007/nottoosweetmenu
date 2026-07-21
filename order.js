/*
THIS IS THE ORDER FORM PAGE
cart lives as an in-memory array, same pattern as allItems on the menu page
*/

let allItems = [];   // this page's own copy — order.js can't reach menu.js's allItems, separate pages

const quantities = Array.from({ length: 20 }, (_, i) => i + 1);
dropdown(document.getElementById("quantity-select"), quantities);

fetch("menu.json")
    .then(sealedData => sealedData.json())
    .then(realData => {
        allItems = realData;

        const itemNames = allItems.map(item => item.name).sort();
        dropdown(document.getElementById("item-select"), itemNames);

        dropdown(document.getElementById("payment-select"), ["Zelle", "Venmo", "Cash"]);
    });

let cart = [];   // { name, quantity, price } objects, built up by addOrder()

// generic: takes a <select> element and an array of strings,
// builds one <option> per string and appends it. reused for both
// item names and payment methods.
function dropdown(selectElement, options) {
    for (const option of options) {
        const el = document.createElement("option");
        el.value = option;
        el.textContent = option;
        selectElement.appendChild(el);
    }
}

// runs when the "Add to Order" button is clicked.
// reads the currently selected item + quantity from the dropdowns,
// adds (or updates) an entry in `cart`, then re-renders the summary.
function addOrder() {
    const name = document.getElementById("item-select").value;
    const quantity = Number(document.getElementById("quantity-select").value);
    const menuItem = allItems.find(item => item.name === name);

    const existing = cart.find(entry => entry.name === name);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ name: name, quantity: quantity, price: menuItem.price });
    }

    renderSummary();
}

// clears and rebuilds #summary-body from `cart`, one row per entry,
// each with a remove button, and updates #total-price.
// same clear-then-rebuild pattern as render() on the menu page.
function renderSummary() {
    const summaryBody = document.getElementById("summary-body");
    summaryBody.innerHTML = "";

    let total = 0;

    for (const entry of cart) {
        // prices are still "pending..." placeholders in menu.json right now,
        // so this can't compute a real number yet — treated as 0 until real
        // numeric prices are filled in.
        const unitPrice = parseFloat(String(entry.price).replace(/[^0-9.]/g, ""));
        const lineTotal = isNaN(unitPrice) ? 0 : unitPrice * entry.quantity;
        total += lineTotal;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${entry.name}</td>
            <td>${entry.quantity}</td>
            <td>${entry.price}</td>
        `;

        const removeCell = document.createElement("td");
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "remove-item-btn";
        removeBtn.textContent = "x";
        removeBtn.title = "Remove item?";
        removeBtn.addEventListener("click", () => {
            cart = cart.filter(item => item.name !== entry.name);
            renderSummary();
        });
        removeCell.appendChild(removeBtn);
        row.appendChild(removeCell);

        summaryBody.appendChild(row);
    }

    document.getElementById("total-price").textContent = total.toFixed(2);
}

document.getElementById("add-order-btn").addEventListener("click", addOrder);

// live-formats #phone-input as the user types into (xxx)-xxx-xxxx,
// rejects any non-digit characters. sets up an "input" listener once.
function phoneNumber() {
    const input = document.getElementById("phone-input");

    input.addEventListener("input", () => {
        const digits = input.value.replace(/\D/g, "").slice(0, 10);

        let formatted = digits;
        if (digits.length > 6) {
            formatted = `(${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(6)}`;
        } else if (digits.length > 3) {
            formatted = `(${digits.slice(0, 3)})-${digits.slice(3)}`;
        } else if (digits.length > 0) {
            formatted = `(${digits}`;
        }

        input.value = formatted;
    });
}

// counts words in #details-textarea on input, updates #word-count,
// prevents typing past 250 words. sets up an "input" listener once.
function additionalDetails() {
    const textarea = document.getElementById("details-textarea");
    const wordCount = document.getElementById("word-count");

    textarea.addEventListener("input", () => {
        const words = textarea.value.trim().split(/\s+/).filter(word => word.length > 0);

        if (words.length > 250) {
            textarea.value = words.slice(0, 250).join(" ");
        }

        wordCount.textContent = Math.min(words.length, 250);
    });
}

phoneNumber();
additionalDetails();

// runs on the form's submit event.
// validates cart isn't empty, payment is selected, phone matches the format.
// assembles the final order summary text into #order-summary-hidden
// before letting the form actually POST to FormSubmit.
function formSubmit(event) {
    if (cart.length === 0) {
        event.preventDefault();
        alert("Please add at least one item to your order.");
        return;
    }

    const payment = document.getElementById("payment-select").value;
    if (!payment) {
        event.preventDefault();
        alert("Please select a payment method.");
        return;
    }

    const phone = document.getElementById("phone-input").value;
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length !== 10) {
        event.preventDefault();
        alert("Please enter a valid 10-digit phone number.");
        return;
    }

    // assemble a plain-text summary of the order into the hidden field,
    // since that's what actually shows up in the email FormSubmit sends
    const lines = cart.map(entry => `${entry.name} x${entry.quantity} - ${entry.price}`);
    const total = document.getElementById("total-price").textContent;
    const summaryText = lines.join("\n") + `\nTotal: $${total}`;

    document.getElementById("order-summary-hidden").value = summaryText;
    // no preventDefault here — validation passed, let the form actually submit
}

document.getElementById("order-form").addEventListener("submit", formSubmit);
