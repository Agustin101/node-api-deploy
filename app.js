const express = require('express')
const app = express()
const port = process.env.PORT ?? 3000
let movies = require('./movies.json')
const crypto = require('node:crypto')
const { validateMovie, validatePartialMovie } = require('./schemas/movie.js')
const cors = require('cors')

app.disable('x-powered-by')
app.use(express.json())

const options = {
  origin: function (origin, callback) {
    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
      callback(null, origin)
    } else {
      callback(new Error('Method not allowed.'))
    }
  },
  methods: ['GET', 'PUT', 'DELETE']
}

// app.use(cors(options))

//* urls que pueden solicitar datos.
const ACCEPTED_ORIGINS = ['http://127.0.0.1:5500']

// app.options('/movies/:id', cors(), (req, res) => {
//   const origin = req.header('origin')
//   //* tener en cuenta que cuando es del mismo irgen, la cabecera no viaja...
//   if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
//     res.setHeader('Access-Control-Allow-Origin', origin)
//     res.setHeader(
//       'Access-Control-Allow-Methods',
//       'GET, POST, PATCH, PUT, DELETE'
//     )
//   }
//   res.sendStatus(200)
// })

app.options('/movies/:id', cors(options))

app.get('/movies', (req, res) => {
  // const origin = req.header('origin')
  // //* tener en cuenta que cuando es del mismo irgen, la cabecera no viaja...

  // if (ACCEPTED_ORIGINS.includes(origin)) {
  //   res.setHeader('Access-Control-Allow-Origin', origin)
  // }

  console.log(res.getHeaders())

  const { genre, duration } = req.query
  let filteredMovies = movies

  if (genre)
    filteredMovies = movies.filter((movie) =>
      movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
    )

  console.log(duration)
  if (duration) {
    filteredMovies = filteredMovies.filter(
      (movie) => movie.duration >= Number(duration)
    )
  }

  res.status(200).json(filteredMovies)
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find((movie) => movie.id === id)

  if (!movie) res.status(400).json({ message: 'Not found.' })

  res.status(200).json(movie)
})

app.delete('/movies/:id', cors(options), (req, res) => {
  console.log(res.getHeaders())
  // const origin = req.header('origin')

  // if (ACCEPTED_ORIGINS.includes(origin)) {
  //   res.setHeader('Access-Control-Allow-Origin', origin)
  // }

  const { id } = req.params
  const movieIndex = movies.findIndex((movie) => movie.id === id)

  if (movieIndex === -1) return res.status(400).json({ message: 'Not found.' })

  movies.splice(movieIndex, 1)

  res.status(200).json({ success: true })
})

app.post('/movies', (req, res) => {
  const validationResult = validateMovie(req.body)

  if (validationResult.error) {
    return res.status(400).json({
      message: JSON.parse(validationResult.error.message)
    })
  }

  validationResult.id = crypto.randomUUID()
  movies.push(validationResult.data)

  res.status(201).json(movies[movies.length - 1])
})

app.patch('/movies/:id', (req, res) => {
  const movieId = req.params.id
  let movieToModify = movies.find((movie) => movie.id === movieId)

  if (movieToModify === undefined) {
    return res.status(404).json({
      message: 'Movie not found.'
    })
  }

  const validationResult = validatePartialMovie(req.body)

  if (!validationResult.success) {
    return res.status(400).json({
      error: JSON.parse(validationResult.error.message)
    })
  }

  movieToModify = {
    ...movieToModify,
    ...validationResult.data
  }

  res.status(201).json(movieToModify)
})

app.use((req, res) => {
  res.status(404).json({ message: 'Not found.' })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
