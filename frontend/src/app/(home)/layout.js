
import StreamVideoProvider from '@/app/providers/StreamVideoProvider';

const HomeLayout = ({ children }) => {
  return (
    <>
      <StreamVideoProvider>{children}</StreamVideoProvider>
    </>
  );
};

export default HomeLayout;