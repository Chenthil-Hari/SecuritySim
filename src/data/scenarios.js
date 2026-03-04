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
        visualType: 'decision',
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
      },
      {
        prompt: 'You hung up and called your daughter directly. She\'s perfectly safe and confused by your call. What do you do next?',
        visualType: 'decision',
        options: [
          {
            text: 'Feel relieved and forget about it',
            isCorrect: false,
            feedback: '⚠️ You should report this! These scammers target many people, and your report could help stop them.',
            defenseTip: 'Always report scam calls to the FTC (reportfraud.ftc.gov) and your phone carrier to help prevent others from being victimized.'
          },
          {
            text: 'Report the scam number to FTC, warn family members, and block the number',
            isCorrect: true,
            feedback: '✅ Comprehensive response! Reporting helps authorities track scam networks, and warning family protects them from similar attempts.',
            defenseTip: 'After any scam attempt: 1) Report to FTC, 2) Report to phone carrier, 3) Block the number, 4) Warn friends and family.'
          },
          {
            text: 'Call the scam number back to confront them',
            isCorrect: false,
            feedback: '❌ Never call scammers back! This confirms your number is active, and they may use the conversation to harvest more voice data for future scams.',
            defenseTip: 'Engaging with scammers only provides them more data and marks your number as responsive for future targeting.'
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
          },
          {
            text: 'Ask for their employee ID and call Microsoft to verify',
            isCorrect: false,
            feedback: '⚠️ While verification is good thinking, scammers will give you a fake ID and even a fake callback number. Since Microsoft never makes these calls, just hang up.',
            defenseTip: 'Scammers can create elaborate verification systems. The key insight is that Microsoft never initiates these calls in the first place.'
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
            text: 'Call the support number for help',
            isCorrect: false,
            feedback: '❌ That phone number connects to scammers who will try to charge you for fake services or gain remote access to your computer.',
            defenseTip: 'Never call phone numbers shown in browser popups. They connect to scam call centers, not legitimate tech support.'
          },
          {
            text: 'Close the browser using Task Manager (Ctrl+Alt+Delete)',
            isCorrect: true,
            feedback: '✅ Perfect! Using Task Manager to force-close the browser is the safest approach. These popups are just web pages — they can\'t actually scan your computer.',
            defenseTip: 'If you can\'t close a popup normally, use Task Manager (Ctrl+Alt+Del → Task Manager → End Task). Then clear your browser cache and cookies.'
          },
          {
            text: 'Try clicking the X button to close the popup',
            isCorrect: false,
            feedback: '⚠️ Be careful! The "X" button on fake popups may actually be another download link in disguise. Use Task Manager for a clean close.',
            defenseTip: 'Scareware popups often disguise their close buttons as additional download triggers. Always use Task Manager or Alt+F4 instead.'
          }
        ]
      },
      {
        prompt: 'You closed the popup successfully using Task Manager. What should you do next to ensure your computer is safe?',
        visualType: 'decision',
        options: [
          {
            text: 'Run a scan with my already-installed, legitimate antivirus',
            isCorrect: true,
            feedback: '✅ Great thinking! Running a scan with your existing legitimate antivirus will confirm your system is clean. Also clear your browser cache.',
            defenseTip: 'After any scareware encounter: 1) Run your real antivirus, 2) Clear browser cache and cookies, 3) Check browser extensions, 4) Consider an ad blocker.'
          },
          {
            text: 'Search Google for "free virus scan" and use the first result',
            isCorrect: false,
            feedback: '❌ Searching for free virus scans can lead to more scareware! Stick with known, reputable antivirus software you already have installed.',
            defenseTip: 'Free virus scanner search results are a common way to distribute malware. Only use well-known, established security software.'
          },
          {
            text: 'Do nothing — I closed it so I\'m fine',
            isCorrect: false,
            feedback: '⚠️ While you probably didn\'t download anything, it\'s always good practice to run a scan and clear your browser cache after encountering scareware.',
            defenseTip: 'Even after safely closing scareware, run a scan as a precaution. The website may have attempted background downloads.'
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
        visualType: 'decision',
        options: [
          {
            text: 'Plug it into my work computer to see what\'s on it',
            isCorrect: false,
            feedback: '❌ This is a classic "USB drop attack"! Attackers deliberately leave infected USB drives in locations where curious employees will find and plug them in. The malware can start running the moment you insert it.',
            defenseTip: 'Never plug unknown USB drives into any computer. USB-based attacks can bypass most security software and execute automatically.'
          },
          {
            text: 'Plug it into a personal computer at home — it can\'t be tracked',
            isCorrect: false,
            feedback: '❌ Your personal computer is even MORE vulnerable than a work computer, which likely has enterprise security. The USB could contain malware that steals personal data.',
            defenseTip: 'Unknown USB drives are dangerous on ANY computer. The malware doesn\'t care if it\'s a personal or work machine.'
          },
          {
            text: 'Turn it in to the IT security team',
            isCorrect: true,
            feedback: '✅ Excellent! IT security teams have isolated sandbox environments to safely analyze suspicious devices. They can determine if it\'s a threat and protect the organization.',
            defenseTip: 'Always turn in found USB drives to IT security. They have specialized tools and isolated systems to safely examine suspicious devices.'
          },
          {
            text: 'Throw it in the trash to be safe',
            isCorrect: false,
            feedback: '⚠️ While not plugging it in is good, throwing it away means IT can\'t investigate whether this is a targeted attack on your organization.',
            defenseTip: 'Reporting suspicious devices helps IT security identify potential targeted attacks and strengthen organizational defenses.'
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
          messages: [
            "Hey, can you hold the door? My hands are full and I can't reach my badge. I have a delivery for the 3rd floor. These packages are heavy!"
          ]
        },
        options: [
          {
            text: 'Hold the door open — they\'re clearly a delivery person',
            isCorrect: false,
            feedback: '❌ This is "tailgating" — a common social engineering technique! Anyone can buy a delivery uniform. By holding the door, you give an unauthorized person access to your secure building.',
            defenseTip: 'Uniforms don\'t equal authorization. Always require proper badge access, even if it feels awkward. Real delivery workers are accustomed to check-in procedures.'
          },
          {
            text: 'Politely decline and direct them to the front reception desk',
            isCorrect: true,
            feedback: '✅ Perfect response! Directing them to reception ensures proper visitor authentication while remaining professional. A legitimate delivery person won\'t mind using the proper entrance.',
            defenseTip: 'Always direct unknown visitors to reception/security. Legitimate visitors and delivery workers understand and expect security procedures.'
          },
          {
            text: 'Ask to see their delivery badge/ID before holding the door',
            isCorrect: false,
            feedback: '⚠️ Asking for ID is better than just letting them in, but you\'re not trained to verify delivery company IDs. The front desk or security team is equipped for this.',
            defenseTip: 'Leave visitor verification to trained security personnel or reception staff who have the tools and authority to properly authenticate visitors.'
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
        prompt: 'You receive a LinkedIn message from "Sarah Chen, Senior Recruiter at Google":\n\n"Hi! I came across your profile and I\'m very impressed. We have an exciting role that matches your skills perfectly — Senior Developer at Google with a $200K+ salary.\n\nTo proceed with the fast-track application, I just need a few details:\n- Full legal name & date of birth\n- Current address\n- Social Security Number (for background check)\n- Copy of your driver\'s license\n\nThis position fills quickly, so please respond within 24 hours!"',
        visualType: 'chat',
        visualData: {
          sender: 'Sarah Chen - Google Recruiter',
          messages: [
            "Hi! I came across your profile and I'm very impressed.",
            "We have an exciting Senior Developer role at Google — $200K+ salary!",
            "To fast-track your application, I just need: full name, DOB, SSN, address, and a copy of your driver's license.",
            "This position fills quickly — please respond within 24 hours!"
          ]
        },
        options: [
          {
            text: 'Send the requested information — this is an amazing opportunity!',
            isCorrect: false,
            feedback: '❌ This is an identity theft attempt! No legitimate recruiter asks for SSN, driver\'s license, or DOB in an initial message. This information would be used for identity fraud.',
            defenseTip: 'Legitimate recruiters NEVER ask for SSN, government IDs, or personal financial information before you\'ve even interviewed. These are classic identity theft red flags.'
          },
          {
            text: 'Ignore the message and report the profile as suspicious',
            isCorrect: true,
            feedback: '✅ Great instinct! This has all the red flags: unsolicited contact, too-good-to-be-true offer, urgency, and requests for sensitive personal information in the first message.',
            defenseTip: 'Red flags in recruiter messages: 1) Asking for SSN/ID early, 2) Unusual urgency, 3) Salary too good to be true, 4) No formal interview process.'
          },
          {
            text: 'Reply asking if this is a real Google position',
            isCorrect: false,
            feedback: '⚠️ Engaging even to question them confirms your account is active. The scammer will likely double down with more convincing lies.',
            defenseTip: 'If interested in a company, apply directly through their official careers page rather than responding to unsolicited messages.'
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
        prompt: 'You receive an email:\n\nFrom: prizes@international-lottery-uk.com\nSubject: 🎉 Congratulations! You\'ve Won £500,000!\n\n"OFFICIAL NOTIFICATION\n\nDear Winner,\n\nYour email address was selected in our international email lottery program. You have won £500,000 GBP!\n\nTo claim your prize, please provide:\n- Full Name\n- Address\n- Phone Number\n- Bank Account Details (for direct deposit)\n\nProcessing fee of $50 is required. Please send via Western Union to our claims agent.\n\nCongratulations!\nInternational Lottery Commission"',
        visualType: 'email',
        visualData: {
          from: 'prizes@international-lottery-uk.com',
          to: 'you@email.com',
          subject: '🎉 Congratulations! You\'ve Won £500,000!',
          body: 'OFFICIAL NOTIFICATION\n\nDear Winner,\n\nYour email address was selected in our international email lottery program. You have won £500,000 GBP!\n\nTo claim your prize, please provide:\n- Full Name, Address, Phone\n- Bank Account Details\n\nProcessing fee of $50 required via Western Union.',
          hasAttachment: false
        },
        options: [
          {
            text: '$50 is small compared to £500K — pay the fee and claim the prize',
            isCorrect: false,
            feedback: '❌ This is an advance fee scam! You can\'t win a lottery you never entered. The "processing fee" is just the beginning — they\'ll keep asking for more money.',
            defenseTip: 'Golden rule: You cannot win a contest you didn\'t enter. Any "prize" requiring upfront payment is a scam. Legitimate lotteries deduct fees from winnings.'
          },
          {
            text: 'Delete the email — you can\'t win a lottery you never entered',
            isCorrect: true,
            feedback: '✅ Correct! You can\'t win something you never entered. This is a classic advance fee fraud. The "small" processing fee is just the start of escalating demands.',
            defenseTip: 'Remember: If it sounds too good to be true, it is. You cannot win lotteries you never entered, and real prizes never require upfront payments.'
          },
          {
            text: 'Research the "International Lottery Commission" to see if it\'s real',
            isCorrect: false,
            feedback: '⚠️ While researching is a good instinct, the answer is clear: you can\'t win a lottery you never entered. Scammers often create official-looking websites to support their fraud.',
            defenseTip: 'Scammers create professional websites and even register business names. The fundamental question remains: did you enter this lottery? If not, it\'s a scam.'
          }
        ]
      }
    ]
  },
  {
    id: 'social-eng-3',
    title: 'Wi-Fi Honeypot Attack',
    category: 'Social Engineering',
    difficulty: 3,
    timeLimit: 35,
    description: 'You\'re at a coffee shop and see a free Wi-Fi network with a familiar name.',
    icon: 'Users',
    steps: [
      {
        prompt: 'You\'re at "Star Coffee" café working on your laptop. You need internet access. You see these available Wi-Fi networks:\n\n1. "StarCoffee_FREE" — No password required, strong signal\n2. "StarCoffee_Guest" — Requires password (ask at counter), moderate signal\n3. "Free_Public_WiFi" — No password required, strong signal\n\nWhich do you connect to?',
        visualType: 'decision',
        options: [
          {
            text: 'Connect to "StarCoffee_FREE" — it\'s free and has a strong signal',
            isCorrect: false,
            feedback: '❌ This could be an "Evil Twin" attack! Hackers create Wi-Fi networks with names similar to legitimate ones. Without password protection, they can intercept all your traffic.',
            defenseTip: 'Attackers set up fake Wi-Fi hotspots (Evil Twins) near popular locations. Always verify the official network name with staff.'
          },
          {
            text: 'Ask the barista for the official Wi-Fi name and password, then connect to "StarCoffee_Guest"',
            isCorrect: true,
            feedback: '✅ Perfect! Always verify the official Wi-Fi network with staff. Password-protected networks are significantly safer than open ones.',
            defenseTip: 'Always ask staff for the official network name and password. Use a VPN on any public Wi-Fi for an additional layer of security.'
          },
          {
            text: 'Connect to "Free_Public_WiFi" — it sounds like a municipal service',
            isCorrect: false,
            feedback: '❌ "Free_Public_WiFi" is one of the most common fake network names used by hackers. It\'s not a real municipal service.',
            defenseTip: 'Generic network names like "Free_Public_WiFi" or "Free Internet" are frequently used by attackers. Always be suspicious of unnamed, unprotected networks.'
          }
        ]
      },
      {
        prompt: 'You\'re connected to the verified coffee shop Wi-Fi. You need to check your bank account. What\'s the safest approach?',
        visualType: 'decision',
        options: [
          {
            text: 'Go ahead and log in — I\'m on the official Wi-Fi now',
            isCorrect: false,
            feedback: '⚠️ Even verified public Wi-Fi isn\'t fully secure. Other users on the same network could potentially intercept your banking data.',
            defenseTip: 'Public Wi-Fi, even legitimate ones, are shared networks. Avoid accessing sensitive accounts or use a VPN for encryption.'
          },
          {
            text: 'Use my phone\'s mobile data or a VPN for banking',
            isCorrect: true,
            feedback: '✅ Excellent security awareness! Using mobile data or a VPN provides a private, encrypted connection ideal for sensitive activities like banking.',
            defenseTip: 'For sensitive activities: 1) Use mobile data, 2) Use a trusted VPN service, 3) Check for HTTPS in the URL, 4) Enable 2FA on all accounts.'
          },
          {
            text: 'Use an incognito window for privacy',
            isCorrect: false,
            feedback: '❌ Incognito mode only prevents local browsing history storage. It does NOT encrypt your connection or protect against network-level snooping.',
            defenseTip: 'Incognito mode ≠ security. It only hides browsing history locally. For network security, you need encryption (VPN) or a private connection.'
          }
        ]
      }
    ]
  },
  {
    id: 'branching-1',
    title: 'The Suspicious USB Drive',
    category: 'Physical Security',
    difficulty: 2,
    description: 'A branching adventure: You find a USB drive in the office parking lot. Your decisions determine the outcome.',
    icon: 'AlertTriangle',
    steps: [
      {
        prompt: 'You are walking into the office and find a sleek, unlabeled 64GB USB drive lying next to a colleague\'s car in the parking lot. What do you do?',
        visualType: 'decision',
        options: [
          {
            text: 'Leave it there. It\'s not my problem.',
            isCorrect: false,
            feedback: '👎 While safe for you, leaving it means someone else might pick it up and plug it in, potentially compromising the company network.',
            defenseTip: 'Don\'t just ignore physical security risks. If you see something suspiciously out of place, report it or handle it safely.',
            nextStep: 3 // Skip to the bad ending
          },
          {
            text: 'Pick it up and plug it into my laptop to see whose it is, so I can return it.',
            isCorrect: false,
            feedback: '🚨 DANGER! This is a classic "USB Drop Attack". Merely plugging in a malicious USB can instantly silently install malware without you clicking anything (via HID spoofing or autorun).',
            defenseTip: 'NEVER plug an untrusted USB drive into any computer you care about.',
            nextStep: 1 // Go to malware infection branch
          },
          {
            text: 'Pick it up and give it directly to the IT Security team.',
            isCorrect: true,
            feedback: '✅ Perfect! The IT team has isolated "sandbox" computers specifically designed to safely examine suspicious devices without risking the network.',
            defenseTip: 'IT Security is equipped to handle unknown physical media safely.',
            nextStep: 2 // Go to good ending branch
          }
        ]
      },
      {
        // Branch 1: Plugged it in (Failure path)
        prompt: 'You plug the USB into your laptop. Nothing pops up on the screen, but your computer\'s fan suddenly spins up loudly. A command prompt window flashes for a millisecond and disappears. What now?',
        visualType: 'decision',
        options: [
          {
            text: 'Unplug it quickly and pretend nothing happened.',
            isCorrect: false,
            feedback: '❌ The damage is already done. Ignoring the situation allows the malware to spread across the corporate network, making you responsible for a major breach.',
            defenseTip: 'If you suspect you\'ve made a mistake, report it immediately! Security teams prefer fast reporting over silence.',
            nextStep: 3 // Go to bad ending
          },
          {
            text: 'Immediately disconnect from Wi-Fi/Ethernet and call IT Security.',
            isCorrect: true,
            feedback: '✅ Good recovery! By disconnecting from the network immediately, you prevented the malware from spreading to servers or other workstations.',
            defenseTip: 'If a device acts suspicious, the first step in incident response is isolation: disconnect from the network immediately.',
            nextStep: 4 // Go to neutral ending
          }
        ]
      },
      {
        // Branch 2: Gave to IT (Success path)
        prompt: 'You hand the drive to Sarah from IT Security. She plugs it into an air-gapped forensic machine. "Good catch," she says. "This is a Rubber Ducky — a device that pretends to be a keyboard and types malicious commands the millisecond it\'s plugged in. You just saved the company from a ransomware attack."\n\nHow do you respond?',
        visualType: 'decision',
        options: [
          {
            text: 'Ask her how you can spot these in the future.',
            isCorrect: true,
            feedback: '🏆 EXCELLENT! You handled the situation perfectly and sought to explicitly improve your security awareness.',
            defenseTip: 'Curiosity is a security superpower. Always ask questions.',
            nextStep: 5 // End scenario
          },
          {
            text: 'Nod and head to your desk.',
            isCorrect: true,
            feedback: '✅ You did your job well and disaster was averted. The company network remains secure.',
            defenseTip: 'Trusting experts with suspicious items is always the right call.',
            nextStep: 5 // End scenario
          }
        ]
      },
      {
        // Branch 3: Bad Ending
        prompt: 'Later that afternoon, every computer in the office suddenly turns to a red screen demanding Bitcoin. The company network has been completely compromised by ransomware tracing back to your decisions. \n\nMISSION FAILED.',
        visualType: 'decision',
        options: [
          {
            text: 'Acknowledge failure and review the lesson.',
            isCorrect: true,
            feedback: 'Physical security is just as important as digital security. A single careless physical action can bypass millions of dollars of cybersecurity software.',
            defenseTip: 'Always be suspicious of found physical media.',
            nextStep: 5
          }
        ]
      },
      {
        // Branch 4: Neutral Ending
        prompt: 'Your laptop had to be completely wiped and reinstalled, and you lost your morning\'s work. However, because you acted quickly to isolate the machine, the network was saved. IT gives you a mild scolding but thanks you for reporting it fast.\n\nMISSION COMPLETED (Barely).',
        visualType: 'decision',
        options: [
          {
            text: 'Acknowledge the outcome.',
            isCorrect: true,
            feedback: 'You made an initial mistake but executed a proper incident response. Speed in reporting incidents drastically reduces their impact.',
            defenseTip: 'Never plug in unknown USBs, but if you do, isolate the machine fast.',
            nextStep: 5
          }
        ]
      },
      {
        // Step 5: Dummy step to end scenario cleanly
        prompt: 'Scenario Complete.',
        visualType: 'decision',
        options: [
          {
            text: 'Finish',
            isCorrect: true,
            feedback: 'Good job navigating this branching scenario.',
            defenseTip: 'Physical security is cyber security.'
          }
        ]
      }
    ]
  },
  {
    id: 'branching-2',
    title: 'The Late Night Deployment',
    category: 'Incident Response',
    difficulty: 3,
    timeLimit: 60,
    description: 'A branching incident response simulation. It\'s 11 PM on a Friday and the production server alerts are firing. Choose your path wisely.',
    icon: 'Activity',
    steps: [
      {
        prompt: 'You are the on-call engineer. It\'s 11:00 PM on a Friday. PagerDuty goes off: "CRITICAL: High CPU and unexpected outbound traffic on DB-SERVER-01".\n\nWhat is your very first action?',
        visualType: 'decision',
        options: [
          {
            text: 'SSH directly into the database server to see what process is consuming CPU.',
            isCorrect: false,
            feedback: '⚠️ While tempting, logging directly into a potentially compromised machine as an admin can tip off attackers or expose your own credentials.',
            defenseTip: 'Follow the incident response playbook: Verify, Isolate, then Investigate from a secure jump box.',
            nextStep: 1
          },
          {
            text: 'Check the central logging dashboard (Splunk/ELK) to investigate the traffic origin without touching the server.',
            isCorrect: true,
            feedback: '✅ Correct! Investigating via centralized logs is safer and preserves forensic evidence on the actual machine.',
            defenseTip: 'Centralized logging is crucial for safe incident investigation.',
            nextStep: 2
          },
          {
            text: 'Ignore it. It\'s probably just the weekly backup job running early.',
            isCorrect: false,
            feedback: '❌ NEVER assume an unexpected alert is benign during off-hours, especially one indicating unusual outbound traffic (a sign of data exfiltration).',
            defenseTip: 'Alert fatigue is real, but "unexpected outbound traffic" is a massive red flag. Always verify.',
            nextStep: 3
          }
        ]
      },
      {
        // Branch 1: SSH direct (Bad practice)
        prompt: 'You SSH in. You run `top` and see a process called `postgres_updater` using 99% CPU. However, your SSH connection suddenly drops, and you cannot log back in. The attacker noticed you and locked you out!\n\nWhat now?',
        visualType: 'decision',
        options: [
          {
            text: 'Use the cloud console to forcibly power off the server.',
            isCorrect: false,
            feedback: '❌ Powering off destroys volatile memory (RAM) which contains crucial forensic evidence of how the attacker got in and what they stole.',
            defenseTip: 'Preserve evidence when possible. Do not reboot or power off compromised machines if you intend to investigate.',
            nextStep: 4
          },
          {
            text: 'Use the cloud console to isolate the server\'s Security Group/Firewall (block all network access).',
            isCorrect: true,
            feedback: '✅ Good recovery! Isolating the network stops data exfiltration while keeping the machine running so forensic teams can capture the RAM state later.',
            defenseTip: 'Containment means network isolation, not powering down.',
            nextStep: 5
          }
        ]
      },
      {
        // Branch 2: Log analysis (Good practice)
        prompt: 'Looking at the logs, you see massive amounts of DNS requests leaving the DB server heading to an unrecognized IP address in Russia. This is a classic DNS Tunneling data exfiltration attack.\n\nHow do you stop it?',
        visualType: 'decision',
        options: [
          {
            text: 'Change the database password immediately.',
            isCorrect: false,
            feedback: '❌ The attacker already has a shell on the server executing the DNS tunnel. Changing the DB password won\'t stop the active exfiltration script.',
            defenseTip: 'Understand the layer of the attack. An OS-level compromise requires OS or Network-level containment.',
            nextStep: 4
          },
          {
            text: 'Block the destination IP at the edge firewall.',
            isCorrect: false,
            feedback: '⚠️ Better, but attackers often have multiple Command & Control IPs. They will just switch to a fallback IP and resume exfiltration.',
            defenseTip: 'Targeted IP blocks are a temporary band-aid, not true containment.',
            nextStep: 4
          },
          {
            text: 'Quarantine the server by moving it to an isolated VPC/VLAN with zero internet access.',
            isCorrect: true,
            feedback: '🏆 BOOM! Perfect incident response. You fully contained the threat by physically isolating the network environment, stopping all exfiltration dead in its tracks.',
            defenseTip: 'Full network quarantine is the gold standard for containing an active breach.',
            nextStep: 5
          }
        ]
      },
      {
        // Branch 3: Ignored it (Disaster)
        prompt: 'You go back to sleep. Monday morning, the CEO calls. 50 million customer records have been dumped on the dark web. The company stock crashes 20%. The forensic report shows the exfiltration happened Friday night over 4 hours.\n\nMISSION FAILED.',
        visualType: 'decision',
        options: [
          {
            text: 'Accept the consequences.',
            isCorrect: true,
            feedback: 'Ignoring security alerts is how minor incidents become company-ending disasters.',
            defenseTip: 'Always follow the escalation playbook.',
            nextStep: 6
          }
        ]
      },
      {
        // Branch 4: Partial success
        prompt: 'You managed to stop the bleeding, but roughly 50,000 customer records were exfiltrated before you fully contained the server. The incident requires public disclosure, but the company will survive.\n\nMISSION COMPLETED (With Casualties).',
        visualType: 'decision',
        options: [
          {
            text: 'Review the incident.',
            isCorrect: true,
            feedback: 'Incident response is hard. Your hesitation or incorrect tactical choices cost valuable time, allowing a partial data breach.',
            defenseTip: 'Drill your incident response plans so containment actions become muscle memory.',
            nextStep: 6
          }
        ]
      },
      {
        // Branch 5: Total success
        prompt: 'You stopped the attack before any sensitive data left the building. The threat actor is locked out, the original vulnerability is identified via logs, and the database is securely restored to a clean state by 3 AM. You are an Incident Response hero.\n\nMISSION COMPLETED (Flawless Victory).',
        visualType: 'decision',
        options: [
          {
            text: 'Celebrate.',
            isCorrect: true,
            feedback: 'Your calm, methodical approach to Verification and Containment saved the company millions.',
            defenseTip: 'Stick to the Incident Response framework: Prepare, Identify, Contain, Eradicate, Recover, Lessons Learned.',
            nextStep: 6
          }
        ]
      },
      {
        // Step 6: End
        prompt: 'Incident simulation complete.',
        visualType: 'decision',
        options: [
          {
            text: 'Finish',
            isCorrect: true,
            feedback: 'Good work navigating the pressure of a live incident.',
            defenseTip: 'Stay calm and contain.'
          }
        ]
      }
    ]
  }
];

export default scenarios;
