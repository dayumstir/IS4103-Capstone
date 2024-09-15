// Entry point of application, where server is started

import app from "./app";
import { connectDatabase } from "./config/database.config";
import { cleanupExpiredTokens } from "./utils/tokenCleanup";


const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Connect to the database
        await connectDatabase();

        // Cleanup expired tokens when the server starts
        await cleanupExpiredTokens();

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
};
    
startServer();
