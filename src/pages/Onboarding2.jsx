import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../context/OnboardingContext'
import styles from '../styles/Onboarding.module.css'

export default function Onboarding2() {
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
        <img src="/images/onboard2.png" alt="Your garden digitized" />
      </div>

      <div className={styles.content}>
        <div className={`${styles.wrap3} dope3 based`}>
          <h2>Your Garden, Digitized!</h2>
          <p>
            Organize your indoor and outdoor collection in one place.
            Never miss a repotting or pruning session again.
          </p>
        </div>

        <div className="lit1 dope3 mid">
          <div className="dope1" />
          <div className="dope1 chill1" />
          <div className="dope1" />
        </div>

        <button className="drip1 flex1 chill box" onClick={() => nav('/onboarding3')}>
          Next
        </button>
        <button className="drip1 bussin1 chill item" onClick={() => nav('/onboarding1')}>
          Back
        </button>
      </div>
    </div>
  )
}
