import { ChatDetail, Theologian, ChatPreview, CreateChatResponse } from './shared';

function getChat(chatId: string): Promise<ChatDetail> {
  return fetch('/api/chat/' + chatId, { credentials: 'include' }).then((response) => response.json());
}

function fetchOnGoingMessage(chatId: string): Promise<boolean> {
  return fetch('/api/chat/job/' + chatId, { credentials: 'include' })
    .then((response) => response.json())
    .then((result) => !!result);
}

async function postToChat(chatId: string, newMessage: string): Promise<void> {
  await fetch('/api/chat/' + chatId, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: newMessage }),
  });
}

const fetchChats = (): Promise<ChatPreview[]> =>
  fetch('/api/chats', { credentials: 'include' }).then((response) => response.json());

const fetchTheologians = (): Promise<Theologian[]> => fetch('/api/theologians').then((response) => response.json());
const deleteChat = (id: string) =>
  fetch(`/api/chat/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
const createChat = (selectedTheologian: string): Promise<CreateChatResponse> =>
  fetch('/api/chat', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ theologianId: selectedTheologian }),
  }).then((response) => response.json());

export { getChat, fetchChats, fetchTheologians, fetchOnGoingMessage, deleteChat, createChat, postToChat };
