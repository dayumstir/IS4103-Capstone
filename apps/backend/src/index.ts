// Entry point of application, where server is started

import app from "./app";
import { connectDatabase } from "./config/database.config";

const PORT = process.env.PORT || 3000;

connectDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err => {
        console.error('Failed to connect to the database', err);
    }))
    