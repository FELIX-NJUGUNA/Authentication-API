# Authentication API with JWT, Redis, and Supabase

This is a **Node.js** API that handles **user authentication** using **JWT (JSON Web Tokens)** for access and refresh tokens. It integrates with **Redis** for storing refresh tokens and **Supabase** for user management.

The API includes routes for **user registration**, **login**, **token refreshing**, and **logout**.

This API can be easily integrated into front-end applications like **Flutter**, **React**, or **Vue**.

## Features

- **JWT Authentication**: Secure login with access tokens and refresh tokens.
- **Supabase Integration**: User management using.
- **Redis**: Storing refresh tokens in Redis for quick access and validation.
- **Token Expiry**: Access tokens expire after 1 hour, and refresh tokens expire after 1 year.
- **Error Handling**: Graceful error handling for unauthorized access and internal errors.
- **Environment Variables**: Easily configurable using environment variables.

## Technologies Used

- **Node.js** for building the backend API.
- **JWT (JSON Web Tokens)** for secure authentication.
- **Redis** for storing refresh tokens.
- **Supabase** for user authentication and database management.

---

## API Endpoints

### 1. **Login**

#### `POST /auth/login`

This endpoint is used for **user login**. Upon successful login, it returns an **access token** and a **refresh token**.

**Request Body:**

```json
{
    "email": "user@example.com",
    "password": "password123"
} 
```
### 2. **Register**

#### `POST /auth/register`

This endpoint is used for **user resgitration**. Upon successful registration, it returns an **access token** and a **refresh token**.

**Request Body:**

```json
{
    "email": "newuser@example.com",
    "password": "password123"
}
```

### 3. **Refresh-token**

#### `POST /auth/refresh-token`

This endpoint is used to refresh an expired access token using a valid **refresh token**.

**Request Body:**

```json
{
    "refreshToken": "your-refresh-token-here"
}
```


### 4. **Logout**

#### `DELETE /auth/logout`

This endpoint is used to log out a user by invalidating the refresh token.

**Request Body:**
```
{
    "refreshToken": "your-refresh-token-here"
}
```

**Supabase Integration**

I have used Supabase for user management and you can set up Supabase with the following steps:

1. Go to Supabase and sign up for an account.
2. Once logged in, create a new project in Supabase and follow the setup instructions.
3. Go to the API section of your Supabase project to get the URL and anon/public key.

**Environmental Variables for Supabase and Redis**
.env File
```
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
ACCESS_TOKEN_SECRET=your-access-token-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password (optional)
```

**Installation**
1. Clone the repository
```
git clone https://github.com/your-username/auth-api.git
cd auth-api
```
2. Install dependecies
```
npm install
```
3. Set up environmental variables
```
Navigate to .env file or create yours in the root directory and edit the following:
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
ACCESS_TOKEN_SECRET=your-access-token-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password (optional)
```
4. Start the server
```
npm start

NB : The default it will run on http://localhost:3000
```




