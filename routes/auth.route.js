const express = require('express');
const createError = require('http-errors');
const supabase = require('../helpers/init_supabase'); // Import supabase client
const router = express.Router();
const bcrypt =  require('bcrypt')
const { authSchema  }  = require('../helpers/validation_schema')
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helpers/jwt_helper');
const { token } = require('morgan');

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


    // hash the password
    const hashedPassword = await bcrypt.hash(result.password, 10)

    // Insert the new user 
    const { data, error: insertError } = await supabase
      .from('users')
      .insert([{email: result.email, password: hashedPassword }]);

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

    // generate access token JWT
    const accesstoken = await signAccessToken(data[0].id)
    const refreshtoken = await signRefreshToken(data[0].id)

    // Successfully created user, respond with the user data
    res.status(201).send({ message: 'User created successfully', 
      
      user: {
        id: data[0].id,
        email: data[0].email,
      },
      accesstoken,
      refreshtoken
    
    });
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
    // validation schema JOI
    const result = await authSchema.validateAsync(req.body)

    if (!result.email || !result.password) {
      return next(createError.BadRequest('Email and password are required'));
    }

   
    // Fetch user data from the 'users' table
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', result.email)
      .single();  // Assumes only one user will be found with the given email


    if(!user) throw createError.NotFound("User not registered")

    if (fetchError || !user) {
      return next(createError.Unauthorized('Invalid credentials'));
    }

    // Check if the password matches 
    const isPasswordValid = await bcrypt.compare(result.password, user.password)
    if (!isPasswordValid) {
      return next(createError.Unauthorized('Invalid credentials'));
    }


    const accesstoken = await signAccessToken(user.id)
    const refreshtoken = await signRefreshToken(user.id)
    

    // Respond with the user data 
    res.status(200).send({
      message: 'Login successful',
      // user: {
      //   id: user.id,
      //   email: user.email,
      // },
      accesstoken,
      refreshtoken
    });
  } catch (error) {
    if(error.isJoi === true) return next(createError.BadRequest("Invalid Username/Password"))
    next(error); 
  }
});




router.post('/refresh-token', async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if(!refreshToken) throw createError.BadRequest()
    const userId = await verifyRefreshToken(refreshToken)

    const accessToken = await signAccessToken(userId)
    const refreshTkn = await signRefreshToken(userId)
    res.send({ accessToken, refreshTkn})
    

  } catch (error) {
    next(error)
  }
});


router.delete('/logout', async (req, res, next) => {
  res.send("Logout route");
});


module.exports = router;