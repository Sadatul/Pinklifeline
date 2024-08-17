import { cn } from '@/lib/utils';
import Image from 'next/image';

const Avatar = ({ avatarImgScr, size = 96, className }) => {
  return (
    <Image
      src={avatarImgScr}
      alt="Avatar"
      width={size}
      height={size}
      loading='lazy'
      className={cn('rounded-full', className)}
    />
  );
};
export default Avatar;