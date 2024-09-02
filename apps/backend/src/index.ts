// Entry point of application, where server is started
// TODO: Add code to connect to the database when starting server.

import app from "./app";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
