import { PatientLivePrescriptionPage } from "@/app/components/livePrescription";

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
export const acceptAppointmentUrl = (appointment_id) => { return `${baseUrl}/v1/appointments/${appointment_id}/accept` }
export const makePaymentUrl = (appointment_id) => { return `${baseUrl}/v1/payment/appointment/${appointment_id}/initiate` }
export const getAppointmentsUrl = `${baseUrl}/v1/appointments`
export const joinVideoCall = `${baseUrl}/v1/online-meeting/join`
export const closeVideoCall = `${baseUrl}/v1/online-meeting/close`
export const cancelAppointmentUrl = (appointment_id) => { return `${baseUrl}/v1/appointments/${appointment_id}/cancel` }
export const declineAppointmentUrl = (appointment_id) => { return `${baseUrl}/v1/appointments/${appointment_id}/decline` }
export const getDoctorProfileDetailsUrl = (doc_id) => { return `${baseUrl}/v1/infos/guest/doctor/${doc_id}` }
export const getUserProfileDetails = (id) => { return `${baseUrl}/v1/infos/guest/basic/${id}` }
export const getDoctorProfileDetailsUrlLocations = (doc_id) => { return `${baseUrl}/v1/ROLE_DOCTOR/${doc_id}/locations` }
export const getDoctorProfileDetailsUrlReviews = (doc_id) => { return `${baseUrl}/v1/reviews/doctor/${doc_id}` }
export const getVideoCallToekn = `${baseUrl}/v1/meeting/user/token`
export const createOnlineMeetingUrl = `${baseUrl}/v1/online-meeting/start`
export const validateTransactionUrl = (appointment_id, transactionId) => { return `${baseUrl}/v1/payment/appointment/${appointment_id}/validate?transId=${transactionId}` }
export const addReportUrl = `${baseUrl}/v1/reports`
export const updateReportUrl = (reportId) => { return `${baseUrl}/v1/reports/${reportId}` }
export const shareReportUrl = `${baseUrl}/v1/reports/share`

// export const addConsultationLocationUrl = (id) => { return `/api/userForm` }
export const locationOnline = "ONLINE"
export const locationResolution = 8

export const dummyAvatar = (name) => { return `https://getstream.io/random_svg/?name=${name}` }
export const testingAvatar = "https://www.gosfordpark-coventry.org.uk/wp-content/uploads/blank-avatar.png"
export const avatarAang = "https://sm.ign.com/t/ign_nordic/cover/a/avatar-gen/avatar-generations_prsz.300.jpg"
export const emptyAvatar = "/emptyAvatar.png"

export const messageImageUploaPath = (roomId, userId, fileName) => { return `messages/images/room_${roomId}/sender_${userId}/${new Date().toISOString()}/${fileName}` }

export const sessionDataItem = "sessionData"

export const roles = {
    basicUser: "ROLE_BASICUSER",
    patient: "ROLE_PATIENT",
    doctor: "ROLE_DOCTOR",
    nurse: "ROLE_NURSE",
    doctorProfile: "doctor"
}

export const appointmentStatus = {
    running: "RUNNING",
    requested: "REQUESTED",
    accepted: "ACCEPTED",
    finished: "FINISHED",
    cancelled: "CANCELLED",
    declined: "DECLINED"
}

export const transactionStatus = {
    success: "SUCCESS",
    failed: "FAILED",
    pending: "PENDING"
}

export function cleanString(str) {
    if (!str) {
        return null
    }
    return str.trim().replace(/\s+/g, ' ');
}

export function generateFormattedDate(date) {
    if (!date) {
        return null
    }
    const tempDate = new Date(date)
    return `${tempDate.getFullYear()}-${(tempDate.getMonth() + 1) < 10 ? `0${tempDate.getMonth() + 1}` : `${tempDate.getMonth() + 1}`}-${(tempDate.getDate()) < 10 ? `0${tempDate.getDate()}` : `${tempDate.getDate()}`}`
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
    dashboardPages: {
        appointmentsPage: "/dashboard/appointments",
        patientLivePrescription: `/dashboard/prescription/live/patient`,
        doctorLivePrescription: `/dashboard/prescription/live/doctor`,
        addToVaultPage: "/dashboard/prescription/vault/add",
        prescriptionVaultPage: "/dashboard/prescription/vault",
        prescriptionVaultPageById: (id) => { return `/dashboard/prescription/vault/${id}` },

    },
    addConsultation: "/userdetails/addconsultation",
    userProfile: (userId) => { return `/profile/user/${userId}` }
}


export const convertCmtoFeetInch = (cm) => {
    const feet = Math.floor(cm / 30.48)
    const inch = Math.round((cm - feet * 30.48) / 2.54)
    return `${feet} ft ${inch} in`
}

export const rountToTwo = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100
}

export const convertFtIncToCm = (ft, inch) => {
    return rountToTwo((Number(ft) * 30.48) + (Number(inch) * 2.54))
}

export const getImageDimensions = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
        };
        img.onerror = reject;
    });
};

export const capitalizeFirstLetter = (string) => {
    string = String(string)
    if (!string) {
        return null
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
}