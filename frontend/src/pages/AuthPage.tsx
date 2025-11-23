import React, { useState } from 'react'
import { Login } from '../components/Login'
import { Signup } from '../components/Signup'

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true)

  return (
    <div className="auth-page">
      {isLogin ? (
        <Login 
          onSwitchToSignup={() => setIsLogin(false)}
        />
      ) : (
        <Signup 
          onSwitchToLogin={() => setIsLogin(true)}
        />
      )}
    </div>
  )
}
