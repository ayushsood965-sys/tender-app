const mongoose = require("mongoose");

const ATLAS_URI = "mongodb+srv://scholarSync:Ayush1994*@scholarsync.koqce0q.mongodb.net/tender-app?retryWrites=true&w=majority";
const COOLIFY_URI = "mongodb://root:Ayush1994*@169.58.12.127:27017/tender-app?directConnection=true&authSource=admin";

async function migrate() {
    console.log("=== STARTING DATA MIGRATION: ATLAS -> COOLIFY LOCAL MONGO ===");

    // 1. Connect to Atlas (Source)
    const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log(" Connected to Source (MongoDB Atlas)");

    // 2. Connect to Coolify Local Mongo (Target)
    const localConn = await mongoose.createConnection(COOLIFY_URI).asPromise();
    console.log(" Connected to Target (Coolify Local MongoDB: tender-app)");

    const collections = ["users", "categories", "terms", "tenders", "saveddocuments"];

    for (const collName of collections) {
        try {
            const sourceColl = atlasConn.collection(collName);
            const targetColl = localConn.collection(collName);

            const docs = await sourceColl.find({}).toArray();
            console.log(`\n Migrating [${collName}]: Found ${docs.length} documents in Atlas...`);

            if (docs.length > 0) {
                await targetColl.deleteMany({});
                const insertResult = await targetColl.insertMany(docs);
                console.log(`    Successfully copied ${insertResult.insertedCount} documents into Coolify DB!`);
            } else {
                console.log(`   ⚪ 0 documents found in [${collName}], skipping insert.`);
            }

            const targetCount = await targetColl.countDocuments({});
            console.log(`    Verification count in Coolify [${collName}]: ${targetCount}`);
        } catch (err) {
            console.error(`❌ Error migrating collection [${collName}]:`, err.message);
        }
    }

    await atlasConn.close();
    await localConn.close();
    console.log("\n=== DATA MIGRATION COMPLETED SUCCESSFULLY! ===");
}

migrate()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("Migration failed:", err);
        process.exit(1);
    });
