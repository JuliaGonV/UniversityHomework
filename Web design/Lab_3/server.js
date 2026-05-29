const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, "items.json");
const swaggerDocument = YAML.load("./openapi.yaml");

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);

function readItems() {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function writeItems(items) {
    fs.writeFileSync(
        DB_PATH,
        JSON.stringify(items, null, 2)
    );
}

app.get("/api/items", (req, res) => {
    try {
        let items = readItems();
        const { category, sort, search } = req.query;
        if (category) {
            items = items.filter(
                item => item.category === category
            );
        }
        if (search) {
            items = items.filter(item =>
                item.name
                    .toLowerCase()
                    .includes(search.toLowerCase())
            );
        }
        
        if (sort === "price-asc") items.sort((a, b) => a.price - b.price);
        if (sort === "price-desc") items.sort((a, b) => b.price - a.price);
        if (sort === "name") items.sort((a, b) => a.name.localeCompare(b.name));
        if (sort === "rating") items.sort((a, b) => b.rating - a.rating);
        
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({
            error: "Server error"
        });
    }
});

app.get("/api/items/:id", (req, res) => {
    try {
        const items = readItems();
        const item = items.find(i => i.id === Number(req.params.id));
        if (!item) {
            return res.status(404).json({
                error: "Item not found"
            });
        }
        res.status(200).json(item);
    } catch {
        res.status(500).json({
            error: "Server error"
        });
    }
});

app.post("/api/items", (req, res) => {
    try {
        const items = readItems();
        const {
            name,
            price,
            category,
            rating,
            image,
            description
        } = req.body;
        if (
            !name ||
            typeof price !== "number" ||
            !category ||
            typeof rating !== "number" ||
            !image ||
            !description
        ) {

            return res.status(400).json({
                error: "Invalid item data"
            });
        }
        const newItem = {
            id: Date.now(),
            name,
            price,
            category,
            rating,
            image,
            description
        };
        items.push(newItem);
        writeItems(items);
        res.status(201).json(newItem);
    } catch {
        res.status(500).json({error: "Server error"});
    }
});

app.put("/api/items/:id", (req, res) => {
    try {
        const items = readItems();
        const index = items.findIndex(i => i.id === Number(req.params.id));
        if (index === -1) {
            return res.status(404).json({
                error: "Item not found"
            });
        }
        const {
            name,
            price,
            category,
            rating,
            image,
            description
        } = req.body;
        if (
            !name ||
            typeof price !== "number" ||
            !category ||
            typeof rating !== "number"
        ) {

            return res.status(400).json({
                error: "Invalid item data"
            });
        }
        items[index] = {
            id: Number(req.params.id),
            name,
            price,
            category,
            rating,
            image,
            description
        };
        writeItems(items);
        res.status(200).json(items[index]);

    } catch {
        res.status(500).json({
            error: "Server error"
        });
    }
});

app.delete("/api/items/:id", (req, res) => {
    try {
        const items = readItems();
        const index = items.findIndex(
            i => i.id === Number(req.params.id)
        );
        if (index === -1) {

            return res.status(404).json({
                error: "Item not found"
            });
        }
        const deleted = items.splice(index, 1);
        writeItems(items);
        res.status(200).json(deleted[0]);

    } catch {
        res.status(500).json({error: "Server error"});
    }
});

app.listen(PORT, () => {
    console.log(`
        Server running:
        http://localhost:${PORT}

        Swagger:
        http://localhost:${PORT}/api/docs
    `);
});