interface Theologian {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
}

interface ChatPreview {
  _id: string;
  theologianId: string;
  firstMessage?: { content: string };
}
interface CreateChatResponse {
  insertedId: string;
}

const defaultTheologian: Theologian = {
  name: 'Unknown Theologian',
  description: '',
  imageUrl: '',
  _id: 'unknown',
};

interface Message {
  author: string;
  content: string;
}

interface ChatDetail {
  messages: Message[];
  theologianId: string;
}

export type { Theologian, ChatPreview, Message, ChatDetail, CreateChatResponse };

const fetchChats = (): Promise<ChatPreview[]> => fetch('/api/chats').then((response) => response.json());
const fetchTheologians = (): Promise<Theologian[]> => fetch('/api/theologians').then((response) => response.json());
const deleteChat = (id: string) => fetch(`/api/chat/${id}`, { method: 'DELETE' });
const createChat = (selectedTheologian: string): Promise<CreateChatResponse> =>
  fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ theologianId: selectedTheologian }),
  }).then((response) => response.json());

export { defaultTheologian, fetchChats, fetchTheologians, deleteChat, createChat };
