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

function ping() {
  fetch(window.location.origin + window.location.pathname + '/____reserved/_ping');
}

export type { Theologian, ChatPreview, Message, ChatDetail, CreateChatResponse };

export { defaultTheologian, ping };
