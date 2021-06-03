export default {
  fromBuffer(buffer) {
    const left = buffer.readInt32BE(0)
    const top = buffer.readInt32BE(4)
    const right = buffer.readInt32BE(8)
    const bottom = buffer.readInt32BE(12)
    const width = buffer.readInt32BE(16)
    const height = buffer.readInt32BE(20)
    const deviceRotation = buffer.readUInt8(24)

    return {
      contentRect: { left, top, right, bottom },
      videoSize: { width, height },
      deviceRotation: deviceRotation
    }
  }
}
