import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft, ShoppingBag, CreditCard,
  Banknote, Wallet, CheckCircle,
  Lock, Leaf, ChevronRight, MapPin
} from 'lucide-react'
import { shopApi } from '../api/shop'

const ALL_PRODUCTS = [
  { id: '1', name: 'placeholder', price: 100, unit: 'kg'    },
  { id: '2', name: 'placeholder', price: 100,  unit: 'pack' },
  { id: '3', name: 'placeholder', price: 100, unit: 'bag'  },
  { id: '4', name: 'placeholder', price: 100,  unit: 'pack' },
  { id: '5', name: 'placeholder', price: 100, unit: '500ml'},
  { id: '6', name: 'placeholder', price: 100, unit: 'kit'  },
  { id: '7', name: 'placeholder', price: 100,  unit: '1kg'  },
  { id: '8', name: 'placeholder', price: 100, unit: 'piece'},
]

const SHIPPING_COST = 50

const paymentOptions = [
  { id: 'card',   label: 'Credit Card',     Icon: CreditCard },
  { id: 'cash',   label: 'Cash On Delivery', Icon: Banknote   },
  { id: 'wallet', label: 'Digital Wallet',   Icon: Wallet     },
]

function RadioCircle({ selected }) {
  return (
    <div style={{
      width: 20, height: 20, borderRadius: '50%',
      border: `2px solid ${selected ? '#0f5c3a' : '#ccc'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, transition: 'border-color 0.2s',
    }}>
      {selected && (
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#0f5c3a' }} />
      )}
    </div>
  )
}

export default function Checkout() {
  const navigate = useNavigate()
  const { state } = useLocation()

  const cartItems = state?.cart      || {}
  const subtotal  = state?.cartTotal || 0
  const grandTotal = subtotal + SHIPPING_COST

  const [chosenPayment, setChosenPayment] = useState('card')
  const [cardNumber,    setCardNumber]    = useState('')
  const [expiry,        setExpiry]        = useState('')
  const [cvv,           setCvv]           = useState('')
  const [street,        setStreet]        = useState('')
  const [city,          setCity]          = useState('')
  const [zipCode,       setZipCode]       = useState('')
  const [busy,          setBusy]          = useState(false)
  const [orderDone,     setOrderDone]     = useState(false)
  const [errorMsg,      setErrorMsg]      = useState('')

  function formatCardNumber(val) {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }

  function formatExpiry(val) {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
    return digits
  }

  async function placeOrder() {
    setErrorMsg('')

    if (!street || !city || !zipCode) {
      return setErrorMsg('Please fill out your shipping address')
    }

    if (chosenPayment === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) return setErrorMsg('Please enter a valid card number')
      if (expiry.length < 5)                          return setErrorMsg('Please enter expiry date')
      if (cvv.length < 3)                             return setErrorMsg('Please enter your CVV')
    }

    setBusy(true)

    const paymentMapping = {
      card: 'CREDIT_CARD',
      cash: 'CASH_ON_DELIVERY',
      wallet: 'DIGITAL_WALLET'
    }

    try {
      await shopApi.createOrder({ street, city, zipCode, country: 'Egypt' }, paymentMapping[chosenPayment])
      setBusy(false)
      setOrderDone(true)
    } catch (err) {
      setBusy(false)
      setErrorMsg(err.message || 'Failed to place order. Please try again.')
    }
  }

  if (orderDone) {
    return (
      <div style={{
        minHeight: '100dvh', background: '#fff',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 28px', textAlign: 'center', gap: 20,
        maxWidth: 480, margin: '0 auto',
      }}>
        <div
          className="slay"
          style={{ width: 96, height: 96, borderRadius: '50%', background: '#e8f7ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <CheckCircle size={50} color="#0f5c3a" strokeWidth={1.8} />
        </div>

        <div>
          <h2 className="dope3 based" style={{ fontSize: 28, fontWeight: 800, color: '#0f5c3a', marginBottom: 10 }}>
            Order Placed!
          </h2>
          <p className="dope3 mid" style={{ fontSize: 15, color: '#4a6a4a', lineHeight: 1.7 }}>
            Your order is confirmed. We'll reach out shortly to sort out the delivery.
          </p>
        </div>

        <div
          className="dope3 box"
          style={{ width: '100%', background: '#f7f9f7', borderRadius: 18, padding: '20px 24px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 14, color: '#888' }}>Subtotal</span>
            <span style={{ fontSize: 14, color: '#1a2a1a' }}>{subtotal.toFixed(2)} EGP</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #eee' }}>
            <span style={{ fontSize: 14, color: '#888' }}>Shipping</span>
            <span style={{ fontSize: 14, color: '#1a2a1a' }}>{SHIPPING_COST.toFixed(2)} EGP</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#1a2a1a' }}>Total paid</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#0f5c3a' }}>{grandTotal.toFixed(2)} EGP</span>
          </div>
        </div>

        <button
          className="chill item"
          onClick={() => navigate('/shop')}
          style={{ width: '100%', padding: '16px', background: '#0f5c3a', color: 'white', border: 'none', borderRadius: 18, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}
        >
          Back to Shop
        </button>
      </div>
    )
  }

  return (
    <div style={{ background: '#f3f7f4', minHeight: '100dvh', maxWidth: 480, margin: '0 auto' }}>

      <div style={{
        background: 'white',
        padding: '52px 20px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        position: 'sticky', top: 0, zIndex: 10,
        borderBottom: '1px solid #f0f0f0',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: '#0f5c3a' }}
        >
          <ArrowLeft size={22} color="#0f5c3a" strokeWidth={2.5} />
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f5c3a', fontStyle: 'italic', flex: 1, textAlign: 'center', paddingRight: 30 }}>
          Checkout
        </h1>
      </div>

      <div style={{ padding: '16px 16px 120px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        <div className="dope3 based" style={{ background: 'white', borderRadius: 20, padding: '18px 18px 10px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <ShoppingBag size={20} color="#0f5c3a" strokeWidth={2} />
            <span style={{ fontSize: 17, fontWeight: 800, color: '#1a2a1a' }}>Order Summary</span>
          </div>

          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #f0f0f0', overflow: 'hidden', marginBottom: 14 }}>
            {Object.entries(cartItems).map(([id, qty], idx, arr) => {
              const product = ALL_PRODUCTS.find(p => p.id === id)
              if (!product) return null
              return (
                <div
                  key={id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px',
                    borderBottom: idx < arr.length - 1 ? '1px solid #f5f5f5' : 'none',
                  }}
                >

                  <div style={{
                    width: 56, height: 56, borderRadius: 12, flexShrink: 0,
                    background: 'linear-gradient(135deg, #c8e6c9, #a5d6a7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    <Leaf size={24} color="#2e7d32" strokeWidth={1.5} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a2a1a' }}>{product.name}</div>
                    <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>Liquid Extract</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 1 }}>Qty. {qty}</div>
                  </div>

                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1a2a1a' }}>
                    {(product.price * qty).toFixed(2)}EGP
                  </span>
                </div>
              )
            })}
          </div>

          <div style={{ padding: '4px 2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1a2a1a' }}>Subtotal</span>
              <span style={{ fontSize: 14, color: '#1a2a1a' }}>{subtotal.toFixed(2)}EGP</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1a2a1a' }}>Shipping</span>
              <span style={{ fontSize: 14, color: '#1a2a1a' }}>{SHIPPING_COST.toFixed(2)}EGP</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid #f0f0f0', paddingTop: 12 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#1a2a1a' }}>Total</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#1a2a1a' }}>{grandTotal.toFixed(2)}EGP</span>
            </div>
          </div>
        </div>

        <div className="dope3 mid" style={{ background: 'white', borderRadius: 20, padding: '18px 18px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <MapPin size={20} color="#0f5c3a" strokeWidth={2} />
            <span style={{ fontSize: 17, fontWeight: 800, color: '#1a2a1a' }}>Shipping Address</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              type="text"
              placeholder="Street Address"
              value={street}
              onChange={e => setStreet(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid #e8e8e8', borderRadius: 12, padding: '13px 16px', fontSize: 15, outline: 'none', background: '#fafafa', color: '#1a2a1a' }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={e => setCity(e.target.value)}
                style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', border: '1.5px solid #e8e8e8', borderRadius: 12, padding: '13px 16px', fontSize: 15, outline: 'none', background: '#fafafa', color: '#1a2a1a' }}
              />
              <input
                type="text"
                placeholder="Zip Code"
                value={zipCode}
                onChange={e => setZipCode(e.target.value)}
                style={{ width: '40%', minWidth: 0, boxSizing: 'border-box', border: '1.5px solid #e8e8e8', borderRadius: 12, padding: '13px 16px', fontSize: 15, outline: 'none', background: '#fafafa', color: '#1a2a1a' }}
              />
            </div>
          </div>
        </div>

        <div className="dope3 box" style={{ background: 'white', borderRadius: 20, padding: 18, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <CreditCard size={20} color="#0f5c3a" strokeWidth={2} />
            <span style={{ fontSize: 17, fontWeight: 800, color: '#1a2a1a' }}>Payment Method</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {paymentOptions.map(({ id, label, Icon }) => {
              const picked = chosenPayment === id
              return (
                <div
                  key={id}
                  onClick={() => setChosenPayment(id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
                    border: `2px solid ${picked ? '#0f5c3a' : '#e8e8e8'}`,
                    background: 'white',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <RadioCircle selected={picked} />
                  <Icon size={20} color={picked ? '#0f5c3a' : '#bbb'} strokeWidth={1.8} />
                  <span style={{ fontSize: 15, fontWeight: picked ? 700 : 500, color: picked ? '#0f5c3a' : '#888', flex: 1 }}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>

          {chosenPayment === 'card' && (
            <div className="dope3" style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  border: '1.5px solid #e8e8e8', borderRadius: 12,
                  padding: '13px 16px', fontSize: 15,
                  fontFamily: 'monospace', outline: 'none',
                  letterSpacing: '0.1em', color: '#1a2a1a',
                  background: '#fafafa',
                }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={e => setExpiry(formatExpiry(e.target.value))}
                  style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', border: '1.5px solid #e8e8e8', borderRadius: 12, padding: '13px 16px', fontSize: 15, fontFamily: 'monospace', outline: 'none', color: '#1a2a1a', background: '#fafafa' }}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="CVV"
                  value={cvv}
                  maxLength={4}
                  onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', border: '1.5px solid #e8e8e8', borderRadius: 12, padding: '13px 16px', fontSize: 15, fontFamily: 'monospace', outline: 'none', color: '#1a2a1a', background: '#fafafa' }}
                />
              </div>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="dope3" style={{ padding: '12px 16px', background: '#fff0f0', borderRadius: 12, border: '1px solid #f5c6c6', fontSize: 14, color: '#c0392b', fontWeight: 600 }}>
            {errorMsg}
          </div>
        )}

        <div className="chill item">
          <button
            onClick={placeOrder}
            disabled={busy}
            style={{
              width: '100%', padding: '17px',
              background: busy ? '#2a7a4a' : '#0f5c3a',
              color: 'white', border: 'none',
              borderRadius: 18, fontSize: 17, fontWeight: 700,
              cursor: busy ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              opacity: busy ? 0.8 : 1,
              transition: 'opacity 0.2s',
              fontFamily: 'inherit',
            }}
          >
            {busy ? (
              <><div className="grid1" style={{ width: 20, height: 20, borderWidth: 3 }} /> Placing Order...</>
            ) : (
              <><CheckCircle size={20} strokeWidth={2} /> Complete Order</>
            )}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10 }}>
            <Lock size={12} color="#aaa" strokeWidth={2} />
            <span style={{ fontSize: 12, color: '#aaa' }}>Secure Encrypted Checkout</span>
          </div>
        </div>

      </div>
    </div>
  )
}
undefined
