import { appLogo, appName, siteAddress } from "./config";

export const PATHS = {
  HOME: "/",
  SIGNIN: "/signin",
  SIGNUP: "/signup",
  EXAMS: "/exams/",
  USERS: "/users/",
  ATTEMPTS: "/attempts/",
  NEW_EXAM: "/exams/new",
  SETTINGS: "/settings",
  PRIVACY: "/privacy",
  TRENDING: "/trending",
  SEARCH: "/search",
  RESET_PASSWORD: "/reset-password",
};

export const PUBLIC_PATHS = [
  PATHS.HOME,
  PATHS.TRENDING,
  PATHS.PRIVACY,
  PATHS.SEARCH,
  PATHS.RESET_PASSWORD,
];

export const HEADER_HEIGHT = 64;

export const CONTENT_HEIGHT = `calc(100vh - ${HEADER_HEIGHT}px)`;

export enum UserData {
  EXAMS = "exams",
  ATTEMPTS = "attempts",
  QUESTIONS = "questions",
  TESTS = "tests",
}

export const DO_COLOR = "#dfe9ff";

export const DEFAULT_METADATA = {
  metadataBase: new URL(siteAddress),
  title: `${appName} | Reimagine Assessments`,
  description:
    "Welcome to our comprehensive online exam platform! Our user-friendly system simplifies exam creation for educators and seamless assessment-taking for students under their tutor's guidance. Our platform empowers educators to craft exams effortlessly, while students find ease in taking assessments provided by their tutors. Join us to experience a streamlined process that enhances the learning and assessment journey for both educators and students!",
  openGraph: {
    type: "website",
    title: `${appName} | Reimagine Assessments`,
    description:
      "Welcome to our comprehensive online exam platform! Our user-friendly system simplifies exam creation for educators and seamless assessment-taking for students under their tutor's guidance. Our platform empowers educators to craft exams effortlessly, while students find ease in taking assessments provided by their tutors. Join us to experience a streamlined process that enhances the learning and assessment journey for both educators and students!",
    url: siteAddress,
    images: appLogo,
  },
};

export const ORG_SCHEMA = {
  __html: JSON.stringify({
    "@context": "http://schema.org/",
    "@type": "Organization",
    name: appName,
    logo: appLogo,
    url: siteAddress,
    sameAs: [],
  }),
};
