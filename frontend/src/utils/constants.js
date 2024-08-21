import { differenceInDays, format, formatDistanceToNow } from "date-fns";

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
export const getReportByIdUrl = (reportId) => { return `${baseUrl}/v1/reports/${reportId}` }
export const getSharedReportByIdUrl = (reportId) => { return `${baseUrl}/v1/reports/share/${reportId}` }
export const getProfilePicUrl = `${baseUrl}/v1/infos/profile_picture`
export const patientInfoUrl = (appointment_id) => { return `${baseUrl}/v1/appointments/user-data/${appointment_id}` }
export const getUserInfoUrl = (user_id, role) => { return `${baseUrl}/v1/infos/${role}/${user_id}` }
export const getDoctorBalance = `${baseUrl}/v1/infos/balance`
export const getDoctorBalanceHistory = `${baseUrl}/v1/infos/balance/history`
export const blogsUrl = `${baseUrl}/v1/blogs`
export const blogsAnonymousUrl = `${baseUrl}/v1/anonymous/blogs`
export const blogByIdUrl = (id) => { return `${baseUrl}/v1/blogs/${id}` }
export const blogByIdAnonymousUrl = (blog_id) => { return `${baseUrl}/v1/anonymous/blogs/${blog_id}` }
export const blogVoteUrl = (blog_id) => { return `${baseUrl}/v1/blogs/${blog_id}/vote` }
export const forumQuestionsUrl = `${baseUrl}/v1/forum`
export const forumQuestionsAnonymousUrl = `${baseUrl}/v1/anonymous/forum`
export const forumQuestionByIdUrl = (forum_id) => { return `${baseUrl}/v1/forum/${forum_id}` }
export const forumQuestionByIdAnonymousUrl = (forum_id) => { return `${baseUrl}/v1/anonymous/forum/${forum_id}` }
export const forumQuestionvoteUrl = (forum_id) => { return `${baseUrl}/v1/forum/${forum_id}/vote` }
export const forumAnsById = (answerId) => { return `${baseUrl}/v1/forum/answers/${answerId}` }
export const forumAnswerVote = (answer_id) => { return `${baseUrl}/v1/forum/answers/${answer_id}/vote` }
export const forumAnswers = `${baseUrl}/v1/forum/answers`
export const forumAnswersAnonymous = `${baseUrl}/v1/anonymous/forum/answers`
export const forumAnswersById = (answer_id) => { return `${baseUrl}/v1/forum/answers/${answer_id}` }
export const forumAnswersByIdAnonymous = (answer_id) => { return `${baseUrl}/v1/anonymous/forum/answers/${answer_id}` }
export const complaintUrl = `${baseUrl}/v1/complaints`
export const getComplaints = `${baseUrl}/v1/ROLE_ADMIN/complaints`
export const resolveComplaint = (complaint_id) => { return `${baseUrl}/v1/ROLE_ADMIN/complaints/${complaint_id}` }
export const unverifiedDoctors = `${baseUrl}/v1/ROLE_ADMIN/unverified/doctors`
export const verifyDoctor = (docId) => { return `${baseUrl}/v1/ROLE_ADMIN/verify/doctors/${docId}` }

// export const addConsultationLocationUrl = (id) => { return `/api/userForm` }
export const locationOnline = "ONLINE"
export const locationResolution = 8

export const dummyAvatar = (name) => { return `https://getstream.io/random_svg/?name=${name}` }
export const testingAvatar = "https://www.gosfordpark-coventry.org.uk/wp-content/uploads/blank-avatar.png"
export const avatarAang = "https://sm.ign.com/t/ign_nordic/cover/a/avatar-gen/avatar-generations_prsz.300.jpg"
export const emptyAvatar = "/emptyAvatar.png"

export const messageImageUploaPath = (roomId, userId, fileName) => { return `messages/images/room_${roomId}/sender_${userId}/${new Date().toISOString()}/${fileName}` }

export const radicalGradient = "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))]"

export const sessionDataItem = "sessionData"
export const reportAnalysisThreshold = 0.85

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
    baseUrl: baseUrl,
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
        userdetailsPage: "/dashboard/userdetails",
        selfTestPage: "/dashboard/selftest",
        balanceHitoryPage: "/dashboard/balanceHistory",
    },
    forumPage: "/forum",
    askQuestionPage: "/forum/askquestion",
    questionPageById: (id) => { return `/forum/question/${id}` },
    updateQuestionById: (id) => { return `/forum/question/${id}/update` },
    blogsPage: "/blogs",
    blogPageById: (id) => { return `/blogs/${id}` },
    updateBlogById: (id) => { return `/blogs/${id}/update` },
    addBlogPage: "blogs/add",
    addConsultation: "/userdetails/addconsultation",
    userProfile: (userId) => { return `/profile/user/${userId}` },
    doctorProfile: (doctorId) => { return `/profile/doctor/${doctorId}` },
    redirectUserToProfileWithId: (userId) => { return `/profile/redirect?userId?${userId}` },
    reportPage: (id, type) => { return `/report?contentId=${id}&contentType=${type}` },
    complaintsPage: "/admin/complaints",
    complaintDetailsPage: (complaintId, type, resourceId) => { return `/admin/complaints/${complaintId}?type=${type}&resourceId=${resourceId}` },
}

export const ReportTypes = {
    blog: "BLOG",
    forumQuestion: "FORUM_QUESTION",
    forumAnswer: "FORUM_ANSWER",
}

export const voteStates = {
    upvote: 1,
    downvote: -1,
}
export const voteTypes = {
    upvote: "UPVOTE",
    downvote: "DOWNVOTE",
    unvote: "UNVOTE",
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

export const getFeetFromCm = (cm) => {
    cm = Number(cm)
    return Math.floor(cm / 30.48)
}

export const getInchFromCm = (cm) => {
    cm = Number(cm)
    const feet = getFeetFromCm(cm)
    return Math.floor((cm - (feet * 30.48)) / 2.54)
}

export const generateOptions = (start, end) => {
    const options = [];
    for (let i = start; i <= end; i++) {
        options.push(
            <option key={i} value={i}>
                {i}
            </option>
        );
    }
    return options;
};

export const generateOptionsFromArray = (optionList) => {
    const options = [];
    for (let i = 0; i < optionList.length; i++) {
        options.push(
            <option key={i} value={optionList[i].value}>
                {optionList[i].label}
            </option>
        )
    }
    return options;
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
    if (!string) {
        return null
    }
    string = String(string)
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

export const parseDate = (date) => {
    if (!date) {
        return null
    }
    return new Date(date)
}

//a function that takes two object and check if one is subset of the other checking the values of the keys
export const isSubset = (subset, superset) => {
    if (!subset || !superset) {
        return false
    }
    for (const key in subset) {
        if (subset[key] !== superset[key]) {
            return false
        }
    }
    return true
}

export function displayDate(date) {
    if (!date) {
        return null;
    }
    const currentDate = new Date();
    const givenDate = new Date(date);
    const difference = differenceInDays(currentDate, givenDate);

    // Check if the date is within the last 7 days
    if (difference < 7) {
        // Display how many days ago
        return formatDistanceToNow(givenDate, { addSuffix: true });
    } else {
        // Display the formatted date in "Friday, 12 August, 2023" format
        return format(givenDate, "EEEE hh:mm a, dd MMMM, yyyy");
    }
}

// const blogContent = `<covertext>${coverText}</covertext><coverimage>${coverImageLink}</coverimage><content>${content}</content>`

export const reportCategories = [
    { label: "Spam", toxicityModelLabel: null },
    { label: "Harassment", toxicityModelLabel: "identity_attack" },
    { label: "Inappropriate Content", toxicityModelLabel: "insult" },
    { label: "Misinformation", toxicityModelLabel: null },
    { label: "Off-topic", toxicityModelLabel: null },
    { label: "Plagiarism", toxicityModelLabel: null },
    { label: "Hate Speech", toxicityModelLabel: "threat" },
    { label: "Privacy Violation", toxicityModelLabel: null },
    { label: "Malicious Links", toxicityModelLabel: null },
    { label: "Duplicate Answer", toxicityModelLabel: null },

    // TensorFlow.js toxicity model labels
    { label: "Identity Attack", toxicityModelLabel: "identity_attack" },
    { label: "Insult", toxicityModelLabel: "insult" },
    { label: "Obscene", toxicityModelLabel: "obscene" },
    { label: "Severe Toxicity", toxicityModelLabel: "severe_toxicity" },
    { label: "Sexual Harassment", toxicityModelLabel: "sexual_explicit" },
    { label: "Threat", toxicityModelLabel: "threat" },
    { label: "Toxicity", toxicityModelLabel: "toxicity" }
];
