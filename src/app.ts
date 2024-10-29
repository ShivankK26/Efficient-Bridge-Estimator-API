import Elysia from "elysia";
import bridgeRoutes from "./routes";

const app = new Elysia();
bridgeRoutes(app);

const PORT = process.env.PORT || 3000;

app.listen({
  port: PORT,
  idleTimeout: 50,
}, () => console.log(`Server running on port ${PORT}`));
