import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import { User, Team, Project, Task, Message } from './models/index.js'

/**
 * Seeds the database with fictional demo data (no real org/users/data).
 * Run: npm run seed   — clears existing collections first, then re-inserts.
 */
async function seed() {
  await connectDB()
  console.log('🌱 Clearing existing collections…')
  await Promise.all([User.deleteMany({}), Team.deleteMany({}), Project.deleteMany({}), Task.deleteMany({}), Message.deleteMany({})])

  const team = await Team.create({ name: 'TeamFlow Studio', description: 'Product & engineering crew building the demo platform.' })

  const [admin, mgr, m1, m2, m3] = await User.create([
    { name: 'Asha Verma', email: 'asha@teamflow.dev', role: 'ADMIN', teamId: team._id },
    { name: 'Rohan Mehta', email: 'rohan@teamflow.dev', role: 'MANAGER', teamId: team._id },
    { name: 'Priya Nair', email: 'priya@teamflow.dev', role: 'MEMBER', teamId: team._id },
    { name: 'Sameer Khan', email: 'sameer@teamflow.dev', role: 'MEMBER', teamId: team._id },
    { name: 'Lena Park', email: 'lena@teamflow.dev', role: 'MEMBER', teamId: team._id },
  ])

  team.adminId = admin._id
  await team.save()

  const [p1, p2] = await Project.create([
    { name: 'Website Revamp', description: 'Redesign marketing site with new brand system.', teamId: team._id },
    { name: 'Mobile App v2', description: 'Offline mode, push notifications, faster onboarding.', teamId: team._id },
  ])

  await Task.create([
    { title: 'Audit current pages', status: 'done', projectId: p1._id, assignedTo: m1._id, description: 'List pages to keep, merge, or drop.' },
    { title: 'Design new hero section', status: 'in-progress', projectId: p1._id, assignedTo: m3._id, description: 'Two variants for A/B test.' },
    { title: 'Build component library', status: 'in-progress', projectId: p1._id, assignedTo: m2._id },
    { title: 'SEO migration plan', status: 'todo', projectId: p1._id, description: 'Redirect map for changed URLs.' },
    { title: 'Set up offline cache', status: 'todo', projectId: p2._id, assignedTo: m1._id },
    { title: 'Push notification service', status: 'in-progress', projectId: p2._id, assignedTo: m2._id },
    { title: 'Onboarding screens', status: 'todo', projectId: p2._id },
  ])

  await Message.create([
    { content: 'Morning team! Standup in 10 minutes.', senderId: mgr._id, teamId: team._id, timestamp: new Date(Date.now() - 7200000) },
    { content: 'Hero section variants are ready for review.', senderId: m3._id, teamId: team._id, timestamp: new Date(Date.now() - 5400000) },
    { content: 'Nice! Pushing the SEO plan to To Do for now.', senderId: admin._id, teamId: team._id, timestamp: new Date(Date.now() - 1800000) },
  ])

  console.log('✅ Seed complete.')
  console.log(`   Team: ${team.name} (${team._id})`)
  console.log('   Logins: asha@teamflow.dev (ADMIN), rohan@teamflow.dev (MANAGER), priya@teamflow.dev (MEMBER)')
  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(async (err) => {
  console.error('❌ Seed failed:', err.message)
  await mongoose.disconnect()
  process.exit(1)
})
