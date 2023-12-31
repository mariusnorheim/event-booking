import { app } from './app';
// import { connect } from 'mongoose';
// import { DatabaseConnectionError } from '@tick-it/common';
// import { natsWrapper } from './nats-wrapper';
// import { OrderCreatedListener } from './events/listeners/order-created-listener';
// import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
/**
 * Function that starts the server.
 */
const start = async () => {
  // Startup message
  console.log('Tickets service starting up...');

  /**
   * Check evironment variables
   */
  // if (!process.env.JWT_KEY) {
  //   throw new Error('JWT_KEY env variable not defined');
  // }

  const port = 3000;
  app.listen(port, () =>
    console.log(`Tickets service listening on port ${port}...`)
  );

  // try {
  // } catch (error) {
  //   throw new DatabaseConnectionError();
  // } finally {
  //   const port = 3000;
  //   app.listen(port, () =>
  //     console.log(`(Tickets) Listening on port ${port}...`)
  //   );
  // }
};

start();