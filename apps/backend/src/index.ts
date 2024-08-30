// Entry point of application, where server is started

import { createServer } from "./app";

const port = process.env.PORT || 3001;
const server = createServer();

server.listen(port, () => {
  console.log(`api running on ${port}`);
});
