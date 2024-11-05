import Story1 from '@/shared/assets/icons/stories1.png';
import Story2 from '@/shared/assets/icons/stories2.png';
import Story3 from '@/shared/assets/icons/stories3.png';
import Story4 from '@/shared/assets/icons/stories4.png';

export interface Story {
    description: string;
    image: any;
    highlights: string[];
  }

export const stories = [
  {
    description: "YoYo Swap is a convenient platform for exchanging cryptocurrency assets on leading networks",
    image: Story1,
    highlights: ['exchanging cryptocurrency', 'assets']
  },
  {
    description: "Create unlimited wallets and safely store your assets",
    image: Story2,
    highlights: ['safely store']
  },
  {
    description: "Earn up to 30% referral commission. Develop income in YoYo Swap!",
    image: Story3,
    highlights: ['up to 30%', 'referral commission']
  },
  {
    description: "Welcome to YoYo Swap!",
    image: Story4,
    highlights: ['YoYo Swap']
  }
];