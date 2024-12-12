import server from "./app.js";

const serverStart = server.listen(process.env.PORT, (err) => {
    if (err) {
        console.log(`server failed with error ${err}`);
    } else {
        console.log(`server is running at http://localhost:${process.env.PORT}`);
    }
});