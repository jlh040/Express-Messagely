### Express Message.ly

#### Functionality

- This application is a fully secure JSON API that I have created. It utilized JSON Web Tokens and the Bcrypt package to provide authentication and authorization for all endpoints. The API itself can be used to send private messages to other registered users.

- ##### **Routes (all data must be sent as JSON):**

  - **POST /auth/login**
    - Requires {username, password} and returns a JWT.
  - **POST /auth/register**
    - Requires {username, password, first_name, last_name, phone} and returns a JWT.
  - **GET /messages/:id**
    - Requires a JWT in the body of the request under the property of *_token*
    - Allows the user to view details of a message
  - **POST /messages**
    - Requires a JWT in the body of the request under the property of *_token*
    - Requires {to_username, body}
    - Allows the user to send a message.
  - **POST /messages/:id/read**
    - Requires a JWT from the recipient of the message under the property of *_token*
    - Allows the recipient of the message to mark the message as read.
  - **GET /users**
    - Requires a JWT in the body of the request under the property of *_token*
    - Allows the user to get a list of all users
  - **GET /users/:username**
    - Requires a JWT in the body of the request under the property of *_token*
    - Note that this JWT must come from the **:username** user
    - Allows a user to view their details
  - **GET /users/:username/to**
    - Requires a JWT in the body of the request under the property of *_token*
    - Note that the JWT must come from the **:username** user
    - Allows a user to view all messages sent to them
  - **GET /users/:username/from**
    - Requires a JWT in the body of the request under the property of *_token*
    - Note that the JWT must come from the **:username** user
    - Allows a user to view all messages that they've sent

### How-to:

- To get this code onto your machine, run `git clone https://github.com/jlh040/Express-Messagely.git` in your terminal and `cd` into the root directory.
- Then, assuming you have [Node](https://nodejs.org/en/) installed, run `npm install` to download all of the packages for this application.
- Next, download [PostgreSQL](https://www.postgresql.org/) if you don't already have it, and then run `createdb messagely` to create the database for the app.
- Then run `psql < data.sql` to seed the *messagely* database.
- Run `node server.js` to start the server, and then register to start sending messages.

