import Joi from 'joi'

const objectId = Joi.string().hex().length(24)

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
})

export const projectCreateSchema = Joi.object({
  name: Joi.string().min(1).max(120).required(),
  description: Joi.string().allow('').max(2000),
})

export const projectUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(120),
  description: Joi.string().allow('').max(2000),
}).min(1)

export const taskCreateSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow('').max(2000),
  status: Joi.string().valid('todo', 'in-progress', 'done').default('todo'),
  projectId: objectId.required(),
  assignedTo: objectId.allow(null),
})

export const taskUpdateSchema = Joi.object({
  title: Joi.string().min(1).max(200),
  description: Joi.string().allow('').max(2000),
  status: Joi.string().valid('todo', 'in-progress', 'done'),
  assignedTo: objectId.allow(null),
}).min(1)

export const messageCreateSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
})
