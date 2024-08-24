import { cn } from '@/lib/utils';
import { emptyAvatar } from '@/utils/constants';
import Image from 'next/image';

const Avatar = ({ avatarImgSrc, size = 96, className }) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-full border border-gray-300',
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={avatarImgSrc || emptyAvatar}
        alt="Avatar"
        layout="fill"
        objectFit="cover"
        className="object-cover object-center"
      />
    </div>
  );
};

export default Avatar;
