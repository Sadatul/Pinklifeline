import { differenceInDays, format, formatDistanceToNow, sub } from "date-fns";
// import Image from "next/image";

export const baseUrl = 'https://api.pinklifeline.xyz';
export const frontEndUrl = 'https://www.pinklifeline.xyz';
export const stompBrokerUrl = `wss://api.pinklifeline.xyz/ws`
export const loginUrlReq = `${baseUrl}/v1/auth`;
export const forgotPasswordUrlReq = (email) => { return `${baseUrl}/v1/auth/reset-password?email=${email}` }
export const logoutUrlReq = `${baseUrl}/v1/auth/logout`;
export const refreshTokenUrlReq = `${baseUrl}/v1/auth/refresh`;
export const registerUrlReq = `${baseUrl}/v1/auth/register`;
export const otpUrlReq = `${baseUrl}/v1/auth/verify`;
export const userInfoRegUrlReq = (id, role) => { return `${baseUrl}/v1/infos/${role}/${id}` };
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
export const getNearByUsersGeneral = `${baseUrl}/v1/nearby`
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
export const finishAppointmentUrl = (appointment_id) => { return `${baseUrl}/v1/appointments/${appointment_id}/finish` }
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
export const unverifiedDoctors = `${baseUrl}/v1/doctors`
export const getDoctorsUrl = `${baseUrl}/v1/doctors`
export const verifyDoctor = (docId) => { return `${baseUrl}/v1/ROLE_ADMIN/verify/doctors/${docId}` }
export const hospitalsAdminUrl = `${baseUrl}/v1/ROLE_ADMIN/hospitals`
export const hospitalByIdUrl = (hospital_id) => { return `${baseUrl}/v1/ROLE_ADMIN/hospitals/${hospital_id}` }
export const hospitalsAnonymousUrl = `${baseUrl}/v1/anonymous/hospitals`
export const medicalTestAdminUrl = `${baseUrl}/v1/ROLE_ADMIN/medical-tests`
export const medicalTestByIdAdminUrl = (test_id) => { return `${baseUrl}/v1/ROLE_ADMIN/medical-tests/${test_id}` }
export const getMedicalTestAnonymousUrl = `${baseUrl}/v1/anonymous/medical-tests`
export const getHospitalsAnonymousUrl = `${baseUrl}/v1/anonymous/hospitals`
export const medicalTestHospitalAdminUrl = `${baseUrl}/v1/ROLE_ADMIN/hospitals/tests`
export const medicalTestHospitalByIdAdminUrl = (hospitalTestId) => { return `${baseUrl}/v1/ROLE_ADMIN/hospitals/tests/${hospitalTestId}` }
export const medicalTestHospitalAnonymousUrl = `${baseUrl}/v1/anonymous/hospitals/tests`
export const compareHospitalsAnonymous = `${baseUrl}/v1/anonymous/hospitals/compare`
export const toggleLocationShare = `${baseUrl}/v1/ROLE_PATIENT/toggle-location-share`
export const worksUrl = `${baseUrl}/v1/works`
export const workTagsUrl = (work_id) => { return `${baseUrl}/v1/works/${work_id}/tags` }
export const worksByIdUrl = (work_id) => { return `${baseUrl}/v1/works/${work_id}` }
export const reserveWorkUrl = (work_id) => { return `${baseUrl}/v1/works/${work_id}/reserve` }
export const finishWorkUrl = (work_id) => { return `${baseUrl}/v1/works/${work_id}/finish` }
export const subscriptionPlansUrl = `${baseUrl}/v1/anonymous/subscriptions`
export const userSubscriptionUrl = `${baseUrl}/v1/infos/subscription`
export const validationSubscriptionPaymentUrl = (userId, transId) => { return `${baseUrl}/v1/payment/subscription/${userId}/validate?transId=${transId}` }
export const subscribeUrl = (user_id) => { return `${baseUrl}/v1/payment/subscription/${user_id}/initiate` }
export const subscribeNotficationsUrl = `${baseUrl}/v1/notifications/subscriptions`
export const subscribeNotficationByIdUrl = (id) => { return `${baseUrl}/v1/notifications/subscriptions/${id}` }
export const selfTestReminderUrl = `${baseUrl}/v1/self-test/reminder`
export const updatePeriodDateUrl = `${baseUrl}/v1/infos/period-data`
export const adminSendNotifications = `${baseUrl}/v1/ROLE_ADMIN/send-notifications`
export const freeTrianReqUrl = `${baseUrl}/v1/subscriptions/free-trial`
export const getRole = (id) => { return `${baseUrl}/v1/infos/guest/roles/${id}` }
export const hospitalReviewsUrl = (hospital_id) => { return `${baseUrl}/v1/reviews/hospital/${hospital_id}` }
export const hospitalReviewSummaryUrl = (hospital_id) => { return `${baseUrl}/v1/reviews/hospital/${hospital_id}/summary` }
export const getHospitalReviewByIdUrl = (hospital_id, review_id) => { return `${baseUrl}/v1/reviews/hospital/${hospital_id}/${review_id}` }

// export const addConsultationLocationUrl = (id) => { return `/api/userForm` }
export const locationOnline = "ONLINE"
export const locationResolution = 8
export const sessionExpirationTime = 86400000 - 3600000
export const refreshTokenExpirationTime = 86400000 * 29

export const dummyAvatar = (name) => { return `https://getstream.io/random_svg/?name=${name}` }
export const testingAvatar = "https://www.gosfordpark-coventry.org.uk/wp-content/uploads/blank-avatar.png"
export const avatarAang = "https://sm.ign.com/t/ign_nordic/cover/a/avatar-gen/avatar-generations_prsz.300.jpg"
export const emptyAvatar = "/emptyAvatar.png"
export const appointmentStartMsgPattern = /You have an online appointment now\. Join at \S+/;
export const appointmentStartMsg = (link) => { return `You have an online appointment now. Join at ${link}` }
export const extractLink = (msg) => {
    const LinkPattern = /Join at (\S+)/
    const match = msg.match(LinkPattern);
    if (match && match[1]) {
        const extractedLink = match[1];
        return extractedLink;
    } else {
        return null;
    }
}

export const passwordRegex = "^(?=.*[0-9])(?=.*[!@#$%^&*(),.?\":{}|<>]).{2,}$"
export const messageImageUploaPath = (roomId, userId, fileName) => { return `messages/images/room_${roomId}/sender_${userId}/${new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000).toISOString()}/${fileName}` }

export const radicalGradient = "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))]"
export const sessionDataItem = "sessionData"
export const reportAnalysisThreshold = 0.85
export const notificationData = "notificationData"

export const workStatus = {
    POSTED: "POSTED",
    ACCEPTED: "ACCEPTED",
    FINISHED: "FINISHED",
}
export const roles = {
    basicUser: "ROLE_BASICUSER",
    patient: "ROLE_PATIENT",
    doctor: "ROLE_DOCTOR",
    nurse: "ROLE_NURSE",
    doctorProfile: "doctor",
    admin: "ROLE_ADMIN",
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
    baseUrl: frontEndUrl,
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
    redirectProfile: (profileId) => { return `/profile/redirect_profile/${profileId}` },
    dashboard: "/dashboard/userdetails",
    dashboardPages: {
        appointmentsPage: "/dashboard/appointments",
        patientLivePrescription: `/dashboard/prescription/live/patient`,
        doctorLivePrescription: `/dashboard/prescription/live/doctor`,
        addToVaultPage: "/dashboard/prescription/vault/add",
        prescriptionVaultPage: "/dashboard/prescription/vault",
        prescriptionVaultPageById: (id) => { return `/dashboard/prescription/vault/${id}` },
        userdetailsPage: "/dashboard/userdetails",
        profilePicPage: "/dashboard/userdetails/profilepic",
        selfTestPage: "/dashboard/selftest",
        balanceHitoryPage: "/dashboard/balanceHistory",
        worksPage: "/dashboard/works",
        addWorkPage: "/dashboard/works/add",
        worksByIdPage: (workId) => { return `/dashboard/works/${workId}` },
        updateWorkPage: (workId) => { return `/dashboard/works/update/${workId}` },
        notificationPage: "/dashboard/notifications",
        subscriptionPage: "/dashboard/subscription",
        lookaroundPage: "/dashboard/lookaround",
        sharedPrescriptionPage: "/dashboard/prescription/vault/shared",
        chatbotpage: "#",
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
    unverifiedDoctorsPageForAdmin: "/admin/doctors",
    hospitalsPage: "/admin/hospitals",
    addHospitalPage: "/admin/hospitals/add",
    updateHospitalsPage: (hospitalId) => { return `/admin/hospitals/update/${hospitalId}` },
    testsAdminPage: "/admin/tests",
    allHospitalsPage: "/hospitals",
    hospitalByIdPage: (hospitalId) => { return `/hospitals/details/${hospitalId}` },
    compareHospitalsPage: `/hospitals/compare`,
    compareTestsUserPage: `hospitals/tests/compare`,
    addTestHospitalpage: (hospitalId) => { return `/admin/hospitals/addtest?hospitalid=${hospitalId}` },
    searchPage: (query) => { return `/search?query=${query}` },
    forgotPassword: (email, token) => { return `/forgotpassword?email=${email}&token=${token}` },
    adminBalanceHistory: `/admin/balanceHistory`
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

export function round(number) {
    return (Math.round((number + Number.EPSILON) * 100) / 100)
}

export const convertCmtoFeetInch = (cm) => {
    const feet = Math.floor(cm / 30.48)
    const inch = Math.round((cm - feet * 30.48) / 2.54)
    return `${feet} ft ${inch} in`
}

export function convertToAmPm(timeString) {
    // Split the time string into hours, minutes, and seconds
    const [hours, minutes, seconds] = timeString.split(':').map(Number);

    // Create a new Date object and set the hours, minutes, and seconds
    const date = new Date();
    date.setHours(hours, minutes, seconds);

    // Format the date into the desired format (hh:mm:ss a)
    return format(date, 'hh:mm a');
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

export function parseDate(date) {
    // Check if the input is already a JS Date object
    if (Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date)) {
        return new Date(date);
    }

    // Regex to detect LocalDateTime pattern with time (e.g., '2023-09-23T15:30:00')
    const localDateTimePattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/;

    // Regex to detect Date pattern without time (e.g., '2023-09-23')
    const localDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

    if (typeof date === 'string') {
        // Handle full LocalDateTime (with time)
        if (localDateTimePattern.test(date)) {
            const [, year, month, day, hour, minute, second] = date.match(localDateTimePattern);
            return new Date(year, month - 1, day, hour, minute, second);
        }

        // Handle date-only format (without time)
        if (localDatePattern.test(date)) {
            const [, year, month, day] = date.match(localDatePattern);
            return new Date(year, month - 1, day);
        }
    }

    // Fallback for unsupported format
    console.warn('Unsupported date format:', date);
    return null;
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

export function displayDate(date, customFormat = null) {
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
    }
    else if (customFormat) {
        // Display the formatted date in the custom format
        return format(givenDate, customFormat);
    }
    else {
        // Display the formatted date in "Friday, 12 August, 2023" format
        return format(givenDate, "EEEE hh:mm a, dd MMMM, yyyy");
    }
}

export const extractTextFromHtml = (html) => {
    const tempElement = document.createElement('div')
    tempElement.innerHTML = html
    return tempElement.innerText || ''
}

export function alignArrays(testA, testB) {
    // Step 1: Sort both arrays by 'id'
    testA.sort((a, b) => (a.testId ?? Infinity) - (b.testId ?? Infinity));
    testB.sort((a, b) => (a.testId ?? Infinity) - (b.testId ?? Infinity));


    // Step 2: Initialize pointers and result arrays
    let pointerA = 0;
    let pointerB = 0;
    const resultA = [];
    const resultB = [];

    // Step 3: Traverse both arrays and align elements
    while (pointerA < testA.length && pointerB < testB.length) {
        const elementA = testA[pointerA];
        const elementB = testB[pointerB];

        if (elementA.testId === elementB.testId) {
            // Matching elements
            resultA.push(elementA);
            resultB.push(elementB);
            pointerA++;
            pointerB++;
        } else if ((elementA.testId ?? Infinity) < (elementB.testId ?? Infinity)) {
            // Element in testA does not match, add dummy to resultB
            resultA.push(elementA);
            resultB.push({ testId: null, name: "Does not exist" });
            pointerA++;
        } else {
            // Element in testB does not match, add dummy to resultA
            resultA.push({ testId: null, name: "Does not exist" });
            resultB.push(elementB);
            pointerB++;
        }
    }

    // Step 4: Handle remaining elements in testA
    while (pointerA < testA.length) {
        resultA.push(testA[pointerA]);
        resultB.push({ testId: null, name: "Does not exist" });
        pointerA++;
    }

    // Step 4: Handle remaining elements in testB
    while (pointerB < testB.length) {
        resultA.push({ testId: null, name: "Does not exist" });
        resultB.push(testB[pointerB]);
        pointerB++;
    }
    console.log(resultA, resultB)

    return { resultA, resultB };
}

export function generatePairs(elements) {
    const pairs = [];
    const n = elements.length;

    // Loop to generate combinations of two from the array
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            pairs.push([elements[i], elements[j]]);
        }
    }

    return pairs;
}

// const blogContent = `<covertext>${coverText}</covertext><coverimage>${coverImageLink}</coverimage><content>${content}</content>`

export function extractCoverText(content) {
    const cover = content.match(/<covertext>(.*?)<\/covertext>/);
    return cover ? cover[1] : null;
}

export function extractCoverImage(content) {
    const cover = content.match(/<coverimage>(.*?)<\/coverimage>/);
    return cover ? cover[1] : null;
}

export function extractContent(content) {
    const cover = content.match(/<content>(.*?)<\/content>/);
    return cover ? cover[1] : null;
}

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

export const SubscriptionPlans = [
    {
        name: "USER_MONTHLY",
        price: 300,
    }, {
        name: "USER_YEARLY",
        price: 3000,
    }, {
        name: "DOCTOR_MONTHLY",
        price: 1000,
    }, {
        name: "DOCTOR_YEARLY",
        price: 10000,
    }
]

export const DashBoardPageLinks = {
    "ROLE_PATIENT": [
        {
            name: "Profile",
            link: pagePaths.dashboardPages.userdetailsPage
        },
        {
            name: "Appointments",
            link: pagePaths.dashboardPages.appointmentsPage
        },
        {
            name: "Prescription Vault",
            link: pagePaths.dashboardPages.prescriptionVaultPage
        },
        {
            name: "Works",
            link: pagePaths.dashboardPages.worksPage
        },
        {
            name: "Self Test",
            link: pagePaths.dashboardPages.selfTestPage
        },
        {
            name: "Chatbot",
            link: pagePaths.dashboardPages.chatbotpage
        },
        {
            name: "Seek Help",
            link: pagePaths.dashboardPages.lookaroundPage
        },
        {
            name: "Notifications",
            link: pagePaths.dashboardPages.notificationPage
        },
        {
            name: "Subscription",
            link: pagePaths.dashboardPages.subscriptionPage
        }
    ],
    "ROLE_BASICUSER": [
        {
            name: "Profile",
            link: pagePaths.dashboardPages.userdetailsPage
        },
        {
            name: "Appointments",
            link: pagePaths.dashboardPages.appointmentsPage
        },
        {
            name: "Prescription Vault",
            link: pagePaths.dashboardPages.prescriptionVaultPage
        },
        {
            name: "Works",
            link: pagePaths.dashboardPages.worksPage
        },
        {
            name: "Self Test",
            link: pagePaths.dashboardPages.selfTestPage
        },
        {
            name: "Chatbot",
            link: pagePaths.dashboardPages.chatbotpage
        },
        {
            name: "Seek Help",
            link: pagePaths.dashboardPages.lookaroundPage
        },
        {
            name: "Notifications",
            link: pagePaths.dashboardPages.notificationPage
        },
        {
            name: "Subscription",
            link: pagePaths.dashboardPages.subscriptionPage
        }
    ],
    "ROLE_DOCTOR": [
        {
            name: "Profile",
            link: pagePaths.dashboardPages.userdetailsPage
        },
        {
            name: "Appointments",
            link: pagePaths.dashboardPages.appointmentsPage
        },
        {
            name: "Shared Prescriptions",
            link: pagePaths.dashboardPages.sharedPrescriptionPage
        },
        {
            name: "Works",
            link: pagePaths.dashboardPages.worksPage
        },
        {
            name: "Subscription",
            link: pagePaths.dashboardPages.subscriptionPage
        }
    ],
}

export const DashboardPagesInfos = [
    {
        name: "Profile",
        link: pagePaths.dashboardPages.userdetailsPage,
        roles: [roles.patient, roles.doctor, roles.basicUser]
    },
    {
        name: "Appointments",
        link: pagePaths.dashboardPages.appointmentsPage,
        roles: [roles.patient, roles.doctor, roles.basicUser]
    },
    {
        name: "Prescription Vault",
        link: pagePaths.dashboardPages.prescriptionVaultPage,
        roles: [roles.patient, roles.doctor, roles.basicUser]
    },
    {
        name: "Works",
        link: pagePaths.dashboardPages.worksPage,
        roles: [roles.patient, roles.doctor, roles.basicUser]
    },
    {
        name: "Self Test",
        link: pagePaths.dashboardPages.selfTestPage,
        roles: [roles.patient, roles.basicUser]
    },
    {
        name: "Chatbot",
        link: pagePaths.dashboardPages.chatbotpage,
        roles: [roles.patient, roles.doctor, roles.basicUser]
    },
    {
        name: "Seek Help",
        link: pagePaths.dashboardPages.lookaroundPage,
        roles: [roles.patient, roles.basicUser]
    }, {
        name: "Notifications",
        link: pagePaths.dashboardPages.notificationPage,
        roles: [roles.patient, roles.basicUser]
    },
    {
        name: "Subscription",
        link: pagePaths.dashboardPages.subscriptionPage,
        roles: [roles.patient, roles.doctor, roles.basicUser]
    }
]

export const AdminPagesInfos = [
    {
        name: "Complaints",
        link: pagePaths.complaintsPage
    }, {
        name: "Doctors",
        link: pagePaths.unverifiedDoctorsPageForAdmin
    }, {
        name: "Hospitals",
        link: pagePaths.hospitalsPage
    }, {
        name: "Medical Tests",
        link: pagePaths.testsAdminPage
    }, {
        name: "Balance Hitory",
        link: pagePaths.adminBalanceHistory
    }
]

// export const CoveredToDivImage = (src) =>{
//     return (
//         <Image
//             src={src}
//             alt={"alt"}
//             quality={100}
//             className="bg-black w-full h-full object-cover"
//             fill={true}
//         />
//     )
// }

export const isValidImgSrc = (src) => {
    //check if the src includes any whitespace or is empty and if its an url or does it start with '/'
    return (src && src?.trim() && !src.includes(' ') && (src.startsWith('/') || src.startsWith('http'))) ? true : false
}