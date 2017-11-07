declare module LeanCloudRealtime {
  interface AVUser {
    getSessionToken(): string;
  }

  export class Realtime extends EventEmitter {
    constructor(options: { appId: string, region?: string, pushOfflineMessages?: boolean, noBinary?: boolean, ssl?: boolean, plugins?: Array<Plugin> });
    createIMClient(client: string|AVUser, clientOptions?: { signatureFactory?: Function, conversationSignatureFactory?: Function, tag?: string }): Promise<IMClient>;
    static defineConversationProperty(prop: string, descriptor?: Object);
    register(messageClass: AVMessage[]);
    retry();
  }

  class IMClient extends EventEmitter {
    id: string;
    close(): Promise<void>;
    createConversation(options: { members?: string[], name?: string, transient?: boolean, unique?: boolean, [key: string]: any }): Promise<ConversationBase>;
    createChatRoom(options: { name?: string, [key: string]: any }): Promise<ChatRoom>;
    getConversation(id: string, noCache?: boolean): Promise<ConversationBase>;
    getQuery(): ConversationQuery;
    markAllAsRead(conversations: ConversationBase[]): Promise<Array<ConversationBase>>;
    ping(clientIds: string[]): Promise<Array<string>>;
    parseMessage(json: Object): Promise<AVMessage>;
    parseConversation(json: Object): Promise<ConversationBase>;
  }

  class ConversationQuery {
    addAscending(key: string): this;
    addDescending(key: string): this;
    ascending(key: string): this;
    compact(enabled?: boolean): this;
    containedIn(key: string, values: any): this;
    contains(key: string, subString: string): this;
    containsAll(key: string, values: any): this;
    containsMembers(peerIds: string[]): this;
    descending(key: string): this;
    doesNotExist(key: string): this;
    endsWith(key: string, suffix: string): this;
    equalTo(key: string, value: any): this;
    exists(key: string): this;
    find(): Promise<Array<ConversationBase>>;
    greaterThan(key: string, value: any): this;
    greaterThanOrEqualTo(key: string, value: any): this;
    lessThan(key: string, value: any): this;
    lessThanOrEqualTo(key: string, value: any): this;
    limit(limit: number): this;
    matches(key: string, regex: string): this;
    notContainsIn(key: string, values: any): this;
    notEqualTo(key: string, value: any): this;
    sizeEqualTo(key: string, length: number): this;
    skip(skip: number): this;
    startsWith(key: string, prefix: string): this;
    withLastMessagesRefreshed(enabled?: boolean): this;
    withMembers(peerIds: string[], includeSelf: boolean): this;
  }
  /**
  *  对话
  */
  class ConversationBase extends EventEmitter {
    id: string;
    name: string;
    creator: string;
    createdAt: Date;
    updatedAt: Date;
    lastMessage?: Message;
    lastMessageAt?: Date;
    lastDeliveredAt?: Date;
    lastReadAt?: Date;
    unreadMessagesCount: Number;
    members: string[];
    muted: boolean;
    mutedMembers?: string[];
    system: boolean;
    transient: boolean;
    readonly unreadMessagesMentioned: Boolean;
    [key: string]: any;
    // constructor();
    add(members: string[]): Promise<this>;
    count(): Promise<number>;
    createMessagesIterator(option: { limit?: number, beforeTime?: Date, beforeMessageId?: string });
    fetch(): Promise<this>;
    get(key: string): any;
    join(): Promise<this>;
    read(): Promise<this>;
    fetchReceiptTimestamps(): Promise<this>;
    mute(): Promise<this>;
    queryMessages(options: { beforeTime?: Date, beforeMessageId?: string, afterTime?: Date, afterMessageId?: string, limit?: number }): Promise<Array<Message>>;
    queryMessages(options: { startTime?: Date, startMessageId?: string, startClosed?: boolean, endTime?: Date, endMessageId?: string, endClosed?: boolean, limit?: number, direction?: MessageQueryDirection }): Promise<Array<Message>>;
    quit(): Promise<this>;
    remove(clientIds: string[]): Promise<this>;
    save(): Promise<this>;
    send<T extends Message>(message: T, options?: { pushData?: Object, priority?: MessagePriority, receipt?: boolean, transient?: boolean, will?: boolean }): Promise<T>;
    set(key: string, value: any): this;
    unmute(): Promise<this>;
    update<T extends Message>(message: MessagePointer, newMessage: T): Promise<T>;
    recall(message: MessagePointer): Promise<RecalledMessage>;
    toJSON(): Object;
    toFullJSON(): Object;
  }

  export class Conversation extends ConversationBase {}
  export class ChatRoom extends ConversationBase {}
  export class ServiceConversation extends ConversationBase {}

  type MessagePointer = Message | {id: string, timestamp: Date|number};

  type Payload = Object | String | ArrayBuffer;

  export interface AVMessage {
    getPayload(): Payload;
  }

  export class Message implements AVMessage {
    constructor(content: any);
    cid: string;
    deliveredAt?: Date;
    updatedAt: Date;
    from: string;
    id: string;
    status: MessageStatus;
    timestamp: Date;
    readonly mentioned: Boolean;
    mentionList: string[];
    mentionedAll: Boolean;
    static parse(json: Object, message: Message): Message;
    static validate(): boolean;
    getPayload(): Payload;
    toJSON(): Object;
    toFullJSON(): Object;
    setMentionList(mentionList: string[]): this;
    getMentionList(): string[];
    mentionAll(): this;
  }

  // 二进制消息
  export class BinaryMessage extends Message {
    constructor(buffer: ArrayBuffer);
    buffer: ArrayBuffer;
  }

  // 富媒体消息
  export class TypedMessage extends Message {
    attributes: {};
    text: string;
    title: string;
    type: number;
    getAttributes(): {};
    getText(): string;
    setAttributes(attributes: {}): this;
  }

  // 内置文本消息类
  export class TextMessage extends TypedMessage {
    constructor(text?: string);
  }

  export class RecalledMessage extends TypedMessage {}

  class EventEmitter {
    on(evt: string, listener: Function): this;
    once(evt: string, listener: Function): this;
    off(evt: string, listener: Function): this;
    emit(evt: string, ...args: any[]): boolean;
  }

  interface Middleware<T> {
    (target: T): T
  }
  interface Decorator<T> {
    (target: T): void
  }

  export interface Plugin {
    name?: string;
    beforeMessageParse?: Middleware<AVMessage>;
    afterMessageParse?: Middleware<AVMessage>;
    beforeMessageDispatch?: (message: AVMessage) => boolean;
    messageClasses?: AVMessage[];
    onConversationCreate?: Decorator<ConversationBase>;
    onIMClientCreate?: Decorator<IMClient>;
    onRealtimeCreate?: Decorator<Realtime>;
  }

  export enum MessagePriority {
    LOW,
    NORMAL,
    HIGH,
  }

  export enum MessageStatus {
    NONE,
    SENDING,
    SENT,
    DELIVERED,
    FAILED,
  }

  export enum MessageQueryDirection {
    NEW_TO_OLD,
    OLD_TO_NEW,
  }

  export enum ErrorCode {
    CLOSE_NORMAL,
    CLOSE_ABNORMAL,
    APP_NOT_AVAILABLE,
    INVALID_LOGIN,
    SESSION_REQUIRED,
    READ_TIMEOUT,
    LOGIN_TIMEOUT,
    FRAME_TOO_LONG,
    INVALID_ORIGIN,
    SESSION_CONFLICT,
    SESSION_TOKEN_EXPIRED,
    INTERNAL_ERROR,
    SEND_MESSAGE_TIMEOUT,
    CONVERSATION_SIGNATURE_FAILED,
    CONVERSATION_NOT_FOUND,
    CONVERSATION_FULL,
    CONVERSATION_REJECTED_BY_APP,
    CONVERSATION_UPDATE_FAILED,
    CONVERSATION_READ_ONLY,
    CONVERSATION_NOT_ALLOWED,
    INVALID_MESSAGING_TARGET,
    MESSAGE_REJECTED_BY_APP,
  }
  
  export function messageType(type: number): Function
  export function messageField(fields: string[]): Function
}

export = LeanCloudRealtime;
