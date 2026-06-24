import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider }       from './context/AuthContext'
import { OnboardingProvider } from './context/OnboardingContext'
import { PermissionsProvider } from './context/PermissionsContext'
import { WeatherProvider }    from './context/WeatherContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <OnboardingProvider>
          <PermissionsProvider>
            <WeatherProvider>
              <App />
            </WeatherProvider>
          </PermissionsProvider>
        </OnboardingProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
