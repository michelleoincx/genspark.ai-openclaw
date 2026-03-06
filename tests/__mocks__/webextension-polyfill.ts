const browser = {
  runtime: {
    sendMessage: jest.fn().mockResolvedValue({}),
    onMessage: { addListener: jest.fn() },
    onInstalled: { addListener: jest.fn() },
    getManifest: jest.fn().mockReturnValue({ version: '1.0.0' }),
  },
  storage: {
    local: {
      get: jest.fn().mockResolvedValue({}),
      set: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined),
    },
  },
  tabs: {
    query: jest.fn().mockResolvedValue([]),
    reload: jest.fn().mockResolvedValue(undefined),
    create: jest.fn().mockResolvedValue({}),
  },
  webRequest: {
    onBeforeSendHeaders: { addListener: jest.fn() },
    onHeadersReceived: { addListener: jest.fn() },
  },
};

export default browser;
