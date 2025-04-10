import { Card, CardFooter } from '@/components/ui/card';
import { Image } from '@radix-ui/react-avatar';
import { BookOpen, Coins, Gamepad, Gift, PartyPopper, Puzzle } from 'lucide-react';
import React from 'react';
export interface Reward {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: 'toys' | 'games' | 'books' | 'activities';
}

interface RewardCardProps {
  reward: Reward;
  onSelect: () => void;
}

export const RewardCard: React.FC<RewardCardProps> = ({ reward, onSelect }) => {
  const getCategoryIcon = () => {
    switch (reward.category) {
      case 'toys':
        return <Puzzle />;
      case 'games':
        return <Gamepad />;
      case 'books':
        return <BookOpen />;
      case 'activities':
        return <PartyPopper />;
      default:
        return <Gift />;
    }
  };

  return (
    <Card className="w-full">
      <div className="overflow-hidden p-0">
        <Image alt={reward.title} className="h-48 w-full object-cover" src={reward.image} />
      </div>
      <CardFooter className="text-small flex flex-col items-start gap-1">
        <div className="flex w-full justify-between">
          <b className="text-lg">{reward.title}</b>
          <div className="bg-warning-100 text-warning-600 flex items-center gap-1 rounded-full px-2 py-1">
            <Coins />
            <span className="font-bold">{reward.price}</span>
          </div>
        </div>
        <p className="text-default-500">{reward.description}</p>
        <div className="mt-1 flex items-center gap-1">
          {getCategoryIcon()}
          <span className="text-default-500 capitalize">{reward.category}</span>
        </div>
      </CardFooter>
    </Card>
  );
};
