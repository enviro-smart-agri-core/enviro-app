import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, MessageSquare } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'

const BOT_REPLIES = [
  "Thanks for reaching out! Our team will get back to you shortly.",
  "We've received your message and will respond within 24 hours.",
  "Got it! A support agent will follow up with you via email.",
]

export default function ChatSupport() {
  const nav = useNavigate()
  const { bro } = useAuthContext()

  const [messages, setMessages] = useState([
    { id: 1, from: 'support', text: `Hi ${bro?.name || 'there'}! How can we help you today?`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ])
  const [input,   setInput]   = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setSending(true)
    setMessages(prev => [...prev, { id: Date.now(), from: 'user', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])

    await new Promise(r => setTimeout(r, 1200))
    const reply = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)]
    setMessages(prev => [...prev, { id: Date.now() + 1, from: 'support', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    setSending(false)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div className="page" style={{ background: '#f5f5f5' }}>
      <div style={{ background: '#0f5c3a', padding: '52px 20px 16px', flexShrink: 0 }}>
        <button onClick={() => nav(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
          <ArrowLeft size={16} strokeWidth={2.5} /> Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={20} color="white" strokeWidth={1.8} />
          </div>
          <div>
            <div style={{ color: 'white', fontSize: 16, fontWeight: 700 }}>Enviro Support</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Usually replies within 24 hours</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map(msg => {
          const isUser = msg.from === 'user'
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '78%', padding: '10px 14px', borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: isUser ? '#0f5c3a' : 'white', color: isUser ? 'white' : '#1a2a1a', fontSize: 14, lineHeight: 1.5, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                {msg.text}
              </div>
              <div style={{ fontSize: 11, color: 'var(--mu)', marginTop: 4, paddingLeft: 4, paddingRight: 4 }}>{msg.time}</div>
            </div>
          )
        })}
        {sending && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {[0, 0.2, 0.4].map((d, i) => <div key={i} style={{ width: 8, height: 8, background: 'var(--mu)', borderRadius: '50%', animation: `pulse 1s ease-in-out ${d}s infinite` }} />)}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', padding: '12px 16px 28px', display: 'flex', gap: 10, alignItems: 'flex-end', borderTop: '0.5px solid var(--br)' }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} placeholder="Type a message..." rows={1} style={{ flex: 1, border: '1px solid var(--br)', borderRadius: 14, padding: '10px 14px', fontSize: 15, fontFamily: 'inherit', outline: 'none', resize: 'none', lineHeight: 1.5, maxHeight: 100, overflowY: 'auto' }} />
        <button onClick={sendMessage} disabled={!input.trim() || sending} style={{ width: 42, height: 42, borderRadius: '50%', background: input.trim() ? '#0f5c3a' : '#e0e0e0', border: 'none', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Send size={18} color="white" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
