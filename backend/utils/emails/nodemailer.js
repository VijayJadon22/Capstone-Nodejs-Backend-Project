import nodemailer from "nodemailer";

export const sendWelcomeEmail = async (user) => {
    // Create a transporter object
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.Email,
            pass: process.env.Email_Key
        }
    });

    // Define the email options
    const mailOptions = {
        from: process.env.Email,
        to: user.email,
        subject: "Welcome to our service",
        text: `Hello ${user.name}, welcome to our service! We're excited to have you on board.`, // Plain text body 
        html: `<p>Hello <strong>${user.name}</strong>,</p><p>Welcome to our service! We're excited to have you on board.</p>`,
    }

    // Send the email
    await transporter.sendMail(mailOptions);
}



