import nodemailer from "nodemailer";

export const sendEmail = async (user, action = "welcome", resetToken = null) => {
    // Create a transporter object
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.Email,
            pass: process.env.Email_Key
        }
    });

    // Define the email options
    let mailOptions;

    if (action == "welcome") {
        mailOptions = {
            from: process.env.Email,
            to: user.email,
            subject: "Welcome to our service",
            text: `Hello ${user.name}, welcome to our service! We're excited to have you on board.`, // Plain text body 
            html: `<img src="http://localhost:5000/path/to/logo1-32230.png" style="width: 150px;" alt="Storefleet Logo">
            <h1>Welcome to Storefleet</h1>
            <p>Hello, ${user.name}</p>
            <p>Thank you for registering with Storefleet. We're excited to have you as a new member of our community.</p>
            <a href="http://localhost:5000/get-started" style="display: inline-block; padding: 10px 20px; background-color: rgb(37, 112, 233); color: white; text-decoration: none; border-radius: 5px;">Get started</a>`
        };
    } else if (action == "resetPassword") {
        mailOptions = {
            from: process.env.Email,
            to: user.email,
            subject: "Password Reset Request",
            text: `Hello ${user.name},\n\nYou requested a password reset. Please use the following link to reset your password:\n\nresetUrl\n\nIf you did not request this, please ignore this email.`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Hello ${user.name},</h2>
                    <p>Enter this token to complete the reset : ${resetToken}</p>
                </div>
            `
        };
    }
    
    

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Mail sent");
}



