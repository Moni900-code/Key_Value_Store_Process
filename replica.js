const express = require("express");

const app = express();
app.use(express.json());

let store = {}; // in-memory store
let versions = {}; // versioning
let isPrimary = false; // start as replica

// Replication API
app.post("/replicate", (req, res) => {
    const { key, value, version } = req.body;
    if (!key || value === undefined || version === undefined) {
        return res.status(400).json({ error: "Key, value, and version required" });
    }

    if (!versions[key] || version > versions[key]) {
        versions[key] = version;
        store[key] = { value, version };
    }

    res.json({ message: "Replicated successfully" });
});

// Promotion API (promote as primary server)
app.post("/promote", (req, res) => {
    isPrimary = true;
    console.log("This replica is now the primary server.");
    res.status(200).send({ message: "Promoted to primary" });
});

// Key-Value retrive API
app.get("/get/:key", (req, res) => {
    if (!store[req.params.key]) {
        return res.status(404).json({ error: "Key not found" });
    }

    res.json({ key: req.params.key, value: store[req.params.key].value, version: store[req.params.key].version });
});

// start replica server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Replica server running on port ${PORT}`);
});
