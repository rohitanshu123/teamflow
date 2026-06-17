import mongoose from 'mongoose'

const { Schema, model } = mongoose

/** Reusable timestamp option so each doc records createdAt/updatedAt. */
const opts = { timestamps: true }

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['ADMIN', 'MANAGER', 'MEMBER'], default: 'MEMBER' },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
  },
  opts,
)

const teamSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    adminId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  opts,
)

const projectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
  },
  opts,
)

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  opts,
)

const messageSchema = new Schema(
  {
    content: { type: String, required: true, trim: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
    timestamp: { type: Date, required: true, default: Date.now },
  },
  opts,
)

export const User = model('User', userSchema)
export const Team = model('Team', teamSchema)
export const Project = model('Project', projectSchema)
export const Task = model('Task', taskSchema)
export const Message = model('Message', messageSchema)
