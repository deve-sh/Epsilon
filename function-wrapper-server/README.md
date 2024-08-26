# Epsilon - Cloud Functions Wrapper Server

Provides the wrapper functionality around the user's Express controller implementation.

Also takes care of setting up logging interceptors and passing them to the VM's core logging API for sending to the Cloud.

#### Todo

- [ ] Convert this into a package runnable via the CLI locally
- [ ] Add a provision that the Cloud Builder can import this repository along with the user's code and build this into a Docker container and run `npm start` to listen on port 8080.