const express = require('express');
const createError = require('http-errors');
const supabase = require('../helpers/init_supabase'); // Import supabase client
const router = express.Router();
const { authSchema  }  = require('../helpers/validation_schema')

// Registration Route
router.post('/register', async (req, res, next) => {
  try {
    //const { email, password } = req.body;
    // validation schema JOI
     const result = await authSchema.validateAsync(req.body)

    if (!result.email || !result.password) {
      return next(createError.BadRequest('Email and password are required'));
    }



    // Check if user already exists in the 'users' table
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', result.email);

    if (fetchError) {
      console.error("Error checking existing user:", fetchError);
      return next(createError.InternalServerError(fetchError.message));
    }
    
   
     

    if (existingUser && existingUser.length > 0) {
      return next(createError.Conflict(`${result.email} is already registered`));
    }

    // Insert the new user (plain text password for now)
    const { data, error: insertError } = await supabase
      .from('users')
      .insert([{email, password }]);

    // Check for insert errors
    if (insertError) {
      console.error("Error inserting user:", insertError);  // Log the insert error
      return next(createError.InternalServerError(insertError.message));
    }

    // Ensure the insert operation returns valid data (even if it might be empty)
    if (!data || data.length === 0) {
      console.error("User creation failed, no data returned:", data);
      return next(createError.InternalServerError('Failed to create user.'));
    }

    // Successfully created user, respond with the user data
    res.status(201).send({ message: 'User created successfully', user: data[0] });
  } catch (error) {
    // JOI Error
    if(error.isJoi == true) error.status = 420

    console.error("Unexpected error:", error);  // Log any unexpected errors
    next(error); // Pass the error to the global error handler
  }
});


// Login Route
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createError.BadRequest('Email and password are required'));
    }

    // Fetch user data from the 'users' table
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();  // Assumes only one user will be found with the given email

    if (fetchError || !user) {
      return next(createError.Unauthorized('Invalid credentials'));
    }

    // Check if the password matches (plain text comparison)
    if (user.password !== password) {
      return next(createError.Unauthorized('Invalid credentials'));
    }

    // Respond with the user data (no JWT)
    res.status(200).send({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
      }
    });
  } catch (error) {
    next(error); // Pass the error to the global error handler
  }
});




router.post('/refresh-token', async (req, res, next) => {
  res.send("Refresh token route");
});


router.delete('/logout', async (req, res, next) => {
  res.send("Logout route");
});


module.exports = router;