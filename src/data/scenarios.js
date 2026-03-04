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
    id: 'master-1',
    title: 'The Ransomware Response',
    category: 'Malware',
    difficulty: 3,
    timeLimit: 60,
    description: 'A high-stakes desktop simulation. Your system has been targeted by advanced ransomware. Use your technical skills to survive.',
    icon: 'ShieldAlert',
    steps: [
      {
        id: 'rd-1',
        title: "The Breach Begins",
        visualType: 'desktop',
        visualData: {
          activeWindows: ['alert'],
          alert: {
            title: "Security Warning",
            message: "Unauthorized access attempt detected from unknown IP 192.168.1.105",
            isFlashing: true
          },
          icons: [
            { id: 'pc', label: 'My Computer', icon: 'Monitor' },
            { id: 'files', label: 'Sensitive Data', icon: 'HardDrive' },
            { id: 'trash', label: 'Recycle Bin', icon: 'Trash2' }
          ]
        },
        options: [
          {
            text: "Close the alert and continue working",
            isCorrect: false,
            feedback: "Ignoring an IOC (Indicator of Compromise) is a fatal mistake.",
            defenseTip: "Always investigate security alerts immediately.",
          },
          {
            text: "Click the 'X' to dismiss and run an AV scan",
            isCorrect: true,
            trigger: 'close-alert',
            feedback: "Good reflex! Dismissing the distraction to take defensive action.",
            defenseTip: "Running scans after alerts is a standard SOP.",
          }
        ]
      },
      {
        id: 'rd-fail-1',
        title: "System Compromised",
        visualType: 'desktop',
        visualData: {
          activeWindows: ['ransom'],
          icons: [
            { id: 'pc', label: 'My Computer', icon: 'Monitor' },
            { id: 'trash', label: 'Recycle Bin', icon: 'Trash2' }
          ]
        },
        prompt: "Your files have been encrypted. The attacker is demanding payment.",
        options: [
          {
            text: "Contact IT Security immediately",
            isCorrect: true,
            feedback: "Even after failure, reporting is the right step to prevent lateral movement.",
            defenseTip: "Incident response starts with transparency.",
          },
          {
            text: "Pay the Ransom (0.5 BTC)",
            isCorrect: false,
            feedback: "Paying ransoms only funds further criminal activity and doesn't guarantee data recovery.",
            defenseTip: "Never pay the ransom. Use backups instead.",
          }
        ]
      },
      {
        id: 'rd-invest-1',
        title: "Containment Phase",
        visualType: 'desktop',
        visualData: {
          activeWindows: ['explorer'],
          explorer: {
            path: 'C:\\Sensitive Data',
            files: [
              { name: 'passwords.txt', isSuspicious: false },
              { name: 'payload.exe', isSuspicious: true },
              { name: 'network_config.bak', isSuspicious: false }
            ]
          },
          icons: [
            { id: 'pc', label: 'My Computer', icon: 'Monitor' },
            { id: 'trash', label: 'Recycle Bin', icon: 'Trash2' }
          ]
        },
        options: [
          {
            text: "Hover over the suspicious files before deciding",
            isCorrect: false,
            feedback: "Good for gathering info, but don't wait too long.",
            defenseTip: "Investigation is good, but containment is priority.",
          }
        ]
      },
      {
        id: 'rd-final',
        title: "Incident Resolution",
        visualType: 'chat',
        visualData: {
          messages: [
            { sender: 'IT Admin', text: 'I see you reported the IP. We are blocking it at the firewall now.' },
            { sender: 'IT Admin', text: 'Did you manage to find any suspicious files?' }
          ]
        },
        options: [
          {
            text: "Yes, I isolated payload.exe. System is clean.",
            isCorrect: true,
            feedback: "Perfect incident response. You detected, contained, and reported.",
            defenseTip: "Clean handoffs to IT teams ensure the whole network stays safe."
          },
          {
            text: "No, I think I was hacked.",
            isCorrect: false,
            feedback: "Failure to provide details makes IT's job much harder.",
            defenseTip: "Always document and share findings after an incident."
          }
        ]
      }
    ]
  },
  {
    id: 'browser-phish-1',
    title: 'Suspicious Login Page',
    category: 'Phishing',
    difficulty: 2,
    timeLimit: 50,
    description: 'You click a link from an email and land on what looks like your bank\'s login page. But is it really?',
    icon: 'Globe',
    steps: [
      {
        prompt: 'You received an email saying your bank account has unusual activity. You clicked the link and landed on this page. Take a close look at the browser before entering your credentials.',
        visualType: 'browser',
        visualData: {
          url: 'http://www.g00gle-security.com/accounts/signin',
          isSecure: false,
          tabTitle: 'Sign In - Google Accounts',
          pageTitle: 'Sign in to your Google Account',
          pageSubtitle: 'Enter your credentials to verify your identity',
          pageContent: 'We detected unusual activity on your account. Please sign in to verify your identity and secure your account immediately.',
          formFields: ['Email or phone', 'Password'],
          submitButton: 'Sign In & Verify',
          links: [
            { text: 'Forgot password?', displayUrl: 'g00gle-security.com/reset', realUrl: 'http://malicious-server.ru/harvest' },
            { text: 'Create account', displayUrl: 'g00gle-security.com/signup', realUrl: 'http://malicious-server.ru/register' },
            { text: 'Privacy Policy', displayUrl: 'g00gle-security.com/privacy', realUrl: 'http://malicious-server.ru/fake-policy' }
          ],
          redFlags: ['HTTP instead of HTTPS', 'g00gle uses zeros instead of "o"', 'Domain is not google.com']
        },
        options: [
          {
            text: 'Enter my credentials — the page looks legitimate',
            isCorrect: false,
            feedback: '❌ Look at the URL carefully! It says "g00gle-security.com" — those are zeros, not the letter "o". Also, there\'s no HTTPS (🔒). This is a phishing page designed to steal your credentials.',
            defenseTip: 'Always check the URL before entering credentials. Look for: 1) HTTPS with a lock icon, 2) Correct spelling of the domain, 3) The actual domain (not a subdomain trick).'
          },
          {
            text: 'Close the tab — the URL looks suspicious (g00gle instead of google)',
            isCorrect: true,
            feedback: '✅ Excellent eye! You spotted the typosquatting: "g00gle" uses zeros instead of the letter "o". The site also uses HTTP (not HTTPS), and the domain "g00gle-security.com" is not the real Google domain.',
            defenseTip: 'Typosquatting replaces characters with look-alikes (0/O, l/1, rn/m). Always type the URL directly or use bookmarks for sensitive sites.'
          },
          {
            text: 'Hover over the links to check where they actually lead',
            isCorrect: false,
            feedback: '⚠️ Good instinct to investigate! The links redirect to "malicious-server.ru" — clearly not Google. But the URL bar itself already shows this is fake. Don\'t interact further — just close the tab.',
            defenseTip: 'Hovering over links is a good habit, but if the URL bar is already suspicious, don\'t interact with the page at all. Close it immediately.'
          }
        ]
      },
      {
        prompt: 'You closed the suspicious tab. Now you want to check if your Google account actually has any security issues. What\'s the safest way?',
        visualType: 'browser',
        visualData: {
          url: 'https://myaccount.google.com/security',
          isSecure: true,
          tabTitle: 'Security - Google Account',
          pageTitle: 'Security Checkup',
          pageSubtitle: 'Protect your Google Account',
          pageContent: 'Review your security settings, recent activity, and connected devices to keep your account safe.',
          formFields: [],
          submitButton: '',
          links: [
            { text: 'Recent security events', displayUrl: 'myaccount.google.com/notifications', realUrl: 'https://myaccount.google.com/notifications' },
            { text: 'Your devices', displayUrl: 'myaccount.google.com/device-activity', realUrl: 'https://myaccount.google.com/device-activity' }
          ],
          redFlags: []
        },
        options: [
          {
            text: 'Type "google.com" directly in my browser and navigate to account security',
            isCorrect: true,
            feedback: '✅ Perfect! Manually typing the official URL is the safest way to access any website. This ensures you\'re on the real site, not a phishing clone.',
            defenseTip: 'Always navigate to sensitive sites by typing the URL directly, using bookmarks, or through official apps — never through email links.'
          },
          {
            text: 'Search Google for "Google account security" and click the first result',
            isCorrect: false,
            feedback: '⚠️ Search results can be manipulated with paid ads that mimic legitimate sites. While Google tries to filter these, it\'s safer to type the URL directly.',
            defenseTip: 'Attackers buy ads that appear above real search results. The URL in an ad can look legitimate but redirect to a phishing page.'
          },
          {
            text: 'Go back to the email and look for another link',
            isCorrect: false,
            feedback: '❌ The email itself is malicious! Going back to it risks clicking another phishing link. Delete the email and navigate to Google directly.',
            defenseTip: 'If an email contains a suspicious link, treat the entire email as compromised. Delete it and access the service independently.'
          }
        ]
      }
    ]
  },
  {
    id: 'usb-explorer-1',
    title: 'USB Drive Contents',
    category: 'Physical Security',
    difficulty: 2,
    timeLimit: 45,
    description: 'Your colleague found a USB drive and plugged it in. You\'re now looking at its contents in File Explorer. Can you spot the danger?',
    icon: 'HardDrive',
    steps: [
      {
        prompt: 'Against your advice, a colleague already plugged in a found USB drive into a spare computer. You\'re now looking at the file explorer. Examine the files carefully — some may not be what they seem.',
        visualType: 'file-explorer',
        visualData: {
          driveName: 'USB_DRIVE (E:)',
          drivePath: 'E:\\',
          driveSize: '14.8 GB',
          driveUsed: '2.3 GB',
          files: [
            { name: 'Q4_Salary_Report.pdf', size: '245 KB', date: 'Dec 15, 2025', type: 'pdf', isSafe: true },
            { name: 'Employee_Bonuses_2025.pdf.exe', size: '1.2 MB', date: 'Dec 18, 2025', type: 'exe-disguised', isSafe: false, realType: 'Windows Executable (.exe)', tooltip: 'Double extension! This is actually an executable file disguised as a PDF' },
            { name: 'Company_Directory.xlsx', size: '89 KB', date: 'Nov 30, 2025', type: 'xlsx', isSafe: true },
            { name: 'README.txt', size: '2 KB', date: 'Dec 20, 2025', type: 'txt', isSafe: true },
            { name: 'Photos', size: '', date: 'Dec 10, 2025', type: 'folder', isSafe: true },
            { name: 'Setup_Update_v3.2.bat', size: '48 KB', date: 'Dec 19, 2025', type: 'bat', isSafe: false, realType: 'Batch Script (.bat)', tooltip: 'Batch files can execute system commands! This could install malware.' },
            { name: 'Benefits_Overview.docx', size: '156 KB', date: 'Dec 1, 2025', type: 'docx', isSafe: true },
            { name: 'autorun.inf', size: '1 KB', date: 'Dec 18, 2025', type: 'sys', isSafe: false, realType: 'AutoRun Configuration', tooltip: 'autorun.inf can automatically execute programs when a drive is inserted!' }
          ]
        },
        options: [
          {
            text: 'Open "Employee_Bonuses_2025.pdf" — I want to see the salary data',
            isCorrect: false,
            feedback: '❌ Look again! That file is actually "Employee_Bonuses_2025.pdf.exe" — it has a DOUBLE EXTENSION. The real extension is .exe (an executable), not .pdf. Opening it would run malicious code!',
            defenseTip: 'Double extensions (.pdf.exe, .doc.scr) are a classic disguise technique. Windows hides known extensions by default, making "file.pdf.exe" appear as "file.pdf".'
          },
          {
            text: 'The .exe and .bat files are suspicious — report this to IT immediately',
            isCorrect: true,
            feedback: '✅ Sharp eye! You spotted the threats: "Employee_Bonuses_2025.pdf.exe" uses a double extension to disguise an executable, "Setup_Update_v3.2.bat" is a batch script that can run system commands, and "autorun.inf" can auto-execute malware.',
            defenseTip: 'Red flags in file explorers: 1) Double extensions (.pdf.exe), 2) Batch/script files (.bat, .cmd, .ps1), 3) autorun.inf files, 4) Executable files with enticing names.'
          },
          {
            text: 'Delete the suspicious files and keep the rest',
            isCorrect: false,
            feedback: '⚠️ While identifying the suspicious files is good, deleting them removes forensic evidence. IT Security needs to analyze these files to understand if this was a targeted attack and what the malware does.',
            defenseTip: 'Don\'t delete suspicious files — IT forensics teams need them for analysis. Disconnect the machine from the network and report it immediately.'
          },
          {
            text: 'Run the "Setup_Update_v3.2.bat" to install the update',
            isCorrect: false,
            feedback: '❌ NEVER run .bat files from untrusted sources! Batch files can execute any system command — they could install backdoors, delete files, or download additional malware from the internet.',
            defenseTip: '.bat files are scripts that run system commands with full user privileges. An attacker can use them to silently install malware, create admin accounts, or exfiltrate data.'
          }
        ]
      },
      {
        prompt: 'You reported the suspicious files. IT confirmed the USB contained malware. The computer that was used to open the USB — what should happen to it now?',
        visualType: 'decision',
        options: [
          {
            text: 'Run a quick antivirus scan and continue using it',
            isCorrect: false,
            feedback: '⚠️ A quick scan may miss sophisticated malware that hides in boot sectors or firmware. Since the USB was already plugged in, a more thorough approach is needed.',
            defenseTip: 'Advanced malware (rootkits, firmware-level threats) can survive standard antivirus scans. A compromised machine needs professional remediation.'
          },
          {
            text: 'Disconnect from network, preserve for forensics, then completely reimage the machine',
            isCorrect: true,
            feedback: '✅ Perfect incident response! Disconnecting prevents spread, preserving for forensics helps identify the attackers, and reimaging ensures no hidden malware persists.',
            defenseTip: 'Full remediation steps: 1) Isolate from network, 2) Preserve forensic image, 3) Analyze malware, 4) Complete OS reimage, 5) Change all credentials used on that machine.'
          },
          {
            text: 'Just restart the computer — that usually fixes issues',
            isCorrect: false,
            feedback: '❌ Restarting does NOT remove malware! Modern malware survives reboots by embedding in startup processes, scheduled tasks, and even firmware.',
            defenseTip: 'Malware persistence mechanisms include: registry run keys, scheduled tasks, WMI subscriptions, bootkit infections, and driver-level rootkits.'
          }
        ]
      }
    ]
  },
  {
    id: 'wifi-attack-1',
    title: 'Airport Wi-Fi Trap',
    category: 'Social Engineering',
    difficulty: 2,
    timeLimit: 40,
    description: 'You\'re at the airport and need to connect to Wi-Fi. Multiple networks are available — but which ones are safe?',
    icon: 'Wifi',
    steps: [
      {
        prompt: 'You\'re waiting for your flight at "SkyHaven International Airport" and need to check your email. You open your Wi-Fi settings and see these available networks. Which one do you connect to?',
        visualType: 'wifi',
        visualData: {
          location: 'SkyHaven International Airport',
          networks: [
            { name: 'SkyHaven_Free_WiFi', signal: 4, secured: false, connected: false, isEvil: true, hint: 'No security · Unusually strong signal' },
            { name: 'SkyHaven-Airport', signal: 3, secured: true, connected: false, isEvil: false, hint: 'WPA2 · Official airport network (ask info desk for password)' },
            { name: 'FREE_AIRPORT_WIFI', signal: 5, secured: false, connected: false, isEvil: true, hint: 'No security · Generic suspicious name' },
            { name: 'iPhone-Hotspot', signal: 1, secured: true, connected: false, isEvil: false, hint: 'WPA2 · Personal hotspot' },
            { name: 'SkyHaven_VIP_Lounge', signal: 3, secured: false, connected: false, isEvil: true, hint: 'No security · Claims to be VIP network' },
            { name: 'DIRECT-HP-Printer', signal: 1, secured: true, connected: false, isEvil: false, hint: 'WPA2 · Printer network' }
          ]
        },
        options: [
          {
            text: 'Connect to "SkyHaven_Free_WiFi" — it has the airport name and strong signal',
            isCorrect: false,
            feedback: '❌ This is likely an Evil Twin! It uses the airport name to seem official, but it\'s unsecured (no 🔒). Anyone can create a hotspot with any name. Its unusually strong signal suggests a nearby attacker with a boosted antenna.',
            defenseTip: 'Evil Twin attacks use familiar-sounding names. Red flags: 1) No security/password required, 2) Unusually strong signal, 3) Slightly different name from official network.'
          },
          {
            text: 'Ask the information desk for the official network name with password, then connect to "SkyHaven-Airport"',
            isCorrect: true,
            feedback: '✅ Perfect! "SkyHaven-Airport" is WPA2 secured (requires a password), which means traffic is encrypted. Verifying with the info desk confirms it\'s the official network.',
            defenseTip: 'Always verify the official Wi-Fi network name with staff, signs, or official materials. Secured (WPA2/WPA3) networks encrypt your data, making interception much harder.'
          },
          {
            text: 'Connect to "FREE_AIRPORT_WIFI" — free Wi-Fi is expected at airports',
            isCorrect: false,
            feedback: '❌ "FREE_AIRPORT_WIFI" is a classic evil twin name — generic, unsecured, and has a suspiciously strong signal. Attackers set these up to harvest login credentials and personal data.',
            defenseTip: 'Generic names like "Free WiFi", "Free Airport WiFi", or "Guest" are frequently used by attackers. Legitimate airport networks rarely use such generic names.'
          },
          {
            text: 'Use my phone\'s mobile hotspot instead',
            isCorrect: false,
            feedback: '⚠️ Using mobile data is technically the safest option for privacy! However, the question asks about connecting to Wi-Fi. In practice, if you must use public Wi-Fi, always pick the verified, password-protected official network.',
            defenseTip: 'Mobile data is your safest option when security is critical. If you must use public Wi-Fi, combine it with a VPN for encryption.'
          }
        ]
      },
      {
        prompt: 'You connected to the verified "SkyHaven-Airport" network with the password from the info desk. A notification pops up asking you to sign in through a captive portal. The portal page asks for your email. What do you do?',
        visualType: 'browser',
        visualData: {
          url: 'https://wifi.skyhaven-airport.com/connect',
          isSecure: true,
          tabTitle: 'SkyHaven Airport - Wi-Fi Login',
          pageTitle: 'Welcome to SkyHaven Airport Wi-Fi',
          pageSubtitle: 'Enter your email to connect',
          pageContent: 'Enjoy complimentary Wi-Fi during your stay. By connecting you agree to our terms of service.',
          formFields: ['Email address'],
          submitButton: 'Connect',
          links: [
            { text: 'Terms of Service', displayUrl: 'skyhaven-airport.com/terms', realUrl: 'https://skyhaven-airport.com/terms' }
          ],
          redFlags: []
        },
        options: [
          {
            text: 'Enter my primary email address to connect',
            isCorrect: false,
            feedback: '⚠️ Giving your primary email to a captive portal adds you to marketing databases and associates your identity with your browsing. Use a secondary email or privacy alias.',
            defenseTip: 'Captive portals harvest email addresses for marketing and tracking. Use a disposable/secondary email for public Wi-Fi logins.'
          },
          {
            text: 'Use a secondary/disposable email address for the portal login',
            isCorrect: true,
            feedback: '✅ Smart move! Using a secondary email protects your primary inbox from marketing spam and prevents tracking your browsing habits across different Wi-Fi networks.',
            defenseTip: 'Have a dedicated "junk" email for Wi-Fi portals, sign-ups, and untrusted services. This protects your primary email from spam and data correlation.'
          },
          {
            text: 'Refuse to enter any email and try to bypass the portal',
            isCorrect: false,
            feedback: '⚠️ While privacy-conscious, bypassing captive portals may violate the terms of service. Using a secondary email is the practical balance between connectivity and privacy.',
            defenseTip: 'If you\'re uncomfortable with captive portals, mobile data with a VPN is always the most private option.'
          }
        ]
      }
    ]
  },
  {
    id: 'social-eng-4',
    title: 'LinkedIn Scam Feed',
    category: 'Social Engineering',
    difficulty: 2,
    timeLimit: 45,
    description: 'Scrolling through your social media feed, you notice several suspicious posts and messages. Can you identify the threats?',
    icon: 'Users',
    steps: [
      {
        prompt: 'You\'re scrolling through your LinkedIn feed and see these posts. One of them is a social engineering attempt. Which post is suspicious?',
        visualType: 'social-feed',
        visualData: {
          platform: 'LinkedIn',
          posts: [
            {
              author: 'TechVision Recruiting',
              authorTitle: 'We\'re Hiring!',
              authorAvatar: 'TV',
              verified: false,
              timeAgo: '2h',
              content: '🚀 REMOTE JOB ALERT! Earn $5,000-$10,000/week as a "Payment Processing Agent"! No experience needed! Work from home!\n\n✅ No resume required\n✅ Start immediately\n✅ Just need your bank account for transfers\n\nDM us NOW to get started! Limited spots available! 💰',
              likes: 23,
              comments: 8,
              shares: 2,
              isSuspicious: true,
              suspiciousReasons: ['Unrealistic salary', 'No experience/resume required', 'Asks for bank account', 'Urgency tactics']
            },
            {
              author: 'Sarah Mitchell',
              authorTitle: 'Engineering Manager at Microsoft',
              authorAvatar: 'SM',
              verified: true,
              timeAgo: '5h',
              content: 'Excited to share that our team shipped a major performance update this quarter! 🎉 Proud of everyone involved. #Engineering #TeamWork',
              likes: 842,
              comments: 56,
              shares: 12,
              isSuspicious: false,
              suspiciousReasons: []
            },
            {
              author: 'CryptoWealth Academy',
              authorTitle: 'Financial Freedom Coach',
              authorAvatar: 'CW',
              verified: false,
              timeAgo: '1h',
              content: '📱 Scan this QR code to join our exclusive investment webinar! Learn how I turned $500 into $50,000 in just 30 days using AI trading bots!\n\n[QR CODE IMAGE]\n\nOnly 50 spots left! Register NOW before it\'s too late! ⏰',
              likes: 15,
              comments: 3,
              shares: 1,
              isSuspicious: true,
              suspiciousReasons: ['QR code phishing (Quishing)', 'Unrealistic returns', 'Urgency/scarcity tactics', 'Unverified account']
            }
          ]
        },
        options: [
          {
            text: 'The "Payment Processing Agent" job is suspicious — it asks for my bank account',
            isCorrect: false,
            feedback: '⚠️ You correctly identified ONE threat! The "Payment Processing Agent" post is indeed a money mule recruitment scam. But there\'s another suspicious post too — the crypto QR code is a "quishing" attack!',
            defenseTip: '"Payment Processing Agent" is code for money laundering. Legitimate jobs never require your bank account upfront or offer unrealistic salaries with no qualifications.'
          },
          {
            text: 'Both the job post AND the crypto QR code are scams',
            isCorrect: true,
            feedback: '✅ Excellent threat detection! The "Payment Processing Agent" is a money mule scheme (you\'d be laundering money). The crypto QR code is "quishing" — QR code phishing that likely leads to a credential-stealing site or malware download.',
            defenseTip: 'Red flags on social media: 1) Too-good-to-be-true offers, 2) QR codes from strangers, 3) Urgency/scarcity language, 4) Requests for financial info, 5) Unverified accounts making bold claims.'
          },
          {
            text: 'The Microsoft post seems too promotional — it might be impersonation',
            isCorrect: false,
            feedback: '❌ Sarah Mitchell\'s post is a normal corporate celebration post from a verified account with high engagement (842 likes, 56 comments). The real threats are the job scam and QR code posts.',
            defenseTip: 'Verified accounts (✓) with high, organic engagement are generally trustworthy. Focus on posts with: fake urgency, unrealistic promises, low engagement, and unverified accounts.'
          },
          {
            text: 'Scan the QR code to see where it leads — then I can report it if it\'s bad',
            isCorrect: false,
            feedback: '❌ NEVER scan QR codes from untrusted sources! They can redirect to malware downloads, phishing sites, or exploit kits that compromise your device. Report the post without scanning.',
            defenseTip: 'QR codes are dangerous because you can\'t preview the URL before opening it. Treat QR codes from strangers like clicking unknown links — assume the worst.'
          }
        ]
      },
      {
        prompt: 'You receive a direct message on LinkedIn from someone claiming to be a recruiter. They want to schedule an interview but ask you to download a "pre-interview assessment" file.',
        visualType: 'social-feed',
        visualData: {
          platform: 'LinkedIn DM',
          posts: [
            {
              author: 'Rachel Adams',
              authorTitle: 'Talent Acquisition Lead at Amazon',
              authorAvatar: 'RA',
              verified: false,
              timeAgo: 'Just now',
              content: 'Hi! I\'ve been reviewing your profile and I think you\'d be a perfect fit for a Senior Developer role at Amazon.\n\nSalary: $180K-$220K + equity\n\nBefore we schedule the interview, please complete our technical assessment. Download it here:\n\n📎 Amazon_Technical_Assessment_2025.exe\n\nPlease complete it within 24 hours as we have other candidates.\n\nBest,\nRachel Adams\nAmazon Talent Acquisition',
              likes: 0,
              comments: 0,
              shares: 0,
              isSuspicious: true,
              suspiciousReasons: ['Executable file (.exe)', 'Urgency pressure', 'Unverified account', 'Attachment from stranger'],
              attachment: { name: 'Amazon_Technical_Assessment_2025.exe', type: 'exe', size: '3.4 MB' }
            }
          ]
        },
        options: [
          {
            text: 'Download and open the assessment — the salary is very attractive',
            isCorrect: false,
            feedback: '❌ That "assessment" is an executable file (.exe)! It\'s malware disguised as a job assessment. No legitimate company sends .exe files for interviews — they use online platforms like HackerRank or Google Docs.',
            defenseTip: 'Legitimate tech companies use online assessment platforms (HackerRank, CodeSignal, Greenhouse) — NEVER downloadable .exe files. Any recruiter sending an executable is a scammer.'
          },
          {
            text: 'Report the profile and ignore the message — .exe files are malware',
            isCorrect: true,
            feedback: '✅ Perfect response! Major red flags: .exe file attachment, unverified account, pressure tactics ("24 hours"), and the lack of an official Amazon recruitment platform link. Real Amazon recruiters use internal tools and never send executables.',
            defenseTip: 'Red flags in recruiter DMs: 1) Executable attachments (.exe, .bat, .scr), 2) Not using official recruitment platforms, 3) Urgency pressure, 4) Unverified profile, 5) Too-good-to-be-true offers.'
          },
          {
            text: 'Reply asking if they can send the assessment as a PDF instead',
            isCorrect: false,
            feedback: '⚠️ Even engaging with the scammer confirms your account is active and responsive. They may send a PDF with embedded malware or escalate their tactics. Just report and block.',
            defenseTip: 'Don\'t engage with suspected scammers. Replying marks you as a responsive target. If truly interested in a company, apply through their official careers page.'
          }
        ]
      }
    ]
  }
];

export default scenarios;
