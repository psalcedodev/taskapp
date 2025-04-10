import { User } from '../types/user';

export const users: User[] = [
  {
    id: 'user1',
    name: 'Emma',
    avatar: 'https://img.heroui.chat/image/avatar?w=200&h=200&u=1',
    pin: '1234',
    tokens: 200,
    color: 'primary',
  },
  {
    id: 'user2',
    name: 'Noah',
    avatar: 'https://img.heroui.chat/image/avatar?w=200&h=200&u=2',
    pin: '5678',
    tokens: 150,
    color: 'secondary',
  },
  {
    id: 'user3',
    name: 'Olivia',
    avatar: 'https://img.heroui.chat/image/avatar?w=200&h=200&u=3',
    pin: '9012',
    tokens: 175,
    color: 'success',
  },
];
