import { ChatDetail, Theologian, ChatPreview, CreateChatResponse } from './shared';

function getChat(chatId: string, accessToken: string): Promise<ChatDetail> {
  return fetch('/api/chat/' + chatId, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((response) => response.json());
}

async function postToChat(chatId: string, newMessage: string, accessToken: string): Promise<void> {
  await fetch('/api/chat/' + chatId, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ message: newMessage }),
  });
}

const fetchChats = (accessToken: string): Promise<ChatPreview[]> =>
  fetch('/api/chats', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((response) => response.json());
const fetchTheologians = (): Promise<Theologian[]> => fetch('/api/theologians').then((response) => response.json());
const deleteChat = (id: string, accessToken: string) =>
  fetch(`/api/chat/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
const createChat = (selectedTheologian: string, accessToken: string): Promise<CreateChatResponse> =>
  fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ theologianId: selectedTheologian }),
  }).then((response) => response.json());

export { getChat, fetchChats, fetchTheologians, deleteChat, createChat, postToChat };
