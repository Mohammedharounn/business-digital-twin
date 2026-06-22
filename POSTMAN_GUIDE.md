# Connectivity & Testing Guide

This guide explains how to connect your application to a real MongoDB instance and how to use Postman to test the authentication system.

## 1. Connecting to Real MongoDB

By default, the application uses an **In-Memory MongoDB** for zero-config development. To connect to your local or cloud MongoDB:

1.  Open `server/.env`.
2.  Update `MONGODB_URI` with your connection string:
    *   **Local**: `mongodb://localhost:27017/business_digital_twin`
    *   **Atlas**: `mongodb+srv://<user>:<password>@cluster.mongodb.net/business_digital_twin`
3.  Change `USE_REAL_MONGO` to `true`:
    ```env
    USE_REAL_MONGO=true
    ```
4.  Restart the server: `npm run server`.

## 2. Setting up Postman

I have generated a Postman collection file: `Business_Digital_Twin_Auth.postman_collection.json`.

### Steps to Import:
1.  Open Postman.
2.  Click the **Import** button (top left).
3.  Drag and drop the `Business_Digital_Twin_Auth.postman_collection.json` file into Postman.
4.  A new collection named **Business Digital Twin Auth** will appear.

### How to Test:
1.  **Signup**: Run the `Signup` request to create your first user.
2.  **Login**: Run the `Login` request.
    *   **Automation**: The "Tests" script in this request will automatically save the `accessToken` to your Postman environment.
3.  **Get Me**: Run this request to verify your profile. It uses the `{{access_token}}` variable automatically.
4.  **Refresh Token**: Run this when your access token expires. It will update the `{{access_token}}` automatically.
    *   *Note: This works because Postman handles cookies automatically (where the Refresh Token is stored).*

### Security Features to Observe:
*   **HttpOnly Cookies**: Look at the "Cookies" tab in Postman after login; you'll see the `refreshToken`.
*   **Rotation**: Every time you call `/refresh`, a new cookie is issued and the old one is invalidated.
*   **Rate Limiting**: Try running the login request 10 times quickly to see the 429 "Too many attempts" error.
