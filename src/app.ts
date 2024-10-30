/**
 * @file app.ts
 * @description Initializes and configures the Elysia server, including routes and server settings.
 * Imports routes and applies them to the main application instance.
 */

import Elysia from 'elysia';
import bridgeRoutes from './routes';

/**
 * Creates a new instance of the Elysia server.
 */
const app = new Elysia();

/**
 * Applies all the routes to the server instance.
 * @function bridgeRoutes
 * @param {object} app - The Elysia server instance.
 */
bridgeRoutes(app);

/**
 * Defines the port for the server to listen on.
 * If no environment variable is set for PORT, it defaults to 3000.
 */
const PORT = process.env.PORT || 3000;

/**
 * Starts the server and listens on the specified port.
 * The idle timeout is set to 50ms.
 * A console message indicates the server is running.
 */
app.listen(
  {
    port: PORT,
    idleTimeout: 50, // You can adjust this as needed.
  },
  () => console.log(`Server running on port ${PORT}`)
);