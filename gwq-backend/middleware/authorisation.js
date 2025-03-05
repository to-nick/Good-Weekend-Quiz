const jwt = require('jsonwebtoken');

function authorisation(req, res, next){
    console.log("Headers Received:", req.headers);
    const JWT = req.headers.authorization;

    console.log(JWT)

    if(!JWT){
        res.status(401).json({
            error: true,
            message: 'No bearer token in authorisation header. Access denied.'
        })
        return;
    } else if (JWT){
        const token = JWT.split(' ')[1];
        console.log(token);

        try{
            const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decodedPayload;
            console.log('Authorization confirmed')
            next();
        } catch (error){
            if (error.name === "TokenExpiredError"){
                res.status(401).json({
                    error: true,
                    message: "JWT has expired"
                })
                return;
            } else {
                res.status(401).json({
                    error: true,
                    message: "Invalid JWT",
                    details: error
                })
            }
        }
    }
}

module.exports = authorisation;