import * as fileType from 'file-type';
import * as fs from 'fs';

import { Stream, Duplex } from 'stream';

export function bufferToStream(buffer: Buffer): Duplex {
  const stream = new Duplex();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

export function streamToBuffer(stream: Stream): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const buffers: any[] = [];
    stream.on('error', reject);
    stream.on('data', (data: any) => buffers.push(data));
    stream.on('end', () => resolve(Buffer.concat(buffers)));
  });
}

export function isValidFormatEncode(buffer: Buffer): boolean {
  const type = fileType(buffer);
  return type && (type.mime === 'image/jpeg' || type.mime === "image/png");
}

export function isValidGuid(guid: string): boolean {
  const guidPattern: RegExp = /^[0-9a-f]{8}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{12,13}$/i;
  return guidPattern.test(guid);
}

export function createImageKey(guid: string): string { 
  return isValidGuid(guid) ? 'rtvimg::' + guid : ''; 
}

export function createCompressionkey(guid: string): string { 
  return isValidGuid(guid) ? guid + '::c' : '';
}

export function isValidRotationValue(rotateValue: number): boolean {
  return rotateValue === 90 || rotateValue === 270;
}

export function isValidCompressionFactorValue(compressionFactor: number): boolean {
  return compressionFactor >= 0 && compressionFactor <= 10
}

export function decodeBase64Image(base64Image: string): Buffer {
  return new Buffer(base64Image, 'base64');
}

