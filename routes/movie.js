const express = require("express");
const router = express.Router()
const pool = require("../config/config.js")
const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const {authorization, authentication} = require("../middlewares/auth.js");
const { randomNumberId } = require("../utils/common.js");

router.use(authentication)

router.get("/", async (req, res, next) => {
    try {
        let {page, limit} = req.query
        const findQuery = `
        SELECT
            *
        FROM movies
            LIMIT $1 OFFSET $2
    `
    page = +page || DEFAULT_PAGE
    limit = +limit || DEFAULT_LIMIT
    let itemPerPage = (page - 1) * limit

    const result = await pool.query(findQuery, [limit, itemPerPage]);

    const countQuery = `
        SELECT
            COUNT(*)
        FROM movies
    `

    let totalData = await pool.query(countQuery)
    totalData = +totalData.rows[0].count

    let totalPages = Math.ceil(totalData / limit)
    
    let next = page < totalPages ? (page + 1) : null
    let previous = page > 1 ? (page - 1) : null
     


    res.status(200).json({
        data: result.rows,
        totalPages,
        totalData,
        CurrentPage: page,
        next, 
        previous
    })
    } catch(err) {
        next(err)
    }
    
})

router.get("/:id", async (req, res, next) => {
    try {
        const {id} = req.params

        const findQuery = `
            SELECT
                *
            FROM movies
                WHERE id = $1
        `

        const result = await pool.query(findQuery, [id])
        if(result.rows.length === 0) {
            throw {name: "ErrorNotFound"}
        } else {
            res.status(200).json(result.rows[0])
        }
    } catch(err) {
        next(err)
    }
})

//insert
router.post("/",authorization, async (req, res, next) => {
    try {
        const {title, genres, year} = req.body
        const insertQuery = `
            INSERT INTO movies(id, title, genres, year)
                VALUES
                    ($1, $2, $3, $4)
            RETURNING *
        `

        //insert movies
        const result = await pool.query(insertQuery, [randomNumberId(), title, genres, year])
        

        res.status(201).json({message: "product created succes fully"})
        const createdMovies = result.rows[0]



    } catch(err) {
        next(err)
    }
    


})


//update movie

router.put("/:id",authorization, async (req, res, next) => {
    try {
         const {title} = req.body
         const {id} = req.params
         
         const updateQuery = `
            UPDATE movies
                SET title = $1
            WHERE id = $2
            RETURNING *
         `

         const result = await pool.query(updateQuery, [title, id])

         if(result.rows.length === 0) {
            throw {name: "error not found"}
         } else {
            res.status(200).json({message: "update data succesfully"})
         }

         
    } catch(err) {
        next(err)
    }
})

//delete product

router.delete("/:id", authorization, async (req, res, next) => {

    try {
        const {id} = req.params

        const deleteQuery = `
            DELETE FROM movies
            WHERE id = $1
            RETURNING *
        `
        const result = await pool.query(deleteQuery, [id])

        if(result.rows.length === 0) {
            throw {name: "error not found"}
        } else {
            res.status(200).json({message: "data delete succes fully"})
        }
    } catch(err) {
        next(err)
    }

})

module.exports = router;