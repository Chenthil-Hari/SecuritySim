/*
  Character personas mapped to scenarios
  Each character has:
  - name, role, age descriptor
  - appearance (skin, hair, clothing colors for SVG avatar)
  - device they're using
  - dialogues for different reaction states
*/

const characters = {
    'default': {
        name: 'Cyber Guard',
        role: 'Security Assistant',
        ageGroup: 'adult',
        device: 'desktop',
        skinColor: '#4a90e2',
        hairColor: '#1a1a2e',
        shirtColor: '#2c3e50',
        accessory: 'badge',
        dialogues: {
            idle: "I'm here to help you navigate this security scenario.",
            thinking: "Let's analyze the situation carefully...",
            confused: "This doesn't look right. We should double-check.",
            panic: "Alert! This could be a serious security threat!",
            relief: "Great job staying safe!",
            confident: "You've got this security thing down!"
        }
    },
    'phishing-1': {
        name: 'Priya',
        role: 'College Student',
        ageGroup: 'young',
        device: 'laptop',
        skinColor: '#c68642',
        hairColor: '#1a1a2e',
        shirtColor: '#6c5ce7',
        accessory: 'glasses',
        dialogues: {
            idle: "Hmm, I just got this email from my bank... looks serious.",
            thinking: "Wait, something about this feels off...",
            confused: "The sender address looks weird... is this legit?",
            panic: "Oh no! My account might be compromised!",
            relief: "Phew! Glad I didn't fall for that.",
            confident: "I know exactly what to do with phishing emails!"
        }
    },
    'phishing-2': {
        name: 'Marcus',
        role: 'Finance Employee',
        ageGroup: 'adult',
        device: 'desktop',
        skinColor: '#8d5524',
        hairColor: '#2d2d2d',
        shirtColor: '#2d3436',
        accessory: 'tie',
        dialogues: {
            idle: "An email from the CEO... this seems urgent.",
            thinking: "A wire transfer request? Let me think about this...",
            confused: "Why would the CEO email from a different domain?",
            panic: "I almost processed a $45,000 fraudulent transfer!",
            relief: "Good thing I followed verification protocol.",
            confident: "Always verify unusual financial requests separately."
        }
    },
    'scam-call-1': {
        name: 'Linda',
        role: 'Parent',
        ageGroup: 'senior',
        device: 'phone',
        skinColor: '#f1c27d',
        hairColor: '#a0a0a0',
        shirtColor: '#00b894',
        accessory: 'none',
        dialogues: {
            idle: "My phone's ringing... unknown number.",
            thinking: "This voice sounds so much like my daughter...",
            confused: "But why would she call from a stranger's phone?",
            panic: "My child is hurt! I need to send money NOW!",
            relief: "Thank goodness, my daughter is perfectly safe!",
            confident: "I won't let scammers exploit my emotions again."
        }
    },
    'scam-call-2': {
        name: 'Robert',
        role: 'Retiree',
        ageGroup: 'senior',
        device: 'desktop',
        skinColor: '#fdbcb4',
        hairColor: '#c0c0c0',
        shirtColor: '#636e72',
        accessory: 'none',
        dialogues: {
            idle: "Someone from Microsoft is calling me?",
            thinking: "They say my computer has been compromised...",
            confused: "Does Microsoft really call people like this?",
            panic: "Hackers are in my computer?! I need to act fast!",
            relief: "It was just a scam. My computer is fine!",
            confident: "Microsoft would NEVER cold-call about computer issues."
        }
    },
    'malware-1': {
        name: 'Alex',
        role: 'Freelancer',
        ageGroup: 'young',
        device: 'laptop',
        skinColor: '#f1c27d',
        hairColor: '#d35400',
        shirtColor: '#0984e3',
        accessory: 'headphones',
        dialogues: {
            idle: "Just browsing the web, minding my business...",
            thinking: "This popup is screaming that I have 47 viruses!",
            confused: "Wait, can a website really scan my computer?",
            panic: "47 viruses?! My data! My passwords!",
            relief: "It was just scareware. My antivirus is clean!",
            confident: "Real antivirus doesn't use scary browser popups."
        }
    },
    'malware-2': {
        name: 'Sarah',
        role: 'Office Worker',
        ageGroup: 'adult',
        device: 'desktop',
        skinColor: '#c68642',
        hairColor: '#2d2d2d',
        shirtColor: '#e17055',
        accessory: 'badge',
        dialogues: {
            idle: "Huh, a USB drive in the parking lot... 'Salary Data'?",
            thinking: "Should I plug this in? I'm really curious...",
            confused: "Is this a trap? Who would leave salary data lying around?",
            panic: "What if it has malware? That could infect the whole network!",
            relief: "Smart call turning it in to IT security.",
            confident: "Never plug in unknown USB drives. Ever."
        }
    },
    'social-eng-1': {
        name: 'James',
        role: 'IT Professional',
        ageGroup: 'adult',
        device: 'phone',
        skinColor: '#fdbcb4',
        hairColor: '#4a4a4a',
        shirtColor: '#00cec9',
        accessory: 'badge',
        dialogues: {
            idle: "Heading into the office through the secure entrance...",
            thinking: "This delivery person wants me to hold the door...",
            confused: "They look legitimate, but should I really let them in?",
            panic: "What if I just let an intruder into the building?",
            relief: "Reception will verify them properly. Good call!",
            confident: "Badge access exists for a reason. No exceptions."
        }
    },
    'social-eng-2': {
        name: 'Maya',
        role: 'Job Seeker',
        ageGroup: 'young',
        device: 'laptop',
        skinColor: '#c68642',
        hairColor: '#1a1a2e',
        shirtColor: '#a29bfe',
        accessory: 'none',
        dialogues: {
            idle: "A Google recruiter messaged me on LinkedIn!",
            thinking: "$200K salary? And they want my SSN right away?",
            confused: "Why would a recruiter need my driver's license upfront?",
            panic: "What if I missed out on the opportunity of a lifetime?",
            relief: "That was definitely a scam. My identity is safe!",
            confident: "Real recruiters never ask for SSN in a first message."
        }
    },
    'phishing-3': {
        name: 'David',
        role: 'Small Business Owner',
        ageGroup: 'adult',
        device: 'phone',
        skinColor: '#f1c27d',
        hairColor: '#5a3825',
        shirtColor: '#fdcb6e',
        accessory: 'none',
        dialogues: {
            idle: "I won £500,000?! That's... a lot of money!",
            thinking: "Wait, did I even enter any lottery?",
            confused: "They want $50 processing fee via Western Union?",
            panic: "What if this is real and I miss out?!",
            relief: "Can't win what you never entered. Classic scam!",
            confident: "If it sounds too good to be true, it always is."
        }
    },
    'social-eng-3': {
        name: 'Nina',
        role: 'Remote Worker',
        ageGroup: 'young',
        device: 'laptop',
        skinColor: '#fdbcb4',
        hairColor: '#e17055',
        shirtColor: '#55a3e8',
        accessory: 'earbuds',
        dialogues: {
            idle: "Working from the coffee shop today. Need Wi-Fi...",
            thinking: "Three networks available... which one is real?",
            confused: "StarCoffee_FREE has no password. Is that safe?",
            panic: "Did someone just intercept my bank credentials?!",
            relief: "Good thing I asked the barista for the real network.",
            confident: "Always verify Wi-Fi names and use a VPN on public networks."
        }
    },
    'browser-phish-1': {
        name: 'Ethan',
        role: 'College Graduate',
        ageGroup: 'young',
        device: 'laptop',
        skinColor: '#f1c27d',
        hairColor: '#2d2d2d',
        shirtColor: '#00b894',
        accessory: 'glasses',
        dialogues: {
            idle: "Got an email about unusual activity on my account...",
            thinking: "This login page looks right, but let me check the URL...",
            confused: "Wait, is that a zero or the letter 'O' in the URL?",
            panic: "I almost typed my password into a fake site!",
            relief: "Caught the typosquatting! That was close.",
            confident: "Always check the URL bar before entering credentials."
        }
    },
    'usb-explorer-1': {
        name: 'Diane',
        role: 'IT Intern',
        ageGroup: 'young',
        device: 'desktop',
        skinColor: '#c68642',
        hairColor: '#1a1a2e',
        shirtColor: '#6c5ce7',
        accessory: 'badge',
        dialogues: {
            idle: "My colleague just plugged in a USB they found outside...",
            thinking: "Let me look at these files carefully...",
            confused: "Wait, why does this PDF have a .exe extension?",
            panic: "There's an autorun.inf file! This USB is weaponized!",
            relief: "Good thing we caught those disguised executables.",
            confident: "Double extensions are a classic malware trick."
        }
    },
    'wifi-attack-1': {
        name: 'Carlos',
        role: 'Business Traveler',
        ageGroup: 'adult',
        device: 'laptop',
        skinColor: '#8d5524',
        hairColor: '#2d2d2d',
        shirtColor: '#2d3436',
        accessory: 'tie',
        dialogues: {
            idle: "At the airport, need to connect to Wi-Fi for work...",
            thinking: "Multiple networks with similar names... suspicious.",
            confused: "SkyHaven_Free_WiFi or SkyHaven-Airport? Which is real?",
            panic: "What if I connected to a hacker's fake hotspot?!",
            relief: "Asked the info desk — the secured one is official.",
            confident: "Always verify Wi-Fi with staff and use WPA2 networks."
        }
    },
    'social-eng-4': {
        name: 'Zoe',
        role: 'Marketing Manager',
        ageGroup: 'adult',
        device: 'phone',
        skinColor: '#fdbcb4',
        hairColor: '#d35400',
        shirtColor: '#e17055',
        accessory: 'earbuds',
        dialogues: {
            idle: "Scrolling through LinkedIn during my lunch break...",
            thinking: "$10K/week with no experience? That seems too good...",
            confused: "Should I scan this QR code? It's from a stranger...",
            panic: "That job post was a money laundering scheme?!",
            relief: "Reported both scam posts. Staying safe online!",
            confident: "If it's too good to be true, it's always a scam."
        }
    }
};

export default characters;
