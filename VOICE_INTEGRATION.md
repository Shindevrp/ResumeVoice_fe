# ResumeVoice integration

This frontend now matches the backend `/ui` embedded by Streamlit:

- Voice: `/ws/audio`, binary 16 kHz mono signed PCM16 input in 4096-sample blocks. AudioWorklet captures samples without main-thread audio processing.
- Voice output: JSON transcript/token events plus binary encoded audio buffers, decoded and played sequentially through Web Audio.
- Text: `POST /chat/stream` with `{"message":"..."}`, consuming SSE tokens once. Sending text stops the microphone and clears queued voice playback.

Set `VITE_RESUME_VOICE_API_URL` to the backend origin. The existing `VITE_RESUME_VOICE_SIGNAL_URL` is accepted for compatibility; only its origin is used.

During development, Vite proxies `/resumevoice-api/chat/stream` to avoid cross-origin HTTP requests. For a production deployment, enable the frontend origin in backend CORS or put the frontend and backend behind the same origin. HTTPS deployments require a secure backend and WebSocket endpoint. Microphone capture requires localhost or HTTPS.

Voice is no longer transported through `/ws/signal` / WebRTC. The working Streamlit UI uses the PCM WebSocket route instead.
