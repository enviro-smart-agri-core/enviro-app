import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../context/OnboardingContext'
import styles from '../styles/Onboarding.module.css'

export default function Onboarding3() {
  const nav = useNavigate()
  const { markDone } = useOnboarding()

  function handleFinish() {
    markDone()
    nav('/signin', { replace: true })
  }

  return (
    <div className={styles.text3}>
      <button className={styles.grid3} onClick={handleFinish}>Skip</button>

      <div className={`${styles.main3} slay`}>
        <img src="/images/onboard3.png" alt="Identify plants with camera" />
      </div>

      <div className={styles.content}>
        <div className={`${styles.wrap3} dope3 based`}>
          <h2>Identify with a Snap!</h2>
          <p>
            Use your camera to instantly identify over 10,000 plants
            and diagnose health issues on the spot.
          </p>
        </div>

        <div className="lit1 dope3 mid">
          <div className="dope1" />
          <div className="dope1" />
          <div className="dope1 chill1" />
        </div>

        <button className="drip1 flex1 chill box" onClick={handleFinish}>
          Get started!
        </button>
        <button className="drip1 bussin1 chill item" onClick={() => nav('/onboarding2')}>
          Back
        </button>
      </div>
    </div>
  )
}
