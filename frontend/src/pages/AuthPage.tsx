import React, { useState } from 'react'
import { Login } from '../components/Login'
import { Signup } from '../components/Signup'

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true)

  return (
    <div className="auth-page">
      {isLogin ? (
        <Login 
          onSuccess={() => window.location.href = '/lessons'}
          onSwitchToSignup={() => setIsLogin(false)}
        />
      ) : (
        <Signup 
          onSuccess={() => window.location.href = '/lessons'}
          onSwitchToLogin={() => setIsLogin(true)}
        />
      )}
    </div>
  )
}
