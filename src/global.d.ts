// global types

// 百度地图GL版本全局类型声明
/// <reference types="bmapgl" />

declare module 'qrcode' {
  const QRCode: {
    toDataURL: (text: string, options?: Record<string, unknown>) => Promise<string>;
  };

  export default QRCode;
}
