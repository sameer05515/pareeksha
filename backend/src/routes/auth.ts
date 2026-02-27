import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { getUserByEmail, getUserById, updateUserPassword } from '../users-store.js'
import { signToken, requireAuth, type AuthLocals } from '../middleware/auth.js'

export const authRouter = Router()

authRouter.post('/login', (req, res, next) => {
  try {
    const { email, password } = req.body ?? {}
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      res.status(400).json({ success: false, message: 'Email and password required' })
      return
    }
    const user = getUserByEmail(email.trim())
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' })
      return
    }
    const match = bcrypt.compareSync(password, user.passwordHash)
    if (!match) {
      res.status(401).json({ success: false, message: 'Invalid email or password' })
      return
    }
    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
    })
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
      },
    })
  } catch (err) {
    next(err)
  }
})

authRouter.put('/password', requireAuth, (req, res, next) => {
  try {
    const auth = res.locals.auth as AuthLocals
    const { currentPassword, newPassword } = req.body ?? {}
    if (!currentPassword || typeof currentPassword !== 'string' || !newPassword || typeof newPassword !== 'string') {
      res.status(400).json({ success: false, message: 'Current password and new password required' })
      return
    }
    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters' })
      return
    }
    const user = getUserById(auth.userId)
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' })
      return
    }
    const match = bcrypt.compareSync(currentPassword, user.passwordHash)
    if (!match) {
      res.status(400).json({ success: false, message: 'Current password is incorrect' })
      return
    }
    const newHash = bcrypt.hashSync(newPassword, 10)
    const updated = updateUserPassword(user.id, newHash)
    if (!updated) {
      res.status(500).json({ success: false, message: 'Failed to update password' })
      return
    }
    res.json({ success: true, message: 'Password updated successfully' })
  } catch (err) {
    next(err)
  }
})
