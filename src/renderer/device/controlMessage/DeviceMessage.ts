import { stringToUtf8ByteArray,utf8ByteArrayToString } from '../js/Util'
const {Buffer} = require('buffer/')

export default class DeviceMessage {
    public static TYPE_CLIPBOARD = 0;
    public static TYPE_PUSH_RESPONSE = 101;

    public static readonly MAGIC_BYTES_MESSAGE = stringToUtf8ByteArray('scrcpy_message');

    constructor(public readonly type: number, protected readonly buffer: Buffer) {}

    public static fromBuffer(data: ArrayBuffer): DeviceMessage {
        const magicSize = this.MAGIC_BYTES_MESSAGE.length;
        const buffer = Buffer.from(data, magicSize, data.byteLength - magicSize);
        const type = buffer.readUInt8(0);
        return new DeviceMessage(type, buffer);
    }

    public getText(): string {
        if (this.type !== DeviceMessage.TYPE_CLIPBOARD) {
            throw TypeError(`Wrong message type: ${this.type}`);
        }
        if (!this.buffer) {
            throw Error('Empty buffer');
        }
        let offset = 1;
        const length = this.buffer.readInt32BE(offset);
        offset += 4;
        const textBytes = this.buffer.slice(offset, offset + length);
        return utf8ByteArrayToString(textBytes);
    }

    public getPushStats(): { id: number; result: number } {
        if (this.type !== DeviceMessage.TYPE_PUSH_RESPONSE) {
            throw TypeError(`Wrong message type: ${this.type}`);
        }
        if (!this.buffer) {
            throw Error('Empty buffer');
        }
        const id = this.buffer.readInt16BE(1);
        const result = this.buffer.readInt8(3);
        return { id, result };
    }

    public toString(): string {
        let desc: string;
        if (this.type === DeviceMessage.TYPE_CLIPBOARD && this.buffer) {
            desc = `, text=[${this.getText()}]`;
        } else {
            desc = this.buffer ? `, buffer=[${this.buffer.join(',')}]` : '';
        }
        return `DeviceMessage{type=${this.type}${desc}}`;
    }
}
