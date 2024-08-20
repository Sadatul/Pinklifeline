import { cn } from '@/lib/utils';
import { emptyAvatar } from '@/utils/constants';
import Image from 'next/image';

const Avatar = ({ avatarImgScr, size = 96, className }) => {
  return (
    <Image
      src={avatarImgScr || emptyAvatar}
      alt="Avatar"
      width={size}
      height={size}
      loading='lazy'
      className={cn('rounded-full border border-gray-300', className)}
    />
  );
};
export default Avatar;