const scenarios = [
  {
    id: 'phishing-1',
    title: 'Suspicious Bank Email',
    category: 'Phishing',
    difficulty: 1,
    description: 'You receive an urgent email claiming to be from your bank about a security breach.',
    icon: 'Mail',
    steps: [
      {
        prompt: 'You receive an email from "security@bankofamerlca.com" with the subject line "URGENT: Your Account Has Been Compromised!" The email says:\n\n"Dear Valued Customer,\n\nWe have detected suspicious activity on your account. Your account will be suspended within 24 hours unless you verify your identity immediately.\n\nClick here to verify your account: [Verify Now]\n\nBank of America Security Team"',
        visualType: 'email',
        visualData: {
          from: 'security@bankofamerlca.com',
          to: 'you@email.com',
          subject: 'URGENT: Your Account Has Been Compromised!',
          body: 'Dear Valued Customer,\n\nWe have detected suspicious activity on your account. Your account will be suspended within 24 hours unless you verify your identity immediately.\n\nClick the button below to verify your account immediately.',
          buttonText: 'Verify Now',
          hasAttachment: false
        },
        options: [
          {
            text: 'Click the "Verify Now" link to protect my account',
            isCorrect: false,
            feedback: '❌ Never click links in suspicious emails! The sender address "bankofamerlca.com" is misspelled (notice "l" instead of "i"). This is a classic phishing attempt.',
            defenseTip: 'Always check the sender\'s email address carefully. Legitimate banks never ask you to verify credentials via email links.'
          },
          {
            text: 'Call the bank directly using the number on my card',
            isCorrect: true,
            feedback: '✅ Excellent! Calling your bank directly using a known, trusted phone number is the safest way to verify if there\'s really an issue.',
            defenseTip: 'Always use official contact channels — phone numbers from your physical card or the bank\'s official website, never from the email itself.'
          },
          {
            text: 'Reply to the email asking for more details',
            isCorrect: false,
            feedback: '❌ Replying confirms your email is active and can lead to more phishing attempts. Never engage with suspicious emails.',
            defenseTip: 'Do not reply to, forward, or engage with suspicious emails. Report them as phishing and delete them.'
          },
          {
            text: 'Forward it to friends to warn them',
            isCorrect: false,
            feedback: '❌ While your intentions are good, forwarding phishing emails can accidentally expose others to the threat. Report it instead.',
            defenseTip: 'Report phishing emails to your email provider and the impersonated organization rather than forwarding them.'
          }
        ]
      },
      {
        prompt: 'You called your bank and confirmed the email was fake. Now what should you do with the phishing email?',
        visualType: 'report-sim',
        visualData: { title: 'Reporting Phishing Attempt' },
        options: [
          {
            text: 'Just delete it and move on',
            isCorrect: false,
            feedback: '⚠️ Deleting it is okay, but reporting it first helps protect others from the same scam.',
            defenseTip: 'Always report phishing emails before deleting them to help email providers improve their filters.'
          },
          {
            text: 'Report it as phishing in my email client, then delete it',
            isCorrect: true,
            feedback: '✅ Perfect! Reporting the email helps your email provider improve spam filters and protects other users.',
            defenseTip: 'Most email clients have a "Report Phishing" option. Use it — your report helps train AI filters to catch similar emails.'
          },
          {
            text: 'Save it in a folder for records',
            isCorrect: false,
            feedback: '❌ Keeping phishing emails increases risk of accidental clicks later. Report and delete.',
            defenseTip: 'If you need records, take a screenshot. Don\'t keep the actual email in your inbox.'
          }
        ]
      }
    ]
  },
  {
    id: 'phishing-2',
    title: 'CEO Fraud Email',
    category: 'Phishing',
    difficulty: 2,
    timeLimit: 45,
    description: 'An email from your "CEO" urgently requests a wire transfer while they\'re traveling.',
    icon: 'Mail',
    steps: [
      {
        prompt: 'You work in finance. You receive this email:\n\nFrom: ceo.john.smith@company-mail.net\nSubject: Urgent & Confidential\n\n"Hi,\n\nI\'m in a meeting overseas and need you to process an urgent wire transfer of $45,000 to a new vendor. This is time-sensitive and confidential — please don\'t discuss with anyone else.\n\nI\'ll send the account details shortly. Please confirm you can handle this.\n\nThanks,\nJohn Smith, CEO"',
        visualType: 'email',
        visualData: {
          from: 'ceo.john.smith@company-mail.net',
          to: 'you@company.com',
          subject: 'Urgent & Confidential',
          body: 'Hi,\n\nI\'m in a meeting overseas and need you to process an urgent wire transfer of $45,000 to a new vendor. This is time-sensitive and confidential — please don\'t discuss with anyone else.\n\nI\'ll send the account details shortly. Please confirm you can handle this.\n\nThanks,\nJohn Smith, CEO',
          hasAttachment: false
        },
        options: [
          {
            text: 'Reply confirming I can handle the transfer',
            isCorrect: false,
            feedback: '❌ This is a classic Business Email Compromise (BEC) attack! The domain "@company-mail.net" is different from the real company domain. The urgency, secrecy, and overseas story are major red flags.',
            defenseTip: 'BEC attacks cost businesses billions every year. Always verify unusual financial requests through a separate communication channel.'
          },
          {
            text: 'Verify by calling the CEO directly on their known phone number',
            isCorrect: true,
            feedback: '✅ Smart move! Verifying through a separate channel is the best defense against BEC attacks. The email domain doesn\'t match the real company domain.',
            defenseTip: 'For any unusual financial request, always verify via phone call or in-person confirmation, regardless of who the email appears to be from.'
          },
          {
            text: 'Process the payment since it\'s from the CEO',
            isCorrect: false,
            feedback: '❌ Never process unusual payments based solely on email authority. Look at the email domain — it\'s "@company-mail.net", not your actual company domain.',
            defenseTip: 'Establish clear payment verification procedures. No legitimate CEO would mind a security-conscious employee double-checking.'
          }
        ]
      }
    ]
  },
  {
    id: 'scam-call-1',
    title: 'AI Voice Clone Emergency',
    category: 'Scam Calls',
    difficulty: 2,
    timeLimit: 40,
    description: 'You receive a panicked call from someone who sounds exactly like your family member claiming an emergency.',
    icon: 'Phone',
    steps: [
      {
        prompt: 'Your phone rings. The voice on the other end sounds exactly like your daughter, crying:\n\n"Mom/Dad! I\'ve been in a car accident! I\'m hurt and I need money right away for the hospital. They won\'t treat me without a deposit. Please send $3,000 via Zelle to this number right now! Don\'t call anyone else, I\'m using a nurse\'s phone!"',
        visualType: 'phone',
        visualData: {
          callerName: 'Unknown Number',
          callerNumber: '+1 (555) 0178',
          duration: '0:45',
          transcript: '"Mom/Dad! I\'ve been in a car accident! I\'m hurt and I need money right away for the hospital. They won\'t treat me without a deposit. Please send $3,000 via Zelle to this number right now! Don\'t call anyone else, I\'m using a nurse\'s phone!"'
        },
        options: [
          {
            text: 'Send the money immediately — my child needs help!',
            isCorrect: false,
            feedback: '❌ This is an AI voice cloning scam! Scammers can now clone anyone\'s voice using just a few seconds of audio from social media. They use urgency and emotion to override your judgment.',
            defenseTip: 'AI can now clone voices with eerie accuracy. Establish a family code word that only you and family members know, to verify identity in emergencies.'
          },
          {
            text: 'Hang up and call my daughter directly on her real number',
            isCorrect: true,
            feedback: '✅ Excellent response! Always verify by calling the person directly on their known number. In 99% of these cases, your family member is perfectly safe.',
            defenseTip: 'If someone claims to be a family member in an emergency, hang up and call them directly. Hospitals never refuse emergency treatment due to upfront payment.'
          },
          {
            text: 'Ask them personal questions only my daughter would know',
            isCorrect: false,
            feedback: '⚠️ Asking questions is better than sending money immediately, but sophisticated scammers may have researched your family through social media. The safest move is to hang up and call directly.',
            defenseTip: 'Social media profiles give scammers plenty of personal details. A verified callback to a known number is more reliable than quiz questions.'
          },
          {
            text: 'Ask for the hospital name and say I\'ll come in person',
            isCorrect: false,
            feedback: '⚠️ Buying time is good, but the scammer may provide a fake hospital name. The best action is to hang up and verify independently.',
            defenseTip: 'Scammers are prepared for stalling tactics. Disconnect and independently verify the situation through known contacts.'
          }
        ]
      }
    ]
  },
  {
    id: 'scam-call-2',
    title: 'Fake Tech Support Call',
    category: 'Scam Calls',
    difficulty: 1,
    description: 'Someone claiming to be from Microsoft calls saying your computer has been compromised.',
    icon: 'Phone',
    steps: [
      {
        prompt: 'You receive a call from someone with a professional tone:\n\n"Hello, this is David from Microsoft Windows Security Center. We\'ve detected that your computer is sending error reports and has been compromised by hackers. I need to remote into your computer to fix this issue before your personal data is stolen. Can you please go to your computer and follow my instructions?"',
        visualType: 'phone',
        visualData: {
          callerName: 'Microsoft Support',
          callerNumber: '+1 (800) 555-0199',
          duration: '1:20',
          transcript: '"Hello, this is David from Microsoft Windows Security Center. We\'ve detected that your computer is sending error reports and has been compromised by hackers. I need to remote into your computer to fix this issue..."'
        },
        options: [
          {
            text: 'Follow their instructions to fix my computer',
            isCorrect: false,
            feedback: '❌ Microsoft NEVER makes unsolicited calls about computer problems. This is a tech support scam designed to gain remote access to your computer and steal data or install malware.',
            defenseTip: 'No legitimate tech company will ever cold-call you about computer problems. If you have concerns, visit the official website directly.'
          },
          {
            text: 'Hang up immediately — this is a scam',
            isCorrect: true,
            feedback: '✅ Correct! Microsoft and other tech companies never make unsolicited phone calls about computer issues. Hanging up is the right response.',
            defenseTip: 'Tech support scams are extremely common. Remember: legitimate companies don\'t cold-call customers about technical issues.'
          }
        ]
      }
    ]
  },
  {
    id: 'malware-1',
    title: 'Fake Antivirus Popup',
    category: 'Malware',
    difficulty: 1,
    description: 'A scary popup appears on your screen claiming your computer is infected with 47 viruses.',
    icon: 'Bug',
    steps: [
      {
        prompt: 'While browsing the web, a full-screen popup appears with flashing red warnings:\n\n"⚠️ CRITICAL ALERT: Your computer is infected with 47 viruses!\n\nYour personal data, passwords, and banking information are at risk!\n\nWindows Defender has FAILED. Download our Advanced Security Scanner NOW to remove threats immediately!\n\n[DOWNLOAD PROTECTION NOW] [Call Support: 1-888-555-0147]"\n\nThe popup is making alarm sounds and you can\'t easily close it.',
        visualType: 'popup',
        visualData: {
          title: '⚠️ CRITICAL SECURITY ALERT',
          message: 'Your computer is infected with 47 viruses!\n\nYour personal data, passwords, and banking information are at risk!\n\nWindows Defender has FAILED.',
          buttonText: 'DOWNLOAD PROTECTION NOW',
          phoneNumber: '1-888-555-0147',
          isFlashing: true
        },
        options: [
          {
            text: 'Click "Download Protection Now" to fix the problem',
            isCorrect: false,
            feedback: '❌ This is scareware — fake antivirus software! Clicking that download would actually install malware on your computer. No legitimate security tool uses alarming popups like this.',
            defenseTip: 'Real antivirus software never uses browser popups with alarm sounds. Browser-based virus scans are impossible — only installed software can scan your system.'
          },
          {
            text: 'Close the browser using Task Manager (Ctrl+Alt+Delete)',
            isCorrect: true,
            feedback: '✅ Perfect! Using Task Manager to force-close the browser is the safest approach. These popups are just web pages — they can\'t actually scan your computer.',
            defenseTip: 'If you can\'t close a popup normally, use Task Manager (Ctrl+Shift+Esc). Then clear your browser cache and cookies.'
          }
        ]
      }
    ]
  },
  {
    id: 'malware-2',
    title: 'Infected USB Drive',
    category: 'Malware',
    difficulty: 2,
    timeLimit: 45,
    description: 'You find a USB drive labeled "Salary Data" in the office parking lot.',
    icon: 'Bug',
    steps: [
      {
        prompt: 'You find a USB drive in the office parking lot. It has a label that reads "Confidential - Employee Salary Data Q4". You\'re curious about it. What do you do?',
        visualType: 'usb-sim',
        options: [
          {
            text: 'Plug it into my work computer to see what\'s on it',
            isCorrect: false,
            feedback: '❌ This is a classic "USB drop attack"! Attackers deliberately leave infected USB drives in locations where curious employees will find and plug them in.',
            defenseTip: 'Never plug unknown USB drives into any computer. USB-based attacks can bypass most security software and execute automatically.'
          },
          {
            text: 'Turn it in to the IT security team',
            isCorrect: true,
            feedback: '✅ Excellent! IT security teams have isolated sandbox environments to safely analyze suspicious devices.',
            defenseTip: 'Always turn in found USB drives to IT security. They have specialized tools and isolated systems to safely examine suspicious devices.'
          }
        ]
      }
    ]
  },
  {
    id: 'social-eng-1',
    title: 'The Tailgating Stranger',
    category: 'Social Engineering',
    difficulty: 1,
    description: 'Someone in a delivery uniform asks you to hold the secure door open for them.',
    icon: 'Users',
    steps: [
      {
        prompt: 'You\'re entering your company\'s secure office building through the badge-access door. A person in a delivery uniform carrying several boxes approaches behind you:\n\n"Hey, can you hold the door? My hands are full and I can\'t reach my badge. I have a delivery for the 3rd floor. These packages are heavy!"',
        visualType: 'chat',
        visualData: {
          sender: 'Delivery Person',
          messages: ["Hey, can you hold the door? My hands are full and I can't reach my badge."]
        },
        options: [
          {
            text: 'Hold the door open — they\'re clearly a delivery person',
            isCorrect: false,
            feedback: '❌ This is "tailgating" — a common social engineering technique! Uniforms don\'t equal authorization.',
            defenseTip: 'Uniforms don\'t equal authorization. Always require proper badge access, even if it feels awkward.'
          },
          {
            text: 'Politely decline and direct them to the front reception desk',
            isCorrect: true,
            feedback: '✅ Perfect response! Directing them to reception ensures proper visitor authentication while remaining professional.',
            defenseTip: 'Always direct unknown visitors to reception/security. Legitimate visitors and delivery workers understand and expect security procedures.'
          }
        ]
      }
    ]
  },
  {
    id: 'social-eng-2',
    title: 'LinkedIn Impersonation',
    category: 'Social Engineering',
    difficulty: 2,
    timeLimit: 40,
    description: 'A recruiter on LinkedIn asks for your personal information for an amazing job opportunity.',
    icon: 'Users',
    steps: [
      {
        prompt: 'You receive a LinkedIn message from "Sarah Chen, Senior Recruiter at Google":\n\n"Hi! I came across your profile and I\'m very impressed. We have an exciting role that matches your skills perfectly — Senior Developer at Google with a $200K+ salary.\n\nTo fast-track your application, I just need: full name, DOB, SSN, address, and a copy of your driver\'s license."',
        visualType: 'chat',
        visualData: {
          sender: 'Sarah Chen - Google Recruiter',
          messages: ["To fast-track your application, I just need: full name, DOB, SSN, address, and a copy of your driver's license."]
        },
        options: [
          {
            text: 'Send the requested information — this is an amazing opportunity!',
            isCorrect: false,
            feedback: '❌ This is an identity theft attempt! No legitimate recruiter asks for SSN or driver\'s license in an initial message.',
            defenseTip: 'Legitimate recruiters NEVER ask for SSN, government IDs, or personal financial information before you\'ve even interviewed.'
          },
          {
            text: 'Ignore the message and report the profile as suspicious',
            isCorrect: true,
            feedback: '✅ Great instinct! This has all the red flags: unsolicited contact, too-good-to-be-true offer, and requests for sensitive info.',
            defenseTip: 'Red flags in recruiter messages: 1) Asking for SSN/ID early, 2) Unusual urgency, 3) Salary too good to be true.'
          }
        ]
      }
    ]
  },
  {
    id: 'phishing-3',
    title: 'Prize Winner Notification',
    category: 'Phishing',
    difficulty: 1,
    description: 'An email congratulates you on winning a prize in a contest you never entered.',
    icon: 'Mail',
    steps: [
      {
        prompt: 'You receive an email: "🎉 Congratulations! You\'ve Won £500,000! To claim your prize, please provide your bank details and pay a $50 processing fee via Western Union."',
        visualType: 'email',
        visualData: {
          from: 'prizes@international-lottery-uk.com',
          subject: '🎉 Congratulations! You\'ve Won £500,000!',
          body: 'You have won £500,000 GBP! To claim, pay a $50 processing fee via Western Union.'
        },
        options: [
          {
            text: 'Pay the fee and claim the prize',
            isCorrect: false,
            feedback: '❌ This is an advance fee scam! You can\'t win a lottery you never entered.',
            defenseTip: 'Golden rule: You cannot win a contest you didn\'t enter. Any "prize" requiring upfront payment is a scam.'
          },
          {
            text: 'Delete the email',
            isCorrect: true,
            feedback: '✅ Correct! You can\'t win something you never entered. This is a classic advance fee fraud.',
            defenseTip: 'Remember: If it sounds too good to be true, it is. Real prizes never require upfront payments.'
          }
        ]
      }
    ]
  },
  // --- NEW 15 SCENARIOS START HERE ---
  {
    id: 'scam-call-kyc',
    title: 'Bank KYC Emergency',
    category: 'Scam Calls',
    difficulty: 1,
    description: 'A "bank official" calls claiming your account will be blocked unless you update your KYC immediately.',
    icon: 'Phone',
    steps: [
      {
        prompt: 'Your phone rings. A serious-sounding man says:\n\n"This is Rahul from HDFC Bank HQ. We are conducting a mandatory KYC update. If you don\'t verify your identity now, your account and debit card will be suspended for 48 hours. I need you to confirm your details immediately."',
        visualType: 'phone',
        visualData: { caller: 'Bank Official', transcript: '"This is Rahul from HDFC Bank. Your KYC has expired! I need to confirm your details immediately."' },
        options: [
          {
            text: 'Provide the requested details to avoid suspension',
            isCorrect: false,
            feedback: '❌ This is a high-pressure scam! Banks never threaten to block your account over the phone or demand KYC details via an unsolicited call.',
            defenseTip: 'Scammers use "fear of loss" to make you act without thinking. Real banks will never ask for sensitive data over the phone.'
          },
          {
            text: 'Tell him I will visit the branch and update it in person',
            isCorrect: true,
            feedback: '✅ Perfect! Legitimate bank staff will always encourage you to visit the branch or use the official app for KYC updates.',
            defenseTip: 'Always verify through official channels. Hanging up and calling the official number on your bank card is the safest move.'
          }
        ]
      }
    ]
  },
  {
    id: 'deepfake-scam',
    title: 'AI Face Swap Video',
    category: 'Social Engineering',
    difficulty: 3,
    description: 'A friend "video calls" you on WhatsApp asking for urgent medical funds.',
    icon: 'Video',
    steps: [
      {
        prompt: 'You get a short video call from your best friend, Amit. He looks distressed and says:\n\n"Hey, I\'m in the hospital, need to pay for a surgery deposit. My UPI isn\'t working. Can you send ₹20,000 to this number?"\n\nThe video is a bit grainy and his voice cuts out slightly.',
        visualType: 'chat',
        visualData: { sender: 'Amit', messages: [{ text: "I'm in the hospital! Please send ₹20,000 to 9876543210@upi." }] },
        options: [
          {
            text: 'Send the money immediately since it\'s an emergency',
            isCorrect: false,
            feedback: '❌ Careful! This could be a Deepfake scam. AI can now mirror faces and voices with high accuracy.',
            defenseTip: 'In "emergency" calls from friends, always verify by asking a question only they would know, or call them back on their regular line.'
          },
          {
            text: 'Ask him: "What was the name of the cafe we went to last Tuesday?"',
            isCorrect: true,
            feedback: '✅ Smart! Using a "Personal Verification Question" is the best way to beat AI deepfakes. A scammer won\'t know your personal history.',
            defenseTip: 'Deepfakes can\'t handle real-time personal interrogation. Always challenge the identity of someone asking for money via video.'
          }
        ]
      }
    ]
  },
  {
    id: 'wifi-trap',
    title: 'Free Public WiFi Trap',
    category: 'Network Security',
    difficulty: 1,
    description: 'You are at an airport and see multiple free WiFi networks.',
    icon: 'Wifi',
    steps: [
      {
        prompt: 'You\'re waiting for your flight and need to check your bank balance. You see several WiFi networks. Which one do you join?',
        visualType: 'wifi',
        visualData: {
          networks: [
            { name: 'Airport_Official_Secure', isLocked: true },
            { name: 'FREE_AIRPORT_WIFI_FAST', isLocked: false, isSuspicious: true },
            { name: 'Starbucks_Guest', isLocked: false }
          ]
        },
        options: [
          {
            text: 'Join "FREE_AIRPORT_WIFI_FAST" — it\'s open and looks easy',
            isCorrect: false,
            feedback: '❌ This is a "Man-in-the-Middle" trap! Attackers set up "Evil Twin" hotspots to intercept your traffic.',
            defenseTip: 'Avoid "Open" (unlocked) public WiFi for sensitive tasks. Use a VPN or your mobile hotspot.'
          },
          {
            text: 'Use my mobile data (Hotspot) for banking',
            isCorrect: true,
            feedback: '✅ Excellent choice! Using your own cellular data is much more secure than any public WiFi network.',
            defenseTip: 'Public WiFi is inherently risky. For financial transactions, always use a trusted mobile connection.'
          }
        ]
      }
    ]
  },
  {
    id: 'job-offer-email',
    title: 'Fake Job Offer Email',
    category: 'Phishing',
    difficulty: 2,
    description: 'You receive an email for a high-paying remote job you never applied for.',
    icon: 'Briefcase',
    steps: [
      {
        prompt: 'You receive an email from "hr@global-tech-hiring.com":\n\n"Congratulations! Your profile was selected for a Data Entry role. Salary: $5000/month. We just need you to buy a specific laptop. We will reimburse you after you pay the $200 delivery fee."',
        visualType: 'email',
        visualData: { from: 'hr@global-tech-hiring.com', subject: 'Job Offer: Data Entry Specialist', body: 'We are pleased to offer you the position! Please pay the $200 Equipment Shipping Fee to our vendor.' },
        options: [
          {
            text: 'Pay the $200 fee — it\'s a great salary',
            isCorrect: false,
            feedback: '❌ This is a Job Scam! No legitimate employer asks a candidate to pay for equipment or shipping fees before starting.',
            defenseTip: 'Red flags: Unsolicited offers, high pay for low skill, and any request for upfront money.'
          },
          {
            text: 'Search for the company name and HR person on LinkedIn',
            isCorrect: true,
            feedback: '✅ Good move! Investigating the company often reveals they don\'t exist or the recruiter is an imposter.',
            defenseTip: 'Always research employers. If the email domain doesn\'t match the official website, it\'s almost certainly a scam.'
          }
        ]
      }
    ]
  },
  {
    id: 'otp-scam',
    title: 'OTP Verification Scam',
    category: 'Scam Calls',
    difficulty: 2,
    description: 'A call about a "blocked transaction" asks for a verification code.',
    icon: 'Shield',
    steps: [
      {
        prompt: 'Your phone pings with an OTP for a $500 purchase. Immediately, a "Security Officer" calls:\n\n"Sir, we just blocked a fraud attempt. To cancel the transaction, I have sent a cancellation code to your phone. Please read it to me now."',
        visualType: 'phone',
        visualData: { caller: 'Bank Security', transcript: '"We blocked a fraud attempt! I need the 6-digit code sent to your phone to reverse the charge."' },
        options: [
          {
            text: 'Give them the code to stop the fraud',
            isCorrect: false,
            feedback: '❌ No! That code IS the transaction. By giving it to them, you are AUTHORIZING the scammer to steal your money.',
            defenseTip: 'Banks will NEVER ask for an OTP or verification code over the phone. The code itself often says "Do not share."'
          },
          {
            text: 'Hang up and manually lock my card via the official bank app',
            isCorrect: true,
            feedback: '✅ That\'s the safe way! Taking control via the official app ensures no one can manipulate you.',
            defenseTip: 'If you receive an unexpected OTP, someone has your password or card details. Changing your password is the right move.'
          }
        ]
      }
    ]
  },
  {
    id: 'fake-loan-app',
    title: 'Fake Loan App Download',
    category: 'Malware',
    difficulty: 2,
    description: 'An ad promises instant loans with "zero documentation" via an app.',
    icon: 'Download',
    steps: [
      {
        prompt: 'You see an ad: "Need cash now? Download QuickLoan! Instant transfer." You install it, and it asks: "Allow access to Contacts, Gallery, and SMS messages?"',
        visualType: 'popup',
        visualData: { title: 'Permission Request', message: 'QuickLoan needs access to your:\n- Contacts\n- Photos & Videos\n- SMS Messages', buttonText: 'ALLOW ALL' },
        options: [
          {
            text: 'Allow permissions — they probably need it for verification',
            isCorrect: false,
            feedback: '❌ Danger! Fake loan apps use these permissions to steal your contact list and blackmail you.',
            defenseTip: 'Only download financial apps from trusted stores (Play Store/App Store) and check if they are regulated.'
          },
          {
            text: 'Deny permissions and uninstall the app',
            isCorrect: true,
            feedback: '✅ Smart. A loan app has no legitimate reason to access your entire contact list.',
            defenseTip: 'Malicious apps hide their true intent behind requests for broad access to your data.'
          }
        ]
      }
    ]
  },
  {
    id: 'qr-payment-scam',
    title: 'QR Code Payment Scam',
    category: 'Phishing',
    difficulty: 1,
    description: 'A sticker on a public payment stand looks a bit "off".',
    icon: 'QrCode',
    steps: [
      {
        prompt: 'You scan a GPay sticker to pay ₹20. The page it opens asks for your UPI PIN to "receive a ₹500 cashback".',
        visualType: 'browser',
        visualData: { url: 'pay-tm-rewards.net', pageTitle: 'Cashback Earned!', pageContent: 'Enter your UPI PIN to claim ₹500 now.', submitButton: 'Claim Reward' },
        options: [
          {
            text: 'Enter my UPI PIN to get the ₹500',
            isCorrect: false,
            feedback: '❌ Stop! You NEVER need a PIN to RECEIVE money. This is a scam to drain your account.',
            defenseTip: 'Scammers paste their own QR stickers over legitimate ones. UPI PIN is only for SENDING money.'
          },
          {
            text: 'Close the page and inform the shopkeeper',
            isCorrect: true,
            feedback: '✅ Perfect! You spotted the scam and helped protect others.',
            defenseTip: 'If a QR code leads to a suspicious URL or asks for a PIN to "receive" money, it is a 100% scam.'
          }
        ]
      }
    ]
  },
  {
    id: 'fake-social-request',
    title: 'Fake Social Media Account',
    category: 'Social Engineering',
    difficulty: 1,
    description: 'You receive a friend request from someone you\'re already friends with.',
    icon: 'UserPlus',
    steps: [
      {
        prompt: 'You get a request from "Priya Sharma". You are already friends with her. A message follows:\n\n"Hey! My old account was hacked. Can you click this link to help me recover it?"',
        visualType: 'chat',
        visualData: { sender: 'Priya Sharma (New)', messages: [{ text: "Hey! Lost my old account. Please click: bit.ly/proxy-auth-99" }] },
        options: [
          {
            text: 'Click the link to help her out',
            isCorrect: false,
            feedback: '❌ This is a "Cloned Profile" attack. The link likely steals your own login cookies.',
            defenseTip: 'Always verify duplicate requests through a different channel. Never click short-links from "new" accounts.'
          },
          {
            text: 'Report the profile and message the original Priya',
            isCorrect: true,
            feedback: '✅ Excellent! Reporting fake profiles helps platform security.',
            defenseTip: 'Cybercriminals clone profiles to exploit the trust you have in your friends.'
          }
        ]
      }
    ]
  },
  {
    id: 'phishing-password-reset',
    title: 'Phishing Password Reset',
    category: 'Phishing',
    difficulty: 2,
    description: 'An urgent "Security Alert" claims someone logged into your account.',
    icon: 'Mail',
    steps: [
      {
        prompt: 'You get an email: "Critical Security Alert! A new login from Moscow was detected on your Google Account. Click below to secure your account immediately."',
        visualType: 'email',
        visualData: { from: 'no-reply@accounts-google-verify.com', subject: 'Critical Security Alert', body: 'Someone has your password! Secure your account now.', buttonText: 'SECURE ACCOUNT' },
        options: [
          {
            text: 'Click "Secure Account" and change my password',
            isCorrect: false,
            feedback: '❌ The email is from "accounts-google-verify.com", not "google.com". The link leads to a fake login page.',
            defenseTip: 'Never click security links in emails. Go directly to the official site and check your settings.'
          },
          {
            text: 'Go to the official Google website directly',
            isCorrect: true,
            feedback: '✅ That\'s the gold standard for safety! By bypassing the email link, you stay secure.',
            defenseTip: 'Legitimate security alerts will also appear in your account dashboard on the official website.'
          }
        ]
      }
    ]
  },
  {
    id: 'usb-drop-attack',
    title: 'USB Drop Attack',
    category: 'Social Engineering',
    difficulty: 2,
    description: 'You find a USB drive labeled "HR SALARY" in the elevator.',
    icon: 'HardDrive',
    steps: [
      {
        prompt: 'You find a USB drive in the office elevator. It has a hand-written label: "CONFIDENTIAL: 2024 BUDGET". What do you do?',
        visualType: 'usb-sim',
        options: [
          {
            text: 'Plug it in to see if I\'m getting a raise',
            isCorrect: false,
            feedback: '❌ Failed! This is a "Baiting" attack. Scammers use labels like "Salary" to exploit curiosity.',
            defenseTip: 'Unknown USBs can execute scripts that take over your computer in seconds. Keep them away!'
          },
          {
            text: 'Hand it over to IT Security immediately',
            isCorrect: true,
            feedback: '✅ Correct. IT can safely investigate and see if this was a targeted attack.',
            defenseTip: 'Plugging in a random USB is like inviting a stranger to sit at your desk. Don\'t do it!'
          }
        ]
      }
    ]
  },
  {
    id: 'gaming-reward-scam',
    title: 'Online Gaming Reward Scam',
    category: 'Social Engineering',
    difficulty: 1,
    description: 'A site promises free skins for your favorite game if you link your account.',
    icon: 'Gamepad',
    steps: [
      {
        prompt: 'You see a video: "FREE SKIN GLITCH! Go to skins-gen-24.pro and link your Steam account!" The site looks like the official Steam login.',
        visualType: 'browser',
        visualData: { url: 'skins-gen-24.pro/auth/steam', pageTitle: 'Link Your Account', pageContent: 'Enter credentials to receive reward.', submitButton: 'Login to Steam' },
        options: [
          {
            text: 'Enter my credentials to claim the skin',
            isCorrect: false,
            feedback: '❌ You just lost your account! This is a phishing site designed to steal your gaming credentials.',
            defenseTip: 'Official rewards never happen on third-party sites. Link accounts only through official menus.'
          },
          {
            text: 'Close the tab',
            isCorrect: true,
            feedback: '✅ Great! You saved your account. High-value skins are never given away for free by third-parties.',
            defenseTip: 'If you ever enter credentials on a suspect site, change your password immediately on the real site.'
          }
        ]
      }
    ]
  },
  {
    id: 'instagram-verify-scam',
    title: 'Instagram Verification Scam',
    category: 'Social Engineering',
    difficulty: 1,
    description: 'A DM from "Support_Verified_7" offers a blue checkmark for a fee.',
    icon: 'Instagram',
    steps: [
      {
        prompt: 'You get a DM from an account with the Instagram logo: "Hello! You are eligible for the Verification Badge. Pay a $15 fee via this link. Your badge will appear in 2 hours!"',
        visualType: 'chat',
        visualData: { sender: 'Insta Support', messages: [{ text: "Congrats! You are eligible for the Blue Tick. Pay $15: verification-porta-meta.com" }] },
        options: [
          {
            text: 'Pay the $15 — it\'s a small price',
            isCorrect: false,
            feedback: '❌ Instagram never asks for money for verification via DMs. This is a scam to steal your credit card.',
            defenseTip: 'Official verification happens through the app settings, not via random DMs.'
          },
          {
            text: 'Report the account for impersonation',
            isCorrect: true,
            feedback: '✅ Spot on! Reporting these accounts helps take down scam networks.',
            defenseTip: 'Look at the sender\'s handle. If it\'s not a verified official account, it\'s a scam.'
          }
        ]
      }
    ]
  },
  {
    id: 'tech-support-popup',
    title: 'Fake Tech Support Popup',
    category: 'Malware',
    difficulty: 2,
    description: 'Your browser suddenly freezes with a loud siren sound and a warning.',
    icon: 'AlertOctagon',
    steps: [
      {
        prompt: 'A popup takes over your screen. A siren blares: "⚠️ WINDOWS HAS BEEN BLOCKED! Error #2X-99. Call Microsoft Support at 1-800-SAFE-PC to unlock."',
        visualType: 'popup',
        visualData: { title: '⚠️ SYSTEM THREAT', message: 'Your system is now locked. Call 1-800-SAFE-PC for help.', buttonText: 'CONTACT SUPPORT', isFlashing: true },
        options: [
          {
            text: 'Call the number',
            isCorrect: false,
            feedback: '❌ No! This is a Tech Support Scam. They will charge you hundreds for "fixing" a non-existent problem.',
            defenseTip: 'Legitimate OS errors never include a phone number to call.'
          },
          {
            text: 'Press Alt+F4 or use Task Manager',
            isCorrect: true,
            feedback: '✅ Correct. This is just a malicious website designed to scare you.',
            defenseTip: 'If your browser freezes, use Task Manager (Ctrl+Shift+Esc) to end the task.'
          }
        ]
      }
    ]
  },
  {
    id: 'charity-donation-request',
    title: 'Fake Charity Request',
    category: 'Social Engineering',
    difficulty: 1,
    description: 'An emotional message asks for donations after a major earthquake.',
    icon: 'Heart',
    steps: [
      {
        prompt: 'You see a post: "Thousands are homeless! Help the victims of the quake. Donate via Crypto or Gift Cards to ensure it reaches them instantly!"',
        visualType: 'social-feed',
        visualData: { posts: [{ author: 'QuakeReliefNow', content: 'URGENT: Donate via BTC or Amazon Gift Cards to help earthquake victims now!', timeAgo: '2m' }] },
        options: [
          {
            text: 'Donate via Amazon Gift Cards',
            isCorrect: false,
            feedback: '❌ Beware! Real charities never ask for donations via Gift Cards. These payments are untraceable.',
            defenseTip: 'In times of crisis, scammers exploit empathy. Use official websites of established organizations.'
          },
          {
            text: 'Look for the charity on "Charity Navigator" first',
            isCorrect: true,
            feedback: '✅ Wise choice! Researching the legitimacy ensures your money actually helps.',
            defenseTip: 'Fake charities often use names that sound similar to real ones.'
          }
        ]
      }
    ]
  },
  {
    id: 'shopping-deal-scam',
    title: 'Online Shopping Deal Scam',
    category: 'Phishing',
    difficulty: 1,
    description: 'A Facebook ad shows an "iPhone 15 for $99" as part of a warehouse clearance.',
    icon: 'ShoppingBag',
    steps: [
      {
        prompt: 'You click an ad for "Amazon-Clearance-Sale.shop". It says: "Only 3 units left! iPhone 15 Pro - $99.00". The checkout asks for your credit card.',
        visualType: 'browser',
        visualData: { url: 'amazon-clearance-sale.shop', pageTitle: 'Amazon Clearance', pageContent: 'iPhone 15 Pro: $99.99. Enter Payment Details.', submitButton: 'Buy Now' },
        options: [
          {
            text: 'Enter my card info',
            isCorrect: false,
            feedback: '❌ It\'s a scam! You won\'t get an iPhone, but they will steal your credit card details.',
            defenseTip: 'If a price seems impossibly low, it\'s a scam. Check the URL domains carefully.'
          },
          {
            text: 'Check the official Amazon app',
            isCorrect: true,
            feedback: '✅ Perfect! If it\'s not on the official app, the ad is a lie.',
            defenseTip: 'Scammers create "lookalike" sites to steal financial data.'
          }
        ]
      }
    ]
  }
];

export default scenarios;
