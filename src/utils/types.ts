export type MessageType =
  | 'GET_STATUS'
  | 'SET_OPTION'
  | 'RELOAD_GENSPARK'
  | 'GET_VERSION';

export interface BaseMessage {
  type: MessageType;
}

export interface GetStatusMessage extends BaseMessage {
  type: 'GET_STATUS';
}

export interface SetOptionMessage extends BaseMessage {
  type: 'SET_OPTION';
  key: string;
  value: unknown;
}

export interface ReloadMessage extends BaseMessage {
  type: 'RELOAD_GENSPARK';
}

export interface GetVersionMessage extends BaseMessage {
  type: 'GET_VERSION';
}

export type Message =
  | GetStatusMessage
  | SetOptionMessage
  | ReloadMessage
  | GetVersionMessage;

export interface ExtensionStatus {
  enabled: boolean;
  bypassRateLimit: boolean;
  unlockSearch: boolean;
  unlockAgents: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
