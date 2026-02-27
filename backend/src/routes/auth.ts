import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from '../users-store.js'
import { signToken } from '../middleware/auth.js'

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
