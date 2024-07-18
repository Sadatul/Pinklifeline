
import StreamVideoProvider from '@/app/providers/StreamVideoProvider';
import { SessionContextProvider } from "@/app/context/sessionContext"

const HomeLayout = ({ children }) => {
  return (
    <>
      <SessionContextProvider>
        {/* <StreamVideoProvider> */}
        {children}
        {/* </StreamVideoProvider> */}
      </SessionContextProvider>
    </>
  );
};

export default HomeLayout;