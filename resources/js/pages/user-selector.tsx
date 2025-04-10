import { Image } from '@radix-ui/react-avatar';
import React from 'react';

export interface User {
  id: string;
  name: string;
  avatar: string;
  color: string;
  tokens: number;
  pin?: string;
}

interface UserSelectorProps {
  users: User[];
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
}

export const UserSelector: React.FC<UserSelectorProps> = ({ users, selectedUser, onSelectUser }) => {
  return (
    <div className="flex flex-wrap gap-3">
      {users.map((user) => (
        <div
          key={user.id}
          className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg p-2 transition-all ${
            selectedUser?.id === user.id ? 'bg-primary-100 ring-primary-500 ring-2' : 'bg-default-100 hover:bg-default-200'
          }`}
          onClick={() => onSelectUser(user)}
        >
          <Image src={user.avatar} className="h-16 w-16" />
          <span className="text-sm font-medium">{user.name}</span>
        </div>
      ))}
    </div>
  );
};
