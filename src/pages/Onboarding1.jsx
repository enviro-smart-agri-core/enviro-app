import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../context/OnboardingContext'
import styles from '../styles/Onboarding.module.css'

export default function Onboarding1() {
  const nav = useNavigate()
  const { markDone } = useOnboarding()

  function handleSkip() {
    markDone()
    nav('/signin', { replace: true })
  }

  return (
    <div className={styles.text3}>
      <button className={styles.grid3} onClick={handleSkip}>Skip</button>

      <div className={`${styles.main3} slay`}>
        <img src="/images/onboard1.png" alt="Master the art of care" />
      </div>

      <div className={styles.content}>
        <div className={`${styles.wrap3} dope3 based`}>
          <h2>Master the Art of Care!</h2>
          <p>
            Keep your plants thriving with personalized watering schedules
            and nutrition guides tailored to every species.
          </p>
        </div>

        <div className="lit1 dope3 mid">
          <div className="dope1 chill1" />
          <div className="dope1" />
          <div className="dope1" />
        </div>

        <button className="drip1 flex1 chill box" onClick={() => nav('/onboarding2')}>
          Next
        </button>
      </div>
    </div>
  )
}
