import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthContext } from './context/AuthContext'
import { usePermissions } from './context/PermissionsContext'
import BackHandler from './components/BackHandler'

import Splash       from './pages/Splash'
import Permissions  from './pages/Permissions'
import Onboarding1  from './pages/Onboarding1'
import Onboarding2  from './pages/Onboarding2'
import Onboarding3  from './pages/Onboarding3'
import SignIn       from './pages/SignIn'
import Register     from './pages/Register'
import VerifyOTP    from './pages/VerifyOTP'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword  from './pages/ResetPassword'
import Home         from './pages/Home'
import Sensors      from './pages/Sensors'
import SensorDetail from './pages/SensorDetail'
import AddDevice    from './pages/AddDevice'
import Shop         from './pages/Shop'
import Checkout     from './pages/Checkout'
import Scan         from './pages/Scan'
import ChatAgent    from './pages/ChatAgent'
import Profile      from './pages/Profile'
import EditProfile    from './pages/profile/EditProfile'
import ChangePassword from './pages/profile/ChangePassword'
import Notifications  from './pages/profile/Notifications'
import About          from './pages/profile/About'
import HelpCenter     from './pages/profile/HelpCenter'
import ChatSupport    from './pages/profile/ChatSupport'

function Loading() {
  return (
    <div className="splash">
      <div className="grid1" style={{ width: 40, height: 40, borderWidth: 4 }} />
    </div>
  )
}

function PrivateRoute({ children }) {
  const { bro, vibeReady } = useAuthContext()
  if (!vibeReady) return <Loading />
  return bro ? children : <Navigate to="/signin" replace />
}

function GuestRoute({ children }) {
  const { bro, vibeReady } = useAuthContext()
  if (!vibeReady) return <Loading />
  return bro ? <Navigate to="/home" replace /> : children
}

export default function App() {
  const { vibe } = usePermissions()

  if (vibe === 'pending' || vibe === 'asking') return <Permissions />

  return (
    <>
      <BackHandler />
      <Routes>
        <Route path="/"            element={<Splash />} />
        <Route path="/onboarding1" element={<Onboarding1 />} />
        <Route path="/onboarding2" element={<Onboarding2 />} />
        <Route path="/onboarding3" element={<Onboarding3 />} />
        <Route path="/signin"      element={<GuestRoute><SignIn /></GuestRoute>} />
        <Route path="/register"    element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/verify-otp"  element={<GuestRoute><VerifyOTP /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/reset-password"  element={<GuestRoute><ResetPassword /></GuestRoute>} />
        <Route path="/home"        element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/sensors"     element={<PrivateRoute><Sensors /></PrivateRoute>} />
        <Route path="/sensors/add" element={<PrivateRoute><AddDevice /></PrivateRoute>} />
        <Route path="/sensors/:id" element={<PrivateRoute><SensorDetail /></PrivateRoute>} />
        <Route path="/shop"          element={<PrivateRoute><Shop /></PrivateRoute>} />
        <Route path="/shop/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
        <Route path="/scan"        element={<PrivateRoute><Scan /></PrivateRoute>} />
        <Route path="/chat"        element={<PrivateRoute><ChatAgent /></PrivateRoute>} />
        <Route path="/profile"               element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/profile/edit"          element={<PrivateRoute><EditProfile /></PrivateRoute>} />
        <Route path="/profile/password"      element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
        <Route path="/profile/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
        <Route path="/profile/about"         element={<PrivateRoute><About /></PrivateRoute>} />
        <Route path="/profile/help"          element={<PrivateRoute><HelpCenter /></PrivateRoute>} />
        <Route path="/profile/chat"          element={<PrivateRoute><ChatSupport /></PrivateRoute>} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
