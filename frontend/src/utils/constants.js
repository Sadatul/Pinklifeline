const baseUrl = 'http://localhost:8080';
export const loginUrlReq = `${baseUrl}/v1/auth`;
export const registerUrlReq = `${baseUrl}/v1/auth/register`;
export const otpUrlReq = `${baseUrl}/v1/auth/verify`;
export const userInfoRegUrlReq = (id, role) => { return `${baseUrl}/v1/infos/${role}/${id}` };
export const stompBrokerUrl = `ws://localhost:8080/ws`
export const subscribeMessageUrl = (id) => { return `/user/${id}/queue/messages` }
export const subscribeErrorUrl = (id) => { return `/user/${id}/queue/errors` }
export const messageSendUrl = `/app/chat`
export const getChatsUrl = (id) => { return `${baseUrl}/v1/chat/${id}` }
export const getMessagesUrl = (room_id) => { return `${baseUrl}/v1/chat/messages/${room_id}` }

export const testingAvatar = "https://github.com/shadcn.png"

export const roles = {
    basicUser: "ROLE_BASICUSER",
    patient: "ROLE_PATIENT",
    doctor: "ROLE_DOCTOR",
    nurse: "ROLE_NURSE",
}

export const pagePaths = {
    login: "/reglogin",
    register: "/reglogin",
    verifyotp: (email) => {
        if (email) {
            return `/verifyotp?email=${email}`
        }
        return "/verifyotp"
    },
    userdetails: "/userdetails",
    inbox : "/inbox",
    inboxChat: (chatId) => { return `/inbox/${chatId}` },
}


export function getSearchParams(){
    
}

//formats used in different places
//message format added `?FROM={senderID}` to the message
// chat room link format `{roomid}chat{senderID}`