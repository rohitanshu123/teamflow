/** Tiny holder so route handlers can emit Socket.IO events after a DB write. */
let io = null

export function setIO(instance) {
  io = instance
}

export function emitToTeam(teamId, event, payload) {
  if (io) io.to(`team:${teamId}`).emit(event, payload)
}
