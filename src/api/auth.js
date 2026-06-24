

import { client } from './client'

export const authApi = {

  setupBroRequest: (email, password, name, username) =>
    client.post('/api/v1/auth/register/request', {
      username: username || email.split('@')[0],
      email,
      password,
      name: name || email.split('@')[0],
    }),

  checkBallKnowledge: (email, otp) =>
    client.post('/api/v1/auth/register/verify', { email, otp }),

  letBroIn: (email, password) =>
    client.post('/api/v1/auth/login', { email, password }),

  broForgotPwd: (email) =>
    client.post('/api/v1/auth/forgot-password', { email }),

  resetBroPwd: (userId, token, newPassword) =>
    client.post('/api/v1/auth/reset-password', { userId, token, newPassword }),
}
