import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingCart, Plus, Minus, X,
  ChevronDown, Leaf, Cpu, Droplets,
  Package, ShoppingBag,
} from 'lucide-react'
import BottomNav from '../components/BottomNav'
import styles from '../styles/Shop.module.css'
import { shopApi } from '../api/shop'

const LOCAL_IMAGES = [
  { match: 'premium organic soil', src: '/images/premium.png' },
  { match: 'normal organic soil',  src: '/images/normal.png'  },
]

function resolveImage(product) {
  const nameLower = (product.name || '').toLowerCase()
  const override = LOCAL_IMAGES.find(o => nameLower.includes(o.match))
  if (override) return override.src
  return product.image || product.imageUrl || null
}

const SHELF = [
  { id: '1',  name: 'placeholder', price: 100, category: 'Fertilizers', inStock: false,  image: null },
  { id: '2',  name: 'placeholder1', price: 100,  category: 'Seeds',        inStock: true,  image: null },
  { id: '3',  name: 'placeholder1', price: 100, category: 'Fertilizers', inStock: true,  image: null },
  { id: '4',  name: 'placeholder1', price: 100,  category: 'Seeds',        inStock: true,  image: null },
  { id: '5',  name: 'placeholder1', price: 100, category: 'Pesticides',   inStock: false, image: null },
  { id: '6',  name: 'placeholder1', price: 100, category: 'Tools',        inStock: true,  image: null },
  { id: '7',  name: 'placeholder1', price: 100,  category: 'Fertilizers', inStock: true,  image: null },
  { id: '8',  name: 'placeholder1', price: 100, category: 'Tools',        inStock: true,  image: null },

  { id: '9',  name: 'Smart Soil Sensor',             price: 350, category: 'Tools',        inStock: true,  image: null },
  { id: '10', name: 'Water Pump Pro',                price: 420, category: 'Tools',        inStock: true,  image: null },
  { id: '11', name: 'Water Tank 1L',               price: 280, category: 'Tools',        inStock: true,  image: null },
]

const TABS = ['All', 'Seeds', 'Fertilizers', 'Tools', 'Pesticides']

const SMART_WATER_BUNDLE = {
  name:       'Smart Water Farm Kit',
  oldPrice:   1050,
  price:      749,
  savings:    301,
  productIds: ['9', '10', '11'],
  items: [
    { Icon: Cpu,        label: 'Smart Soil Sensor', detail: 'Reads moisture, humidity & temp live' },
    { Icon: Droplets,   label: 'Water Pump Pro',    detail: 'Auto-triggers when soil gets dry'     },
    { Icon: Package,    label: 'Water Tank 1L',   detail: 'Holds enough water for a full week'   },
  ],
}

function NoPhotoYet() {
  return (
    <div style={{
      width: '100%', aspectRatio: '1/1',
      background: 'linear-gradient(135deg, #e8f2ec, #d4e8da)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 6,
    }}>
      <Leaf size={28} color="#a0c0a8" strokeWidth={1.4} />
      <span style={{ fontSize: 9, color: '#a0c0a8', textAlign: 'center', padding: '0 8px', lineHeight: 1.4 }}>
        Add image
      </span>
    </div>
  )
}

export default function Shop() {
  const nav = useNavigate()

  const [pickedTab,   setPickedTab]   = useState('All')
  const [basket,      setBasket]      = useState({})
  const [drawerOpen,  setDrawerOpen]  = useState(false)
  const [cardsReady,  setCardsReady]  = useState(false)
  const [bundleAdded, setBundleAdded] = useState(false)
  const [products,    setProducts]    = useState([])
  const [lightbox,    setLightbox]    = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setCardsReady(true), 80)

    async function loadData() {
      try {
        const prodRes = await shopApi.getProducts()
        const p = prodRes?.data?.products || prodRes?.data || prodRes?.products || (Array.isArray(prodRes) ? prodRes : [])
        const mappedProducts = p.map(x => ({
          ...x,
          id: x._id || x.id,
          inStock: x.stockQuantity > 0 || x.inStock !== false
        }))
        if (mappedProducts.length > 0) setProducts(mappedProducts)

        const cartRes = await shopApi.getCart()
        const c = cartRes?.data || cartRes?.cart || cartRes
        const items = c?.items || (Array.isArray(c) ? c : [])
        const newBasket = {}
        items.forEach(item => {
          const id = item.productId?._id || item.productId || item.product?._id || item.product || item._id
          if (id) newBasket[id] = item.quantity
        })
        if (Object.keys(newBasket).length > 0) setBasket(newBasket)
      } catch (err) {
        console.error('Failed to load shop data from backend', err)
      }
    }
    loadData()

    return () => clearTimeout(t)
  }, [])

  const allProds = products.length > 0 ? products : SHELF
  const whatToShow = pickedTab === 'All' ? allProds : allProds.filter(p => p.category?.toLowerCase() === pickedTab.toLowerCase())

  const totalItems = Object.values(basket).reduce((a, b) => a + b, 0)

  const totalPrice = Object.entries(basket).reduce((sum, [id, qty]) => {
    const found = allProds.find(p => p.id === id) || SHELF.find(p => p.id === id)
    return sum + (found ? found.price * qty : 0)
  }, 0)

  function throwIn(id) {
    setBasket(prev => {
      const nextQty = (prev[id] || 0) + 1
      shopApi.addToCart(id, nextQty).catch(console.error)
      return { ...prev, [id]: nextQty }
    })
  }

  function removeOne(id) {
    setBasket(prev => {
      const nextQty = prev[id] - 1
      const next = { ...prev }
      if (nextQty > 0) {
        next[id] = nextQty
        shopApi.addToCart(id, nextQty).catch(console.error)
      } else {
        delete next[id]
        shopApi.removeFromCart(id).catch(console.error)
      }
      return next
    })
  }

  function yeet(id) {
    setBasket(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    shopApi.removeFromCart(id).catch(console.error)
  }

  function grabBundle() {
    setBasket(prev => {
      const next = { ...prev }
      SMART_WATER_BUNDLE.productIds.forEach(id => {
        next[id] = (next[id] || 0) + 1
        shopApi.addToCart(id, next[id]).catch(console.error)
      })
      return next
    })
    setBundleAdded(true)
    setTimeout(() => setBundleAdded(false), 2200)
  }

  function goCheckout() {
    setDrawerOpen(false)
    nav('/shop/checkout', { state: { cart: basket, cartTotal: totalPrice } })
  }

  return (

    <div className={styles['bussin4']}>

      <div className={`${styles['slay4']} dope3 based`}>
        <div style={{ position: 'relative', zIndex: 1, paddingRight: '80px' }}>
          <h2 className={styles['dope4']}>
            Equip Your Journey<br />to Sustainability
          </h2>
          <p className={styles['chill4']}>
            Precision tools engineered for the modern steward.
            Cultivate understanding through data-driven botany.
          </p>
        </div>

        <img
          src="/images/leaf.png"
          alt="Enviro Logo"
          style={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 90,
            height: 90,
            objectFit: 'contain',
            zIndex: 1
          }}
        />
      </div>

      <div className={`${styles['valid4']} dope3 box`}>
        <span className={styles['mid4']}>Products</span>
        <div style={{ position: 'relative' }}>
          <select
            value={pickedTab}
            onChange={e => setPickedTab(e.target.value)}
            className={styles['cap4']}
          >
            {TABS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <ChevronDown
            size={13} color="white"
            style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
        </div>
      </div>

      <div className={styles['box4']}>
        {whatToShow.map((item, idx) => (
          <div
            key={item.id}
            className={styles['card4']}
            style={{
              opacity:    cardsReady ? 1 : 0,
              transform:  cardsReady ? 'translateY(0)' : 'translateY(18px)',
              transition: `opacity 0.35s ease ${idx * 0.055}s, transform 0.35s ease ${idx * 0.055}s`,
            }}
          >
            {resolveImage(item)
              ? (
                <img
                  src={resolveImage(item)}
                  alt={item.name}
                  className={styles['text4']}
                  style={{ cursor: 'zoom-in' }}
                  onClick={() => setLightbox({ src: resolveImage(item), name: item.name })}
                />
              )
              : <NoPhotoYet />
            }

            <div className={styles['body']}>
              <p className={styles['main4']}>{item.name}</p>

              <div className={styles['base2']}>
                <div>
                  <span className={styles['grid4']}>{item.price.toFixed(2)}</span>
                  <span className={styles['row4']}> EGP</span>
                </div>

                {item.inStock ? (
                  basket[item.id] ? (
                    <div className={styles['col4']}>
                      <button className={`${styles['nav4']} top4`} onClick={() => removeOne(item.id)}>
                        <Minus size={12} strokeWidth={2.5} color="#555" />
                      </button>
                      <span className={styles['btn4']}>{basket[item.id]}</span>
                      <button className={`${styles['nav4']} bot4`} onClick={() => throwIn(item.id)}>
                        <Plus size={12} strokeWidth={2.5} color="white" />
                      </button>
                    </div>
                  ) : (
                    <button className={styles['left4']} onClick={() => throwIn(item.id)}>
                      <ShoppingCart size={14} strokeWidth={2} color="white" />
                    </button>
                  )
                ) : (
                  <span style={{ fontSize: 10, color: '#e74c3c', fontWeight: 600 }}>Out of stock</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 130 }} />

      {totalItems > 0 && (
        <button key={totalItems} className={styles['right4']} onClick={() => setDrawerOpen(true)}>
          <ShoppingCart size={22} color="white" strokeWidth={2} />
          <span className={styles['left']}>
            {totalItems}
          </span>
        </button>
      )}

      {drawerOpen && (
        <div
          className={`${styles['base4']} drip4`}
          style={{ animationDuration: '0.2s' }}
          onClick={e => { if (e.target === e.currentTarget) setDrawerOpen(false) }}
        >
          <div className={styles['core4']}>

            <div className={styles['left3']}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a2a1a' }}>Your Cart</h2>
                <p style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
                  {totalItems} item{totalItems !== 1 ? 's' : ''}
                </p>
              </div>
              <button className={styles['vibe5']} onClick={() => setDrawerOpen(false)}>
                <X size={16} color="#555" strokeWidth={2.5} />
              </button>
            </div>

            <div className={styles['drip5']}>
              {Object.entries(basket).map(([id, qty], index) => {
                const p = allProds.find(p => p.id === id) || SHELF.find(p => p.id === id)
                if (!p) return null
                return (
                  <div
                    key={id}
                    className={`${styles['bussin3']} dope3`}
                    style={{ animationDelay: `${index * 0.03}s`, animationDuration: '0.25s' }}
                  >
                    <div className={styles['aura5']}>
                      {resolveImage(p)
                        ? <img src={resolveImage(p)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <Leaf size={18} color="#a0c0a8" strokeWidth={1.4} />
                      }
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#1a2a1a', fontStyle: 'italic' }}>{p.name}</p>
                      <p style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{p.price?.toFixed(2)} EGP × {qty}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#0f5c3a' }}>
                        {(p.price * qty).toFixed(2)} EGP
                      </span>
                      <button onClick={() => yeet(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <X size={14} color="#ccc" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className={`${styles['goat5']} dope3`} style={{ animationDelay: `${Object.keys(basket).length * 0.03}s`, animationDuration: '0.25s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 15, color: '#888' }}>Subtotal</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#1a2a1a' }}>{totalPrice.toFixed(2)} EGP</span>
              </div>
              <button className={styles['bet5']} onClick={goCheckout}>
                <ShoppingCart size={18} strokeWidth={2} />
                Checkout
              </button>
            </div>

          </div>
        </div>
      )}

      <BottomNav />

      {}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.82)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            animation: 'lbFadeIn 0.22s ease',
            padding: '24px 16px',
          }}
        >
          {}
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: 'absolute', top: 18, right: 18,
              background: 'rgba(255,255,255,0.15)',
              border: 'none', borderRadius: '50%',
              width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backdropFilter: 'blur(6px)',
            }}
          >
            <X size={20} color="white" strokeWidth={2.5} />
          </button>

          {}
          <img
            src={lightbox.src}
            alt={lightbox.name}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '92vw', maxHeight: '75vh',
              objectFit: 'contain', borderRadius: 18,
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
              animation: 'lbScaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          />

          {}
          <p style={{
            marginTop: 18, color: 'rgba(255,255,255,0.85)',
            fontSize: 15, fontWeight: 600, textAlign: 'center',
            textShadow: '0 1px 4px rgba(0,0,0,0.5)',
          }}>
            {lightbox.name}
          </p>

          <style>{`
            @keyframes lbFadeIn  { from { opacity:0 } to { opacity:1 } }
            @keyframes lbScaleIn { from { transform:scale(0.82); opacity:0 } to { transform:scale(1); opacity:1 } }
          `}</style>
        </div>
      )}
    </div>
  )
}
