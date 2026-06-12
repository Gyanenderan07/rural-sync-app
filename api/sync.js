// api/sync.js

// In-memory set to prevent duplicates (Idempotency Key Check)
// Note: Real apps-la Redis or MongoDB global variable storage use pannanum.
const processedUUIDs = new Set();

module.exports = async (req, res) => {
    // 1. Handle CORS (Cross-Origin Resource Sharing) Security Settings
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Pre-flight request check
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 2. Only allow POST Request for Syncing Data
    if (req.method === 'POST') {
        try {
            const offlineRecords = req.body;

            if (!Array.isArray(offlineRecords)) {
                return res.status(400).json({ success: false, error: "Data format must be an Array." });
            }

            console.log(`📥 Vercel function received ${offlineRecords.length} records.`);
            const successfullySyncedIds = [];

            offlineRecords.forEach(record => {
                // IDEMPOTENCY CHECK: If ID is unique, process it
                if (!processedUUIDs.has(record.id)) {
                    processedUUIDs.add(record.id);
                    
                    // REAL-WORLD DEPLOYMENT NOTE:
                    // Inga thaan neenga unga cloud database insert logic (MongoDB/Postgres) ezhuthanum.
                    console.log(`✅ Stored Row ID: ${record.id} | Data: ${record.reportData}`);
                    successfullySyncedIds.push(record.id);
                } else {
                    // If already processed, directly acknowledge to client to clear local queue
                    console.log(`⚠️ Duplicate skipped: ${record.id}`);
                    successfullySyncedIds.push(record.id);
                }
            });

            return res.status(200).json({ 
                success: true, 
                message: "Sync Successful", 
                syncedIds: successfullySyncedIds 
            });

        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    // If any other method like GET is requested
    return res.status(405).json({ error: "Method Not Allowed" });
};