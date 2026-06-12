// api/sync.js
const processedUUIDs = new Set();

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        try {
            const offlineRecords = req.body;
            if (!Array.isArray(offlineRecords)) {
                return res.status(400).json({ success: false, error: "Data format must be an Array." });
            }

            const successfullySyncedIds = [];
            offlineRecords.forEach(record => {
                if (!processedUUIDs.has(record.id)) {
                    processedUUIDs.add(record.id);
                    successfullySyncedIds.push(record.id);
                } else {
                    successfullySyncedIds.push(record.id);
                }
            });

            return res.status(200).json({ success: true, message: "Sync Successful", syncedIds: successfullySyncedIds });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    return res.status(405).json({ error: "Method Not Allowed" });
};