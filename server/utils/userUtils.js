// userUtils.js

// Age Verification GDPR
const calculateAge = (birthDate) => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

const getAgeBracket = (age) => {
  if (age < 16) return "13-15";
  if (age < 18) return "16-17";
  return "18+";
};

const getAgeCompliancePackage = (age, parentalConsent) => {
  const bracket = getAgeBracket(age);

  // Age-appropriate notices and default privacy settings
  let ageNotice = null;
  let defaultPrivacySettings = {
    showOnLeaderboards: true,
    showAsAnonymous: false,
    showUsernameOnLeaderboards: false,
  };

  if (bracket === "13-15") {
    ageNotice = {
      bracket: "13-15",
      title: "Welcome! Let's keep you safe online 🛡️",
      message:
        "To protect your privacy, your profile is set to private by default. " +
        "This means other learners won't see your username or progress. " +
        "You can adjust these settings when you feel ready.",
      tips: [
        "Never share personal information in code comments or usernames",
        "Talk to a parent or guardian if something doesn't feel right",
        "You can download or delete your data anytime in Settings",
      ],
      requiresParentalGuidance: true,
      parentalConsentConfirmed: !!parentalConsent,
      defaultPrivacySettings: {
        showOnLeaderboards: false,
        showAsAnonymous: true,
        showUsernameOnLeaderboards: false,
      },
      restrictedFeatures: {
        note: "Some social features are limited to keep you safe. These will unlock when you turn 16.",
        features: ["public_profile", "community_forums"],
      },
    };
    defaultPrivacySettings = ageNotice.defaultPrivacySettings;
  } else if (bracket === "16-17") {
    ageNotice = {
      bracket: "16-17",
      title: "You're in control of your data 🔐",
      message:
        "You have full control over your privacy. Visit Settings anytime to manage " +
        "what information is visible to others or to download your data.",
      tips: [
        "Review your privacy settings regularly",
        "You can export all your data under Settings > Export Data",
        "You can delete your account and all associated data permanently",
      ],
      defaultPrivacySettings: {
        showOnLeaderboards: true,
        showAsAnonymous: false,
        showUsernameOnLeaderboards: false,
      },
    };
    defaultPrivacySettings = ageNotice.defaultPrivacySettings;
  } else {
    // 18+ - no specific age notice needed, but we can still provide a privacy reminder
    ageNotice = {
      bracket: "18+",
      title: "Welcome to the community! 🎉",
      message:
        "Your learning journey starts now. You have full control over your data and privacy settings.",
      tips: [
        "Complete your profile to get the most out of the platform",
        "Check out the community guidelines",
        "You can export or delete your data anytime in Settings",
      ],
      defaultPrivacySettings: {
        showOnLeaderboards: true,
        showAsAnonymous: false,
        showUsernameOnLeaderboards: false,
      },
    };
    defaultPrivacySettings = ageNotice.defaultPrivacySettings;
  }
  return {
    ageBracket: bracket,
    privacySettings: defaultPrivacySettings,
    ageNotice,
  };
};

module.exports = { calculateAge, getAgeBracket, getAgeCompliancePackage };
