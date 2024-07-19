const baseUrl = 'http://localhost:8080';
export const loginUrlReq = `${baseUrl}/v1/auth`;
export const registerUrlReq = `${baseUrl}/v1/auth/register`;
export const otpUrlReq = `${baseUrl}/v1/auth/verify`;
export const userInfoRegUrlReq = (id, role) => { return `${baseUrl}/v1/infos/${role}/${id}` };
export const stompBrokerUrl = `ws://localhost:8080/ws`
export const subscribeMessageUrl = (id) => { return `/user/${id}/queue/messages` }
export const livePrescriptionSubscribe = (id) => { return `/user/${id}/queue/live-prescription` }
export const livePrescriptionSubscribeErrors = (id) => { return `/user/${id}/queue/live-prescription/errors` }
export const livePrescriptionSendUrl = `/app/live-prescription`
export const subscribeErrorUrl = (id) => { return `/user/${id}/queue/errors` }
export const messageSendUrl = `/app/chat`
export const getChatsUrl = (id) => { return `${baseUrl}/v1/chat/${id}` }
export const getMessagesUrl = (room_id) => { return `${baseUrl}/v1/chat/messages/${room_id}` }
export const updateProfilePictureUrl = (id) => { return `${baseUrl}/v1/infos/profile_picture/${id}` }
export const addConsultationLocationUrl = (id) => { return `${baseUrl}/v1/ROLE_DOCTOR/${id}/locations` }
export const updateConsultationLocationUrl = (doctor_id, location_id) => { return `${baseUrl}/v1/ROLE_DOCTOR/${doctor_id}/locations/${location_id}` }
export const getNearByUsers = (id) => { return `${baseUrl}/v1/ROLE_PATIENT/nearby/${id}` }
export const updateUserDetailsUrl = (id, role) => { return `${baseUrl}/v1/infos/${role}/${id}` }
export const getConsultationLocations = (doc_id) => { return `${baseUrl}/v1/ROLE_DOCTOR/${doc_id}/locations` }
export const addReview = (userId) => { return `${baseUrl}/v1/reviews/doctor/${userId}` }
export const updateDoctorReview = (userId, review_id) => { return `${baseUrl}/v1/reviews/doctor/${userId}/${review_id}` }
export const deleteDoctorReview = (userId, review_id) => { return `${baseUrl}/v1/reviews/doctor/${userId}/${review_id}` }
export const addAppointment = `${baseUrl}/v1/appointments`
export const joinVideoCall = `${baseUrl}/v1/online-meeting/join`
// export const addConsultationLocationUrl = (id) => { return `/api/userForm` }
export const locationOnline = "ONLINE"
export const locationResolution = 8

export const testingAvatar = "https://www.gosfordpark-coventry.org.uk/wp-content/uploads/blank-avatar.png"
export const avatarAang = "https://sm.ign.com/t/ign_nordic/cover/a/avatar-gen/avatar-generations_prsz.300.jpg"

export const messageImageUploaPath = (roomId, userId, fileName) => { return `messages/images/room_${roomId}/sender_${userId}/${new Date().toISOString()}/${fileName}` }

export const sessionDataItem = "sessionData"

export const roles = {
    basicUser: "ROLE_BASICUSER",
    patient: "ROLE_PATIENT",
    doctor: "ROLE_DOCTOR",
    nurse: "ROLE_NURSE",
    doctorProfile: "doctor"
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
    inbox: "/inbox",
    inboxChat: (chatId) => { return `/inbox/${chatId}` },
    dashboard: "/dashboard",
}



//formats used in different places
//message format added `?FROM={senderID}` to the message
// chat room link format `{roomid}chat{senderID}`