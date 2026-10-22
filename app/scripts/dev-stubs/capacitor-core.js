// Stub cho chạy thử trên trình duyệt (không dùng khi build APK).
export const Capacitor = { isNativePlatform: () => false, getPlatform: () => 'web' };
export const registerPlugin = () => new Proxy({}, { get: () => async () => { throw new Error('Không có trên web'); } });
