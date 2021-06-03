export default {
  toBuffer(data) {
    const buffer = new Buffer(data.PAYLOAD_LENGTH + 1)
    let offset = 0
    offset = buffer.writeInt8(data.type, offset)
    offset = buffer.writeInt8(data.action, offset)
    offset = buffer.writeInt32BE(data.keycode, offset)
    offset = buffer.writeInt32BE(data.repeat, offset)
    buffer.writeInt32BE(data.metaState, offset)
    return buffer
  }
}
