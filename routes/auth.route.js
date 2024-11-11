const express = require('express');
const createError = require('http-errors');
const supabase = require('../helpers/init_supabase'); // Import the Supabase client

const router = express.Router();

// Registration Route: Create a new user
router.post('/register', async (req, res, next) => {
  try {
    // Extracting the email and password from the request body
    const { email, password } = req.body;

    // Validate if email and password are provided
    if (!email || !password) {
      throw createError.BadRequest('Email and password are required');
    }

    // Check if the user already exists in Supabase
    const { data, error } = await supabase
      .from('users')  // Assuming 'users' is the table for your user data
      .select('*')
      .eq('email', email)  // Check if email already exists
      .single(); // Get only one result

    if (error && error.code !== 'PGRST116') {  // Ignore error if no data is found
      throw new Error(error.message);
    }

    if (data) {
      // If a user with this email already exists, return a conflict error
      return next(createError.Conflict(`${email} is already registered`));
    }

    
    // Create the new user in the 'users' table (without hashing password for now)
    const { data: newUser, error: insertError } = await supabase.
      from('users')
      .insert([
      { email, password }  // Save password as is for now (not hashed)
      ])
       .single();
    

    if (insertError) {
      throw new Error(insertError.message);
    }

    // Return the created user (exclude sensitive data like password)
    res.status(201).json({
      message: 'User registered successfully',
      user: { email: newUser.email, id: newUser.id },
    });

  } catch (error) {
    next(error);  // Pass the error to the global error handler
  }
});

// Login Route: User login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate if email and password are provided
    if (!email || !password) {
      throw createError.BadRequest('Email and password are required');
    }

    // Retrieve user from Supabase
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return next(createError(401, 'Invalid email or password'));
    }

    // Check if password matches (you should hash passwords in production)
    if (data.password !== password) {
      return next(createError(401, 'Invalid email or password'));
    }

    // Return successful login (you might want to add token-based authentication here)
    res.status(200).json({
      message: 'Login successful',
      user: { email: data.email, id: data.id },
    });

  } catch (error) {
    next(error);  // Pass the error to the global error handler
  }
});

// Refresh Token Route (this is usually used with JWT, we can leave it empty for now)
router.post('/refresh-token', async (req, res, next) => {
  res.send("Refresh token route");
});

// Logout Route (Usually would be used for token invalidation, leave it empty for now)
router.delete('/logout', async (req, res, next) => {
  res.send("Logout route");
});

module.exports = router;
