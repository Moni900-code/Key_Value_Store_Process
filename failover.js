const axios = require("axios");

const primaryServerURL = "http://localhost:5000"; 
const replicas = ["http://localhost:5001", "http://localhost:5002"]; 

async function promoteReplica(replicaURL) {
    try {
        console.log(`Attempting to promote ${replicaURL} to primary...`);
        const response = await axios.post(`${replicaURL}/promote`);
        if (response.status === 200) {
            console.log(`Successfully promoted ${replicaURL}`);
        }
    } catch (error) {
        console.error(`Failed to promote ${replicaURL}:`, error.message);
    }
}

async function checkPrimary() {
    try {
        await axios.get(primaryServerURL);
        console.log("Primary server is running");
    } catch (error) {
        console.log("Primary server failed. Attempting failover...");
        for (const replica of replicas) {
            await promoteReplica(replica);
        }
    }
}

// check primary server after 5 sec
setInterval(checkPrimary, 5000);
