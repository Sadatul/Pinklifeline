import { cn } from '@/lib/utils';
import Image from 'next/image';

const Avatar = ({avatarImgScr, size = 96, className}) => {
  return (
    <div className={cn("rounded-full overflow-hidden flex justify-center items-center bg-white", className)}>
      <Image
        src={avatarImgScr} 
        alt="Avatar" 
        width={size} 
        height={size}
        loading='lazy'
      />
    </div>
  );
};
export default Avatar;