//Middleware error handler

const errorHandler = (err, req, res, next) => {

        console.log(err);

        if(err.name === "ErrorNotFound") {
            res.status(404).json({message: "Error Not Found"})
        } else if(err.name === "InvalidCredentials") {
            res.status(400).json({message: "invalid email or password"})
        } else if(err.name === "Unaunthenticated") {
            res.status(400).json({message: "Unaunthenticated"})
        } else if(err.name === "unauthorize") {
            res.status(401).json({message: "unauthorize"})
        }

            
        else {
            res.status(500).json({message: "Internal Server Error"})
        }
}

module.exports = errorHandler;