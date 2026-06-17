/**
 * Joi validation middleware. Validates req.body against the given schema and
 * returns 400 with clear messages on failure. Strips unknown keys.
 */
export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true })
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((d) => d.message),
      })
    }
    req.body = value
    next()
  }
}
