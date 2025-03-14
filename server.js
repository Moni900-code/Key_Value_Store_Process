const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
let store = {}; //in-memory store
let versions = {}; // versioning

const replicas = ["http://localhost:5001", "http://localhost:5002"]; // replica server list

// Key-Value set API
app.post("/set", async (req, res) => {
    const { key, value } = req.body;
    if (!key || value === undefined) {
        return res.status(400).json({ error: "Key and value required" });
    }

    versions[key] = (versions[key] || 0) + 1;
    store[key] = { value, version: versions[key] };

    // update replica server
    for (const replica of replicas) {
        try {
            await axios.post(`${replica}/replicate`, { key, value, version: versions[key] });
        } catch (err) {
            console.error(`Failed to replicate to ${replica}`);
        }
    }

    res.json({ message: "Stored successfully", key, version: versions[key] });
});

// Key-Value retrive API
app.get("/get/:key", (req, res) => {
    const key = req.params.key;
    if (!store[key]) {
        return res.status(404).json({ error: "Key not found" });
    }

    res.json({ key, value: store[key].value, version: store[key].version });
});
//key-value delete
app.delete("/delete/:key", (req, res) => {
    const key = req.params.key;
    if (!store[key]) {
        return res.status(404).json({ error: "Key not found" });
    }

    delete store[key];
    delete versions[key];

    res.json({ message: "Deleted successfully", key });
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Primary server running on port ${PORT}`);
});
