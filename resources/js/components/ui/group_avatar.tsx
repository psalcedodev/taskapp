import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import React from 'react';

// Helper to get initials from a name
const getInitials = (name: string): string => {
  if (!name) return '?';
  const names = name.split(' ').filter(Boolean);
  if (names.length === 0) return '?';
  // Use first letter of the first name and first letter of the last name
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  // Fallback for single names or initials
  return names[0].substring(0, 2).toUpperCase();
};

// Define the expected shape of a user object
interface UserInfo {
  id: string | number;
  avatar?: string | null;
  name: string;
}

export interface GroupAvatarProps {
  users: UserInfo[];
  maxDisplayed?: number;
  size?: string; // e.g., 'h-8 w-8'
  className?: string; // For the container div
}

export const GroupAvatar: React.FC<GroupAvatarProps> = ({
  users = [],
  maxDisplayed = 3,
  size = 'h-10 w-10', // Default size
  className,
}) => {
  const displayedUsers = users.slice(0, maxDisplayed);
  const remainingCount = users.length - displayedUsers.length;

  return (
    <div className={cn('flex items-center -space-x-2', className)}>
      {/* Overlap avatars */}
      {displayedUsers.map((user) => (
        <Avatar
          key={user.id}
          className={cn(size, 'border-background border-2 dark:border-gray-800')} // Size and border for overlap
        >
          <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
      ))}
      {remainingCount > 0 && (
        <Avatar
          className={cn(size, 'border-background border-2 dark:border-gray-800')} // Size and border
        >
          {/* Display remaining count in fallback */}
          <AvatarFallback>+{remainingCount}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
