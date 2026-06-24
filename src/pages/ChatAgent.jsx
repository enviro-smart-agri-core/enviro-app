import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Send, Bot, Loader2, Leaf } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext'
import { plantApi } from '../api/plant'
import aiConfig from '../../ai_abdo.json'

const formatMessage = (text) => {
  if (!text) return null
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index}>{part}</strong>
    }
    return <span key={index}>{part}</span>
  })
}

export default function ChatAgent() {
  const nav = useNavigate()
  const { bro } = useAuthContext()
  const [messages, setMessages] = useState([
    { role: 'agent', text: 'Hello! I am your Enviro ChatAgent. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [plants, setPlants] = useState([])
  const [selectedPlantId, setSelectedPlantId] = useState('general')

  useEffect(() => {
    plantApi.getAll()
      .then(res => {
        const list = res.data?.plants || res.data || res.plants || (Array.isArray(res) ? res : [])
        setPlants(list)
      })
      .catch(err => console.error('Failed to load plants:', err))
  }, [])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userText = input.trim()
    setMessages(prev => [...prev, { role: 'user', text: userText }])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch(aiConfig.endpoint, {
        method: aiConfig.method || 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: bro?.username || bro?.name || 'Enviro_User',
          plant_id: selectedPlantId,
          question: userText
        })
      })

      if (!res.ok) throw new Error('Network response was not ok')

      const data = await res.json()

      const reply = data.agent_reply || data.response || data.answer || data.reply || data.text || JSON.stringify(data)

      setMessages(prev => [...prev, { role: 'agent', text: reply }])
    } catch (err) {
      console.error('AI Chat Error:', err)
      setMessages(prev => [...prev, { role: 'agent', text: "Sorry, abdo ass is too big" }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: 0 }}>
      { }
      <div style={{
        padding: 'calc(20px + env(safe-area-inset-top, 0px)) 20px 20px 20px',
        background: 'var(--gp)',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
      }}>
        <button
          onClick={() => nav(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <ChevronLeft size={24} color="#1a2a1a" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: '#0f5c3a', borderRadius: '50%', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={20} color="white" />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a2a1a' }}>ChatAgent</span>
        </div>
      </div>

      <div style={{ padding: '10px 20px', background: 'white', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Leaf size={20} color="#0f5c3a" />
        <select
          value={selectedPlantId}
          onChange={e => setSelectedPlantId(e.target.value)}
          className="slay1"
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 12, border: '1px solid #d0e0d0',
            fontSize: 14, outline: 'none', background: '#f9fbf9', color: '#1a2a1a', fontWeight: 600,
            appearance: 'none', cursor: 'pointer'
          }}
        >
          <option value="general">General Garden Chat</option>
          {plants.map(p => (
            <option key={p._id || p.id} value={p._id || p.id}>
              {p.plantName || p.plantType}
            </option>
          ))}
        </select>
      </div>

      { }
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', background: '#f9fbf9' }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            background: m.role === 'user' ? '#0f5c3a' : 'white',
            color: m.role === 'user' ? 'white' : '#1a2a1a',
            padding: '12px 16px',
            borderRadius: '20px',
            borderBottomRightRadius: m.role === 'user' ? '4px' : '20px',
            borderBottomLeftRadius: m.role === 'agent' ? '4px' : '20px',
            maxWidth: '80%',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            fontSize: '15px',
            lineHeight: '1.4'
          }}>
            {formatMessage(m.text)}
          </div>
        ))}
        {isLoading && (
          <div style={{
            alignSelf: 'flex-start',
            background: 'white',
            padding: '12px 16px',
            borderRadius: '20px',
            borderBottomLeftRadius: '4px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#0f5c3a',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            Thinking
            <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
              <div className="dot-pulse" style={{ animationDelay: '0s' }}></div>
              <div className="dot-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="dot-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
      </div>

      { }
      <form onSubmit={handleSend} style={{
        padding: '15px 20px',
        background: 'white',
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        gap: '10px'
      }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask me anything about your plants..."
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '24px',
            border: '1px solid #d0e0d0',
            outline: 'none',
            fontSize: '15px',
            background: '#f9fbf9'
          }}
        />
        <button
          type="submit"
          style={{
            background: isLoading ? '#8aaa8a' : '#0f5c3a',
            border: 'none',
            borderRadius: '50%',
            width: '46px',
            height: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            flexShrink: 0
          }}
          disabled={isLoading}
        >
          <Send size={20} color="white" style={{ marginLeft: '-2px' }} />
        </button>
      </form>
    </div>
  )
}
