const z = require('zod')

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be an string.',
    required_error: 'Movie title is required.'
  }),
  year: z
    .number({
      invalid_type_error: 'Movie year must be an positivi integer.',
      required_error: 'Movie year is required.'
    })
    .int()
    .min(1900)
    .max(2024),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().positive().min(0).max(10).optional(),
  poster: z
    .string()
    .url({
      message: 'Poster must have a valid URL.'
    })
    .endsWith('.jpg'),
  //* Ambos son validos
  // genre: z.array(
  //   z.enum([
  //     'Action',
  //     'Sci-Fi',
  //     'Drama',
  //     'Crime',
  //     'Adventure',
  //     'Romance',
  //     'Animation',
  //     'Biography',
  //     'Fantasy'
  //   ])
  // )
  genre: z
    .enum(
      [
        'Action',
        'Sci-Fi',
        'Drama',
        'Crime',
        'Adventure',
        'Romance',
        'Animation',
        'Biography',
        'Fantasy',
        'Terror'
      ],
      {
        invalid_type_error: 'Genre must be valid.',
        required_error: 'Genre is required.'
      }
    )
    .array()
})

function validateMovie(object) {
  return movieSchema.safeParse(object)
}

//* Hace todas las propiedades opcionales, de modo que solo valida
//* las presentes en el objeto enviado por parametro
function validatePartialMovie(object) {
  return movieSchema.partial().safeParse(object)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
