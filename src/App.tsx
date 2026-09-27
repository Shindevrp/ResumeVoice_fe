import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import Portfolio from './Portfolio'

type ServerEvent = { type: string; text?: string; token?: string }
type VoiceSession = {
  context: AudioContext
  stream: MediaStream
  socket: WebSocket | null
  capture: AudioWorkletNode
  source: MediaStreamAudioSourceNode
  output: GainNode
  playbackGain: GainNode
  playing: Set<AudioBufferSourceNode>
  playbackVersion: number
  queue: Promise<void>
  nextPlayTime: number
}

function endpoint(path: string, websocket = false) {
  if (!websocket && import.meta.env.DEV) return '/resumevoice-api' + path
  const configured = import.meta.env.VITE_RESUME_VOICE_API_URL ||
    import.meta.env.VITE_RESUME_VOICE_SIGNAL_URL
  if (!configured) throw new Error('Set VITE_RESUME_VOICE_API_URL in .env.')
  const url = new URL(configured)
  const secure = url.protocol === 'https:' || url.protocol === 'wss:'
  url.protocol = websocket ? (secure ? 'wss:' : 'ws:') : (secure ? 'https:' : 'http:')
  url.pathname = path
  url.search = ''
  url.hash = ''
  return url.href
}

function App() {
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [textVisible, setTextVisible] = useState(false)
  const [audioMuted, setAudioMuted] = useState(false)
  const audioMutedRef = useRef(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (assistantOpen && textVisible) inputRef.current?.focus({ preventScroll: true })
  }, [assistantOpen, textVisible])
  const [input, setInput] = useState('')
  const [userText, setUserText] = useState('')
  const [partialText, setPartialText] = useState('')
  const [assistantText, setAssistantText] = useState('')
  const [notice, setNotice] = useState('')
  const [voiceState, setVoiceState] = useState<'off' | 'starting' | 'listening'>('off')
  const [micLevel, setMicLevel] = useState(0)
  const [busy, setBusy] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [playbackBlocked, setPlaybackBlocked] = useState(false)
  const [replyMode, setReplyMode] = useState<'voice' | 'text'>('text')
  const sessionRef = useRef<VoiceSession | null>(null)
  const generationRef = useRef(0)
  const textRef = useRef<AbortController | null>(null)
  const startingRef = useRef(false)

  const flushAudio = useCallback((session: VoiceSession) => {
    session.playbackVersion++
    for (const source of session.playing) {
      source.onended = null
      source.stop()
      source.disconnect()
    }
    session.playing.clear()
    session.nextPlayTime = 0
    session.queue = Promise.resolve()
  }, [])

  const disposeVoice = useCallback(() => {
    const session = sessionRef.current
    sessionRef.current = null
    if (!session) return
    if (session.socket) {
      session.socket.onclose = null
      session.socket.onmessage = null
      session.socket.onopen = null
      session.socket.onerror = null
      session.socket.close()
    }
    session.capture.port.onmessage = null
    session.capture.disconnect()
    session.source.disconnect()
    session.output.disconnect()
    session.playbackGain.disconnect()
    session.stream.getTracks().forEach(track => track.stop())
    flushAudio(session)
    void session.context.close()
  }, [flushAudio])

  function stopVoice() {
    generationRef.current++
    startingRef.current = false
    disposeVoice()
    setVoiceState('off')
    setMicLevel(0)
    setPlaying(false)
    setBusy(false)
    setPlaybackBlocked(false)
  }

  useEffect(() => () => {
    generationRef.current++
    textRef.current?.abort()
    disposeVoice()
  }, [disposeVoice])

  function receiveAudio(session: VoiceSession, data: ArrayBuffer) {
    const version = session.playbackVersion
    // Decode in arrival order and schedule buffers without overlapping them.
    session.queue = session.queue.then(async () => {
      if (sessionRef.current !== session || version !== session.playbackVersion) return
      const buffer = await session.context.decodeAudioData(data)
      if (sessionRef.current !== session || version !== session.playbackVersion) return
      if (session.context.state === 'suspended') {
        try { await session.context.resume() } catch { setPlaybackBlocked(true) }
      }
      const source = session.context.createBufferSource()
      source.buffer = buffer
      source.connect(session.playbackGain)
      session.playing.add(source)
      source.onended = () => {
        source.disconnect()
        session.playing.delete(source)
        if (sessionRef.current === session && !session.playing.size) setPlaying(false)
      }
      const start = Math.max(session.context.currentTime + 0.02, session.nextPlayTime)
      session.nextPlayTime = start + buffer.duration
      source.start(start)
      setPlaying(true)
    }).catch(error => {
      if (sessionRef.current === session) setNotice(`Unable to play voice reply: ${String(error)}`)
    })
  }

  async function startVoice() {
    if (startingRef.current) return
    startingRef.current = true
    textRef.current?.abort()
    textRef.current = null
    const generation = ++generationRef.current
    const active = () => generationRef.current === generation
    let context: AudioContext | undefined
    let stream: MediaStream | undefined
    setVoiceState('starting')
    setNotice('Requesting microphone…')
    setBusy(false)
    try {
      const url = endpoint('/ws/audio', true)
      // Same capture format as the backend /ui embedded in Streamlit.
      context = new AudioContext({ sampleRate: 16000 })
      await context.resume()
      if (context.sampleRate !== 16000) throw new Error('16 kHz audio capture is unavailable.')
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
      if (!active()) { stream.getTracks().forEach(t => t.stop()); await context.close(); return }
      await context.audioWorklet.addModule('/pcm-capture.js')
      if (!active()) { stream.getTracks().forEach(t => t.stop()); await context.close(); return }
      const capture = new AudioWorkletNode(context, 'pcm-capture')
      const source = context.createMediaStreamSource(stream)
      const output = context.createGain()
      const playbackGain = context.createGain()
      playbackGain.gain.value = audioMutedRef.current ? 0 : 1
      playbackGain.connect(context.destination)
      output.gain.value = 0
      source.connect(capture)
      capture.connect(output)
      output.connect(context.destination)
      const session: VoiceSession = {
        context, stream, capture, source, output, playbackGain, socket: null,
        playing: new Set(), playbackVersion: 0, queue: Promise.resolve(), nextPlayTime: 0,
      }
      sessionRef.current = session
      const socket = new WebSocket(url)
      session.socket = socket
      socket.binaryType = 'arraybuffer'
      capture.port.onmessage = ({ data }: MessageEvent<{ pcm: ArrayBuffer; peak: number }>) => {
        if (!active()) return
        setMicLevel(Math.min(1, data.peak * 3))
        if (socket.readyState === WebSocket.OPEN) {
          if (socket.bufferedAmount > 64000) {
            stopVoice()
            setNotice('Audio upload is too slow. Please reconnect the microphone.')
            return
          }
          socket.send(data.pcm)
        }
      }
      socket.onopen = () => {
        if (!active()) return
        setVoiceState('listening')
        setReplyMode('voice')
        setNotice('Listening — speak, then pause for a reply.')
      }
      socket.onmessage = event => {
        if (!active()) return
        if (event.data instanceof ArrayBuffer) { receiveAudio(session, event.data); return }
        let message: ServerEvent
        try { message = JSON.parse(event.data) } catch { return }
        switch (message.type) {
          case 'system': case 'status': case 'backchannel': case 'error': setNotice(message.text ?? ''); break
          case 'speech_start':
            flushAudio(session); setPlaying(false); setPartialText(''); setNotice('Speech detected — listening…'); break
          case 'speech_end': setNotice('Transcribing…'); break
          case 'partial_transcript': setPartialText(message.text ?? ''); break
          case 'transcript':
            setUserText(message.text ?? ''); setPartialText(''); setAssistantText(''); setBusy(true); break
          case 'llm_token': setAssistantText(text => text + (message.token ?? '')); break
          case 'llm_done': setAssistantText(message.text ?? ''); setBusy(false); break
          case 'tts_done': setNotice('Listening — ready for your next question.'); break
          case 'interrupt': flushAudio(session); setPlaying(false); setBusy(false); setNotice('Interrupted — listening.'); break
        }
      }
      socket.onclose = event => {
        if (!active()) return
        stopVoice()
        setNotice(`Voice connection closed (${event.code}). Click the microphone to reconnect.`)
      }
      socket.onerror = () => { if (active()) setNotice('Voice connection failed. Check the server and reconnect.') }
    } catch (error) {
      stream?.getTracks().forEach(track => track.stop())
      if (context && context.state !== 'closed') void context.close()
      if (active()) {
        stopVoice()
        setNotice(`Cannot start voice: ${String(error)}`)
      }
    } finally { if (active()) startingRef.current = false }
  }

  async function submitText() {
    const text = input.trim()
    if (!text || text.length > 2000) return
    stopVoice() // Typed replies must never play audio from an earlier voice turn.
    textRef.current?.abort()
    const controller = new AbortController()
    textRef.current = controller
    setReplyMode('text')
    setUserText(text)
    setInput('')
    setPartialText('')
    setAssistantText('')
    setBusy(true)
    setNotice('')
    try {
      const response = await fetch(endpoint('/chat/stream'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }), signal: controller.signal,
      })
      if (!response.ok || !response.body) throw new Error(`Text request failed (${response.status})`)
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let pending = ''
      const consume = (line: string) => {
        if (!line.startsWith('data:')) return
        const data = line.slice(5).trim()
        if (!data || data === '[DONE]') return
        const message = JSON.parse(data) as ServerEvent
        if (message.type === 'token' || message.type === 'llm_token') setAssistantText(current => current + (message.token ?? ''))
        if (message.type === 'llm_done' && message.text) setAssistantText(message.text)
        if (message.type === 'error') throw new Error(message.text ?? 'Text response failed')
      }
      while (true) {
        const { value, done } = await reader.read()
        if (controller.signal.aborted) return
        pending += decoder.decode(value, { stream: !done })
        const lines = pending.split('\n')
        pending = lines.pop() ?? ''
        lines.forEach(consume)
        if (done) { if (pending) consume(pending); break }
      }
    } catch (error) {
      if (!controller.signal.aborted) setNotice(String(error))
    } finally {
      if (textRef.current === controller) { textRef.current = null; setBusy(false) }
    }
  }

  function hangUp() {
    stopVoice()
    textRef.current?.abort()
    setAssistantOpen(false)
    setTextVisible(false)
    setNotice('')
    document.getElementById('assistant-launcher')?.focus()
  }

  return <Portfolio assistantOpen={assistantOpen} onAssistantToggle={() => {
    if (assistantOpen) { hangUp(); return }
    setAssistantOpen(true)
    setTextVisible(false)
    audioMutedRef.current = false
    setAudioMuted(false)
    void startVoice()
  }}><div className="assistant-interface">
    <section className="answer-area" aria-live="polite">
      {voiceState === 'listening' && <div className="status-message"><label htmlFor="mic-level">Microphone input </label><meter id="mic-level" min={0} max={1} value={micLevel} aria-label="Microphone input volume" /></div>}
      {userText && <article className="message user-message"><span>YOU</span><p>{userText}</p></article>}
      {partialText && <article className="partial-message"><span>LISTENING</span><p>{partialText}</p></article>}
      {assistantText && <article className="answer"><span className="answer-label">RESUMEVOICE · {replyMode === 'voice' ? (playing ? 'PLAYING AUDIO' : 'VOICE + TEXT') : 'TEXT'}</span><p>{assistantText}</p></article>}
      {notice && <div className="status-message">{notice}</div>}
      {busy && <p role="status">Preparing your reply…</p>}
    </section>
    {textVisible && <form className="composer" id="agent-text-composer" onSubmit={event => { event.preventDefault(); void submitText() }}>
      <textarea ref={inputRef} value={input} maxLength={2000} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void submitText() } }} placeholder="Ask about my work, experience, or projects…" rows={1} aria-label="Your message" />
      <button className="send-button" type="submit" disabled={!input.trim()} aria-label="Send text"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 14-7-5 14-2.7-5.3L5 12Z"/></svg></button>
    </form>}
    <div className="call-controls" aria-label="Agent call controls">
      <button type="button" className={voiceState !== 'off' ? 'active' : ''} aria-pressed={voiceState !== 'off'} onClick={() => { if (voiceState !== 'off') stopVoice(); else void startVoice() }} aria-label={voiceState !== 'off' ? 'Stop microphone' : 'Start microphone'}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z"/><path d="M18 11v1a6 6 0 0 1-12 0v-1M12 18v3M8 21h8"/></svg><span>{voiceState === 'starting' ? 'Connecting' : voiceState === 'listening' ? 'Mic on' : 'Mic off'}</span>
      </button>
      <button type="button" aria-label={audioMuted ? 'Unmute agent audio' : 'Mute agent audio'} aria-pressed={audioMuted} className={audioMuted ? 'active' : ''} onClick={() => {
        const muted = !audioMutedRef.current
        audioMutedRef.current = muted
        setAudioMuted(muted)
        if (sessionRef.current) sessionRef.current.playbackGain.gain.value = muted ? 0 : 1
      }}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4Z"/>{audioMuted ? <path d="m16 9 5 6m0-6-5 6"/> : <path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>}</svg><span>{audioMuted ? 'Unmute' : 'Mute'}</span></button>
      <button type="button" aria-label="Toggle text input" aria-expanded={textVisible} aria-controls="agent-text-composer" className={textVisible ? 'active' : ''} onClick={() => setTextVisible(!textVisible)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v13H9l-5 4Zm4 5h8m-8 4h5"/></svg><span>Text</span></button>
      <button type="button" className="hangup" aria-label="Hang up" onClick={hangUp}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 15v-4c5-5 13-5 18 0v4l-5-1v-3M8 11v3l-5 1"/></svg><span>Hang up</span></button>
    </div>
    <p className="hint">{voiceState === 'starting' ? 'Connecting microphone…' : voiceState === 'listening' ? 'Microphone on · Speak, then pause' : 'Type a message or press the microphone'}</p>
    {playbackBlocked && <button onClick={() => {
      sessionRef.current?.context.resume().then(() => setPlaybackBlocked(false)).catch(() => setNotice('Please enable browser audio playback.'))
    }}>Play response audio</button>}
  </div></Portfolio>
}

export default App
