const items = [
    {
        id: 1,
        name: "Caramel Macchiato",
        price: 109,
        category: "Гаряча кава",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1200&auto=format&fit=crop",
        description: "Ніжне молоко, еспресо та карамельний соус."
    },
    {
        id: 2,
        name: "Pumpkin Spice Latte",
        price: 125,
        category: "Сезонні напої",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1200&auto=format&fit=crop",
        description: "Осінній хіт із гарбузовими спеціями та вершками."
    },
    {
        id: 3,
        name: "Cold Brew",
        price: 99,
        category: "Холодні напої",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=1200&auto=format&fit=crop",
        description: "Холодне заварювання протягом 20 годин."
    },
    {
        id: 4,
        name: "Matcha Latte",
        price: 115,
        category: "Чай",
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?q=80&w=1200&auto=format&fit=crop",
        description: "Японський чай матча з ніжним молоком."
    },
    {
        id: 5,
        name: "Frappuccino Vanilla",
        price: 135,
        category: "Фрапучино",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=1200&auto=format&fit=crop",
        description: "Освіжаючий вершковий напій із льодом."
    },
    {
        id: 6,
        name: "Caffe Latte",
        price: 95,
        category: "Гаряча кава",
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop",
        description: "Класичне поєднання еспресо та молока."
    }
];

function renderCards(data) {
    const container = document.getElementById("cards-container");
    container.innerHTML = "";
    data.forEach(item => {
        const col = document.createElement("div");
        col.className = "col-md-6 col-lg-4";
        col.innerHTML = `
            <div class="card h-100">
                <img src="${item.image}" class="card-img-top" alt="${item.name}">
                <div class="card-body">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text">${item.description}</p>
                    <p class="card-text">
                        <strong>${item.price} грн</strong>
                    </p>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                    <span class="badge bg-secondary">${item.category}</span>

                    <button 
                        class="btn btn-starbucks btn-sm"
                        data-bs-toggle="modal"
                        data-bs-target="#productModal"
                        onclick="openModal(${item.id})">
                        Детальніше
                    </button>
                </div>
            </div>
            `;
        container.appendChild(col);
    });
    console.table(data);
    console.log("Відрендерено карток:", data.length);
}

function renderPopularProducts() {
    const container = document.getElementById("popular-container");
    container.innerHTML = "";
    const topProducts = [...items]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);
    topProducts.forEach(item => {
        const popularity = Math.round((item.rating / 5) * 100);
        const block = document.createElement("div");
        block.className = "mb-4";
        block.innerHTML = `
            <div class="d-flex justify-content-between mb-2">
                <span class="fw-semibold">
                    ${item.name}
                </span>
                <span>
                    ${popularity}%
                </span>
            </div>
            <div class="progress starbucks-progress">
                <div
                    class="progress-bar"
                    style="width: ${popularity}%">
                </div>
            </div>
        `;
        container.appendChild(block);
    });
    console.log("Популярні напої:", topProducts);
}

function openModal(id) {

    const item = items.find(product => product.id === id);

    document.getElementById("modalTitle").textContent = item.name;
    document.getElementById("modalImage").src = item.image;
    document.getElementById("modalDescription").textContent = item.description;
    document.getElementById("modalCategory").textContent = item.category;
    document.getElementById("modalRating").textContent = item.rating;
    document.getElementById("modalPrice").textContent = item.price;
}

// Застосувати тему
function applyTheme(theme) {
    if (theme === "dark") {
        document.body.setAttribute("data-bs-theme", "dark");
        document.getElementById("themeToggle").textContent = "Світла тема";
    } else {
        document.body.removeAttribute("data-bs-theme");
        document.getElementById("themeToggle").textContent = "Темна тема";
    }
}

const categories = ["Усі", ...new Set(items.map(item => item.category))]

let filteredCards = [];
const filterControls = document.getElementById("filter-controls");

function setActiveFilterButton(activeCategory) {
    const buttons = filterControls.querySelectorAll("button");
    buttons.forEach(button => {
        if (button.dataset.category === activeCategory) {
            button.classList.remove("btn-outline-primary");
            button.classList.add("btn-success");
        } else {
            button.classList.remove("btn-success");
            button.classList.add("btn-outline-primary");
        }
    });
}

categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = `
        btn
        btn-outline-primary
        me-2
        mb-2
    `;
    btn.textContent = cat;
    btn.dataset.category = cat;
    btn.addEventListener("click", () => {
        const filtered = cat === "Усі" ? items : items.filter(item => item.category === cat);
        renderCards(filtered);
        filteredCards = filtered;
        localStorage.setItem("selectedCategory", cat);
        setActiveFilterButton(cat);
        console.log("Фільтр:", cat);
    });
    filterControls.appendChild(btn);
});

const sortControls = document.getElementById("sort-controls");
sortControls.innerHTML = `
    <select id="sortSelect" class="form-select w-auto d-inline-block">
        <option value="default">За замовчуванням</option>
        <option value="price-asc">Ціна: від дешевих</option>
        <option value="price-desc">Ціна: від дорогих</option>
        <option value="name">За назвою (А–Я)</option>
        <option value="rating">За рейтингом</option>
    </select>
`;

document.getElementById("sortSelect").addEventListener("change", (e) => {
    const value = e.target.value;
    let sorted = [...filteredCards];
    if (value === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (value === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (value === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (value === "rating") sorted.sort((a, b) => b.rating - a.rating);
    renderCards(sorted);
    localStorage.setItem("sortOrder", value);
    console.log("Сортування:", value);
});

// Обробник кліку
document.getElementById("themeToggle").addEventListener("click", () => {
    const current = localStorage.getItem("theme") || "light";
    const next = current === "light" ? "dark" : "light";
    localStorage.setItem("theme", next);
    applyTheme(next);
    console.log("Тема змінена на:", next);
});

document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme") || "light";
    
    applyTheme(savedTheme);
    renderPopularProducts();
    
    const savedCategory = localStorage.getItem("selectedCategory");
    if (savedCategory && savedCategory !== "Усі") {
        filteredCards = items.filter(item => item.category === savedCategory);
        renderCards(filteredCards);
        setActiveFilterButton(savedCategory);
    } else {
        filteredCards = [...items];
        renderCards(items);
        setActiveFilterButton(categories[0]);
    }
    
    const savedSort = localStorage.getItem("sortOrder");
    if (savedSort) {
        document.getElementById("sortSelect").value = savedSort;
        document.getElementById("sortSelect").dispatchEvent(new Event("change"));
    }
    
    console.log("localStorage:", {
        theme: localStorage.getItem("theme"),
        filter: localStorage.getItem("selectedCategory")
    });
});
