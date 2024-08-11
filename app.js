const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

app.get('/movies/', async (request, response) => {
  const getMovies = `
    SELECT 
    movie_name as movieName
    FROM
    movie;`

  const moviesRow = await db.all(getMovies)
  response.send(moviesRow)
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const addMovie = `INSERT INTO movie(director_id, movie_name,lead_actor)
  VALUES (${directorId},'${movieName}','${leadActor}');`

  await db.run(addMovie)

  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovie = `
  SELECT
  *
  FROM
  movie
  WHERE movie_id = ${movieId};`

  const moviedet = await db.get(getMovie)

  response.send(moviedet)
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body

  const updateMovie = `
  UPDATE
  movie
  SET
  director_id = ${directorId},
  movie_name = '${movieName}',
  lead_actor = '${leadActor}'
  
  WHERE
  movie_id = ${movieId};`

  await db.run(updateMovie)

  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const deleteBook = `
  DELETE FROM
  movie
  WHERE 
  movie_id = ${movieId};`

  await db.run(deleteBook)

  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const getDirectors = `
  SELECT
  *
  FROM director;`

  const Directors = await db.all(getDirectors)

  response.send(Directors)
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params

  const getMovies = `
  SELECT
  * FROM
  director
  WHERE
  director_id = ${directorId};`

  const list = await db.all(getMovies)

  response.send(list)
})

app.use(express.json())
module.exports = app
