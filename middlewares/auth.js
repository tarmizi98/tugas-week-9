const {verifyToken} = require("../lib/jwt.js")
const pool = require("../config/config.js")

const authentication = async (req, res, next) => {

    try {
        if(!req.headers.authorization) {
            throw {name: "Unaunthenticated"}
        }
        const accessToken = req.headers.authorization.split(" ")[1]

        //decoded token
        const {id, email, gender, role} = verifyToken(accessToken)
        const findQuery = `
            SELECT
                *
            FROM users
                WHERE email = $1 AND
                    id = $2

        `

        const result = await pool.query(findQuery, [email, id])
        console.log(result, id, email)
        if(result.rows.length === 0) {
            throw {name: 'Unaunthenticated'}
        } else {

            //berhasil ter authentikasi
            const foundUser = result.rows[0]
            //costum properti
            req.loggedUser = {
                id: foundUser.id,
                email: foundUser.email,
                gender: foundUser.gender,
                role: foundUser.role
            }

            //lanjut ke middleware
            next()
        }
    } catch(err) {
        next(err)
    }
}

const authorization = (req, res, next) => {
    try {
        
        const {role} = req.loggedUser

        if(role === "admin") {
            next()
        } else {
            throw{name: "unauthorize"}
        }
    } catch(err) {
        next(err)
    }
}

module.exports = {
    authentication,
    authorization
}