export default {
  toBuffer(setting) {
    const buffer = new Buffer(setting.PAYLOAD_LENGTH + 1)
    let offset = 0
    offset = buffer.writeUInt8(setting.type, offset)
    offset = buffer.writeUInt8(setting.action, offset)
    offset = buffer.writeUInt32BE(0, offset) // pointerId is `long` (8 bytes) on java side
    offset = buffer.writeUInt32BE(setting.pointerId, offset)
    offset = buffer.writeUInt32BE(setting.position.point.x, offset)
    offset = buffer.writeUInt32BE(setting.position.point.y, offset)
    offset = buffer.writeUInt16BE(setting.position.screenSize.width, offset)
    offset = buffer.writeUInt16BE(setting.position.screenSize.height, offset)
    offset = buffer.writeUInt16BE(setting.pressure * setting.MAX_PRESSURE_VALUE, offset)
    buffer.writeUInt32BE(setting.buttons, offset)
    return buffer
  }
}
