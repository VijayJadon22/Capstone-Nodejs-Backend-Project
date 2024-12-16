export const sendToken = async (user, res, statusCode) => {
    try {
        // Generate the JWT token for the user
        const token = user.getJWTToken();
        if (!token) {
            console.log("Token error");
        }

        // Set cookie options including expiration and httpOnly flag
        const cookieOptions = {
            expires: new Date(
                Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 // Convert days to milliseconds
            ),
            httpOnly: true, // Ensures the cookie is not accessible via JavaScript on the client side
        };

        // Send the response with status code, set the cookie, and include user and token in the JSON response
        res
            .status(statusCode)
            .cookie("token", token, cookieOptions) // Set the cookie with the token
            .json({ success: true, user, token }); // Send JSON response with success status, user data, and token
    } catch (error) {
        console.log("Error: ", error);
    }

};

