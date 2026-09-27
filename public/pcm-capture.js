// Runs at the AudioContext's 16 kHz sample rate.
class PcmCapture extends AudioWorkletProcessor {
  constructor() {
    super()
    this.samples = new Int16Array(4096)
    this.offset = 0
    this.peak = 0
  }
  process(inputs) {
    const input = inputs[0]?.[0]
    if (!input) return true
    for (const value of input) {
      const sample = Math.max(-1, Math.min(1, value))
      this.peak = Math.max(this.peak, Math.abs(sample))
      this.samples[this.offset++] = sample < 0 ? sample * 32768 : sample * 32767
      if (this.offset === this.samples.length) {
        this.port.postMessage({ pcm: this.samples.buffer, peak: this.peak }, [this.samples.buffer])
        this.samples = new Int16Array(4096)
        this.offset = 0
        this.peak = 0
      }
    }
    return true
  }
}
registerProcessor('pcm-capture', PcmCapture)
