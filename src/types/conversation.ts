import { Message } from './message';

export interface Conversation {
  id: string;
  title: string;
  description?: string;
  messages: Message[];
  createdAt?: Date;
  updatedAt?: Date;
}