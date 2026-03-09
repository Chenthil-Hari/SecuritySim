export const interactiveScenarios = [
  {
    id: "phishing_incident_01",
    title: "The CEO Fraud",
    description: "Respond to a sophisticated spear-phishing attack targeting the finance department.",
    difficulty: "Medium",
    type: "Phishing",
    maxScore: 100,
    nodes: {
      "start": {
        text: "You receive an urgent ticket from the Helpdesk: The VP of Finance just wired $50,000 to an unknown vendor after receiving an email from the 'CEO'. What is your immediate first step?",
        options: [
          { text: "Contact the bank immediately to attempt a wire recall.", nextNodeId: "bank_recall", points: 30 },
          { text: "Analyze the email headers of the 'CEO' email.", nextNodeId: "analyze_headers", points: 10 },
          { text: "Lock the VP of Finance's account and reset their password.", nextNodeId: "lock_account", points: 0 }
        ]
      },
      "bank_recall": {
        text: "You instruct Finance to contact the bank. The bank is processing the recall, but it's a race against time. Meanwhile, what do you do with the IT investigation?",
        options: [
          { text: "Analyze the malicious email and extract indicators of compromise (IoCs).", nextNodeId: "analyze_headers_2", points: 20 },
          { text: "Check email logs to see if anyone else received a similar email.", nextNodeId: "check_logs", points: 15 }
        ]
      },
      "analyze_headers": {
        text: "You pull the headers. The email originated from a look-alike domain (exampIe.com instead of example.com). It bypassed DMARC because the look-alike domain has valid records. The wire transfer completes while you analyze.",
        options: [
          { text: "Block the look-alike domain on the email gateway.", nextNodeId: "block_domain", points: 20 },
          { text: "Contact the bank to recall the wire.", nextNodeId: "bank_recall_late", points: 10 }
        ]
      },
      "analyze_headers_2": {
        text: "You pull the headers. The email originated from a look-alike domain (exampIe.com instead of example.com). It bypassed DMARC because the look-alike domain has valid records.",
        options: [
          { text: "Block the look-alike domain on the email gateway.", nextNodeId: "block_domain", points: 20 },
          { text: "Search the environment for the sender's IP address.", nextNodeId: "search_ip", points: 10 }
        ]
      },
      "lock_account": {
        text: "You lock the VP's account. They call IT demanding to know why they are locked out during a critical financial operation. They mention the CEO approved the transfer.",
        options: [
          { text: "Explain it's a suspected phishing attack and analyze the email.", nextNodeId: "analyze_headers", points: 10 },
          { text: "Unlock the account immediately to avoid blocking business.", nextNodeId: "unlock_account", points: -30 }
        ]
      },
      "bank_recall_late": {
        text: "You contact the bank. Unfortunately, due to the delay, the funds have already been moved out of the receiving account. The money is lost. Incident Response focuses on the post-mortem.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_failure", points: 0 }
        ]
      },
      "check_logs": {
         text: "You find 12 other users received similar emails. You initiate a purge of these emails from the mailboxes.",
         options: [
             { text: "Block the sender domain.", nextNodeId: "block_domain", points: 15 }
         ]
      },
      "block_domain": {
        text: "You successfully block exampIe.com on the email gateway, preventing further emails. The bank notifies you that the $50,000 recall was successful!",
        options: [
          { text: "Finish Incident", nextNodeId: "end_success", points: 30 }
        ]
      },
      "search_ip": {
          text: "You search for the IP. It resolves to a known basic VPN provider. Not much attribution can be made. You decide to block the domain instead.",
          options: [
              { text: "Block the look-alike domain.", nextNodeId: "block_domain", points: 10 }
          ]
      },
      "unlock_account": {
        text: "You unlock the account. The attacker, who also had a credential harvesting link in that email, logs in and begins exfiltrating sensitive financial data. The situation has escalated significantly.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_disaster", points: 0 }
        ]
      },
      "end_success": {
        text: "Incident Resolved Successfully. Swift action containing the financial loss and blocking the threat vector resulted in a great save for the company.",
        options: [],
        score: 100,
        isSuccess: true,
        explanation: "This was a classic Business Email Compromise (BEC) attempt. The attackers spoofed the CEO's email to bypass standard checks, relying on urgency. By immediately blocking the look-alike domain and coordinating with the bank to recall the wire, you contained the financial damage and secured the environment against follow-up attacks."
      },
      "end_failure": {
        text: "Incident Resolved with Financial Loss. While the threat was eventually identified, prioritizing analysis over immediate containment procedures cost the company $50,000.",
        options: [],
        score: 30,
        isSuccess: false,
        explanation: "In suspected wire fraud scenarios, containing the financial loss (contacting the bank) is the absolute highest priority. Analyzing headers is critical for attribution and blocking the threat, but every second counts when trying to claw back external transfers."
      },
      "end_disaster": {
        text: "Incident Escalated to Major Breach. Failing to communicate risks to VIPs and reversing containment actions led to a massive data breach and financial loss.",
        options: [],
        score: 0,
        isSuccess: false,
        explanation: "Unlocking a compromised account without verifying the user's identity or the safety of the endpoint is incredibly dangerous. Attackers often use BEC to not just steal money, but to establish a persistent foothold or steal sensitive data. Always err on the side of caution during active incidents, even if it inconveniences executives."
      }
    }
  },
  {
    id: "ransomware_outbreak_01",
    title: "Midnight Encryption",
    description: "A ransomware infection is spreading rapidly across the server infrastructure. Time is critical.",
    difficulty: "Hard",
    type: "Ransomware",
    maxScore: 200,
    nodes: {
       "start": {
           text: "It's 2 AM on a Saturday. Monitoring alerts are going off: multiple file servers are experiencing massive read/modify/write operations. A user on the night shift calls reporting all their files end in '.locked'.",
           options: [
               { text: "Isolate the affected subnets immediately via the core switch.", nextNodeId: "isolate_network", points: 50 },
               { text: "Log into the affected servers to identify the malware process.", nextNodeId: "log_into_servers", points: -20 },
               { text: "Check the backup server to ensure backups are running.", nextNodeId: "check_backups", points: 0 }
           ]
       },
       "isolate_network": {
           text: "You isolate the server segment. Services go down globally, but the encryption stops spreading to workstations and other safe zones.",
           options: [
               { text: "Identify the 'Patient Zero' workstation that initiated the file share encryption.", nextNodeId: "find_patient_zero", points: 30 },
               { text: "Begin restoring servers from backups immediately.", nextNodeId: "restore_servers_early", points: -30 }
           ]
       },
       "log_into_servers": {
           text: "You RDP into the main file server. The server is incredibly slow. You see a process 'sysx.exe' eating 100% CPU. While you watch, the RDP session drops. The server is fully encrypted and unbootable.",
           options: [
               { text: "Isolate the network.", nextNodeId: "isolate_network_late", points: 20 },
               { text: "Declare a major incident and page the entire security team.", nextNodeId: "page_team", points: 10 }
           ]
       },
       "check_backups": {
           text: "You log into the backup appliance. To your horror, the backup files themselves are currently being encrypted. The ransomware has compromised the backup infrastructure.",
           options: [
               { text: "Pull the power cables on the backup SAN.", nextNodeId: "pull_power", points: -10 },
               { text: "Isolate the backup network segment.", nextNodeId: "isolate_backup_network", points: 40 }
           ]
       },
       "isolate_network_late": {
           text: "You isolate the network, but it's too late for the core servers, which are now fully encrypted. You need to investigate how it got in.",
           options: [
               { text: "Check VPN and Firewall logs for recent odd access.", nextNodeId: "check_vpn_logs", points: 20 }
           ]
       },
       "find_patient_zero": {
            text: "Reviewing network traffic from just before the isolation, you identify a workstation 'HR-DESK-04' making thousands of SMB connections.",
            options: [
                { text: "Isolate HR-DESK-04 and image its drive for forensics.", nextNodeId: "forensics_patient_zero", points: 50 },
                { text: "Wipe HR-DESK-04 immediately.", nextNodeId: "wipe_patient_zero", points: -20 }
            ]
       },
       "restore_servers_early": {
           text: "You begin restoring servers. However, because you haven't identified patient zero, the malware wakes up on the restored servers and begins encrypting them again.",
           options: [
               { text: "Finish Incident", nextNodeId: "end_loop", points: 0 }
           ]
       },
       "page_team": {
           text: "The team is paged. Valuable minutes are lost while people wake up and log in. The ransomware spreads to 80% of the infrastructure.",
           options: [
               { text: "Finish Incident", nextNodeId: "end_massive_breach", points: 0 }
           ]
       },
       "pull_power": {
           text: "You literally pull the power on the SAN. Good news: half the backups are intact. Bad news: the SAN array is corrupted and requires vendor support to rebuild before restoring.",
           options: [
               { text: "Wait for vendor, then restore.", nextNodeId: "end_long_downtime", points: 0 }
           ]
       },
       "isolate_backup_network": {
           text: "You isolate the backup segment cleanly. 70% of backups are safe. You can use these to recover.",
           options: [
               { text: "Find patient zero before restoring.", nextNodeId: "find_patient_zero", points: 30 }
           ]
       },
       "check_vpn_logs": {
           text: "You find a compromised VPN account that didn't have MFA enforced. They used this to pivot.",
           options: [
               { text: "Finish Incident", nextNodeId: "end_post_mortem", points: 0 }
           ]
       },
       "forensics_patient_zero": {
           text: "You identify a malicious payload delivered via a compromised software update. You block the indicator of compromise across the EDR.",
           options: [
               { text: "Begin safe recovery.", nextNodeId: "end_hero", points: 20 }
           ]
       },
       "wipe_patient_zero": {
           text: "You wipe the machine. You've destroyed the evidence of how they got in. You restore the servers, but the attackers are likely still in the network.",
           options: [
               { text: "Finish Incident", nextNodeId: "end_lingering_threat", points: 0 }
           ]
       },
       "end_loop": {
           text: "Incident Failed. Restoring before eradicating the threat put you in an infinite loop of encryption. The incident takes weeks to recover from.",
           options: [],
           score: 20,
           isSuccess: false,
           explanation: "Never begin data restoration operations until the root cause (Patient Zero) has been identified and completely eradicated from the network. Restoring early just feeds clean data into active ransomware."
       },
       "end_massive_breach": {
           text: "Incident Disaster. Failure to take immediate containment action resulted in total enterprise loss. The company may not survive.",
           options: [],
           score: 0,
           isSuccess: false,
           explanation: "When active lateral movement and encryption are detected, immediate containment (isolating networks) must take precedence over investigation or alerting. You can't investigate ashes."
       },
       "end_long_downtime": {
           text: "Incident Resolved (Messy). You saved some backups through drastic physical action, but recovery will take 4x as long due to hardware corruption. Business impact is severe.",
           options: [],
           score: 75,
           isSuccess: false,
           explanation: "While pulling the power saved some data, it corrupted the SAN logical volumes. Physical destruction should be the absolute last resort. Proper network segmentation of backup infrastructure is the correct architectural control."
       },
       "end_post_mortem": {
           text: "Incident Resolved (Loss). The network is encrypted, but you found the root cause. It will be a completely rebuild from scratch.",
           options: [],
           score: 50,
           isSuccess: false,
           explanation: "You successfully identified the entry vector (a VPN account missing MFA), which is vital for post-incident reporting. However, failing to isolate the core servers early enough resulted in total data loss."
       },
       "end_hero": {
           text: "Incident Smashed. Perfect execution. You isolated early, found the root cause, eradicated it, and recovered safely. You are getting a promotion.",
           options: [],
           score: 200,
           isSuccess: true,
           explanation: "Textbook incident response. You contained the threat by isolating the network, performed forensics to identify the delivery mechanism on Patient Zero, eradicated the threat enterprise-wide by blocking the IoC, and safely initiated recovery."
       },
       "end_lingering_threat": {
          text: "Incident Resolved (Unsafe). You restored services quickly but destroyed critical evidence. The attackers will likely be back.",
          options: [],
          score: 100,
          isSuccess: false,
          explanation: "Wiping Patient Zero without collecting forensic evidence (like an image) destroys the only clues you have about how the attacker entered. Without knowing the entry vector, you cannot close the vulnerability, leaving you open to reinfection."
      }
    }
  },
  {
    id: "vishing_01",
    title: "The Urgent Phone Call",
    description: "An employee receives a call from someone claiming to be IT support.",
    difficulty: "Easy",
    type: "Vishing",
    maxScore: 100,
    nodes: {
      "start": {
        text: "An employee reports receiving a phone call from 'Microsoft Support' claiming their PC is infected and asking them to install remote viewer software.",
        options: [
          { text: "Instruct the employee to hang up immediately and report the number.", nextNodeId: "hang_up", points: 40 },
          { text: "Tell the employee to follow the caller's instructions to catch them in the act.", nextNodeId: "follow_along", points: -50 },
          { text: "Ignore the report, Microsoft calls people sometimes.", nextNodeId: "ignore", points: -50 }
        ]
      },
      "hang_up": {
        text: "The employee hangs up. What is your follow-up action?",
        options: [
          { text: "Block the caller ID at the PBX/phone gateway and issue a company-wide alert.", nextNodeId: "end_success", points: 60 },
          { text: "Do nothing else, the threat is over.", nextNodeId: "end_partial", points: 10 }
        ]
      },
      "follow_along": {
        text: "The employee installs the software. The attacker immediately runs a script that exfiltrates locally cached passwords.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_fail", points: 0 }
        ]
      },
      "ignore": {
        text: "The employee assumes it's legitimate and installs the software. The attacker installs ransomware.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_fail_bad", points: 0 }
        ]
      },
      "end_success": {
        text: "Incident Resolved Successfully.",
        options: [],
        score: 100,
        isSuccess: true,
        explanation: "Voice Phishing (Vishing) relies on creating urgency. Legitimate IT or Microsoft will never call asking users to install remote software proactively. Hanging up, blocking the number, and alerting the company prevents others from falling for the same campaign."
      },
      "end_partial": {
        text: "Incident Resolved, but incomplete.",
        options: [],
        score: 50,
        isSuccess: false,
        explanation: "While the immediate threat was stopped, failing to block the number or alert the company leaves other employees vulnerable to the same attacker who is actively dialing numbers."
      },
      "end_fail": {
        text: "Incident Failed. Data is compromised.",
        options: [],
        score: -50,
        isSuccess: false,
        explanation: "Never allow employees to engage with suspected attackers unless part of a sanctioned, sandboxed honeypot operation by trained personnel. Giving them access guarantees compromise."
      },
      "end_fail_bad": {
        text: "Incident Failed completely due to negligence.",
        options: [],
        score: -50,
        isSuccess: false,
        explanation: "Ignoring security reports is a critical failure. User reports of suspicious activity are often the best early-warning system a company has."
      }
    }
  },
  {
    id: "smishing_01",
    title: "The Package Delivery",
    description: "A targeted SMS message threatens a sensitive delivery.",
    difficulty: "Easy",
    type: "Smishing",
    maxScore: 100,
    nodes: {
      "start": {
        text: "The CEO forwards you a text message: 'FedEx: Your package delivery failed. Click here to confirm address: http://fxdex-update.co/login'.",
        options: [
          { text: "Advise the CEO not to click and block the domain on the corporate proxy.", nextNodeId: "block_domain", points: 50 },
          { text: "Click the link from your admin workstation to see what it is.", nextNodeId: "click_admin", points: -50 },
          { text: "Ask the CEO if they are expecting a package.", nextNodeId: "ask_ceo", points: -10 }
        ]
      },
      "block_domain": {
        text: "You block the domain. The threat intelligence feed later confirms it was a credential harvesting site targeting executives.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_success", points: 50 }
        ]
      },
      "click_admin": {
        text: "You click the link. It exploits a zero-day in your browser and drops a persistent shell on your IT admin machine.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_fail1", points: 0 }
        ]
      },
      "ask_ceo": {
        text: "You waste time asking. They say yes. By the time you analyze the link, they clicked it from their personal phone on the corporate WiFi.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_fail2", points: 0 }
        ]
      },
      "end_success": {
        text: "Incident Resolved Successfully.",
        options: [],
        score: 100,
        isSuccess: true,
        explanation: "SMS Phishing (Smishing) leverages personal devices to bypass corporate email filters. The link used a typo-squatted domain. Immediate blocking prevents the user (and others) from accessing the credential harvester."
      },
      "end_fail1": {
        text: "Incident Failed drastically. You compromised the IT network.",
        options: [],
        score: -50,
        isSuccess: false,
        explanation: "Never detonate unknown links or payloads on a production IT workstation. Always use an isolated sandbox environment without access to the internal network."
      },
      "end_fail2": {
        text: "Incident Failed due to delay.",
        options: [],
        score: -10,
        isSuccess: false,
        explanation: "Whether they expect a package or not is irrelevant if the URL is clearly malicious (fxdex-update.co). Verify the technical indicators FIRST, then address the user context if needed."
      }
    }
  },
  {
    id: "insider_01",
    title: "The Disgruntled Admin",
    description: "A recently terminated IT administrator's log traces look highly suspicious.",
    difficulty: "Medium",
    type: "Insider Threat",
    maxScore: 150,
    nodes: {
      "start": {
        text: "HR notifies you that a senior database admin was fired yesterday. You check the SIEM and see their account VPN'd in at 3:00 AM last night.",
        options: [
          { text: "Immediately disable their VPN, Active Directory, and DB accounts.", nextNodeId: "disable_accounts", points: 50 },
          { text: "Call the admin to ask them why they are logging in.", nextNodeId: "call_admin", points: -40 },
          { text: "Monitor their connection to see what they are doing.", nextNodeId: "monitor", points: -20 }
        ]
      },
      "disable_accounts": {
        text: "Accounts disabled. You scan the audit logs for their 3 AM session and notice a massive SELECT query run against the primary customer PII database.",
        options: [
          { text: "Assume they stole the data. Trigger the data breach protocol and notify legal.", nextNodeId: "end_success", points: 100 },
          { text: "Ignore it. They probably just ran a final backup before leaving.", nextNodeId: "end_fail1", points: -50 }
        ]
      },
      "call_admin": {
        text: "The admin doesn't answer. They realize you are onto them and immediately trigger a logic bomb script that drops the production database tables before you can reset their password.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_fail2", points: 0 }
        ]
      },
      "monitor": {
        text: "You watch as they download 50GB of customer data to an unknown IP, then execute a script that encrypts the local database backups. The damage is done.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_fail3", points: 0 }
        ]
      },
      "end_success": {
        text: "Incident Contained - Breach Response Initiated.",
        options: [],
        score: 150,
        isSuccess: true,
        explanation: "Insider threats are exceptionally dangerous because they possess valid credentials and systemic knowledge. Offboarding must include immediate, simultaneous disabling of all access (AD, VPN, SSO, local DB). PII exposure requires legal notification."
      },
      "end_fail1": {
        text: "Incident Failed - Regulatory Nightmare.",
        options: [],
        score: 0,
        isSuccess: false,
        explanation: "Ignoring a massive, unapproved data export by a terminated employee violates almost every data privacy law (GDPR, CCPA). You must investigate the destination IP and assume a breach occurred."
      },
      "end_fail2": {
        text: "Incident Failed - Production Destroyed.",
        options: [],
        score: -40,
        isSuccess: false,
        explanation: "Never confront a suspected malicious insider while they still have active administrative access to your systems. Containment (disabling accounts) is always the first step."
      },
      "end_fail3": {
        text: "Incident Failed - Data Exfiltrated and Backups Lost.",
        options: [],
        score: -20,
        isSuccess: false,
        explanation: "Monitoring an active, unauthorized exfiltration by a terminated employee is negligence. Action must be taken instantly to sever the connection to prevent data loss."
      }
    }
  },
  {
    id: "physical_01",
    title: "The Dropped USB",
    description: "A mysterious USB drive is found in the executive parking lot.",
    difficulty: "Easy",
    type: "Physical Security",
    maxScore: 100,
    nodes: {
      "start": {
        text: "A facilities worker hands you a USB drive labeled 'Confidential Q3 Layoffs' they found in the parking lot.",
        options: [
          { text: "Plug it into your admin workstation to see what it is.", nextNodeId: "plug_admin", points: -50 },
          { text: "Plug it into an isolated, air-gapped forensic machine to analyze it safely.", nextNodeId: "plug_safe", points: 50 },
          { text: "Throw it in the trash.", nextNodeId: "throw_away", points: 10 }
        ]
      },
      "plug_admin": {
        text: "The USB was a Rubber Ducky. It immediately executes a hidden keystroke script, opens Powershell, and downloads a reverse shell payload to your machine, bypassing AV.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_fail1", points: 0 }
        ]
      },
      "plug_safe": {
        text: "The air-gapped machine identifies a hidden partition containing an autorun malware script designed to steal browser cookies and VPN tokens.",
        options: [
          { text: "Send a company-wide reminder about the dangers of unknown USBs.", nextNodeId: "end_success", points: 50 }
        ]
      },
      "throw_away": {
        text: "You throw it away. A janitor finds it later, plugs it into a HR kiosk PC, and infects the network.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_fail2", points: 0 }
        ]
      },
      "end_success": {
        text: "Incident Resolved Successfully.",
        options: [],
        score: 100,
        isSuccess: true,
        explanation: "USB drop attacks prey on human curiosity. 'Baiting' attacks use provocative labels to trick users into bypassing physical security. Always analyze unknown hardware in an isolated, non-networked environment."
      },
      "end_fail1": {
        text: "Incident Failed - Admin Compromised.",
        options: [],
        score: -50,
        isSuccess: false,
        explanation: "Plugging unknown USB devices into production machines is a cardinal sin in information security. 'BadUSB' devices act as keyboards and can type malicious commands instantly before you even open a folder."
      },
      "end_fail2": {
        text: "Incident Failed - Improper Disposal.",
        options: [],
        score: 10,
        isSuccess: false,
        explanation: "Throwing away suspected malicious hardware without physically destroying it leaves the threat active in your environment. Always shatter or securely shred malicious hardware."
      }
    }
  },
  {
    id: "pretexting_01",
    title: "The Vendor Compromise",
    description: "Your primary payroll vendor sends an unusual request.",
    difficulty: "Medium",
    type: "Pretexting",
    maxScore: 100,
    nodes: {
      "start": {
        text: "Accounting receives an email from your known payroll vendor 'PaySafe', from their correct email address, requesting to change their direct deposit bank routing information to a new account.",
        options: [
          { text: "Update the routing number. The email came from their actual address.", nextNodeId: "update_bank", points: -60 },
          { text: "Call the vendor's known phone number on file to verbally verify the change.", nextNodeId: "call_vendor", points: 60 }
        ]
      },
      "update_bank": {
        text: "You update the routing number. The multi-million dollar quarterly payroll run executes the next day, sending all funds directly to a hacker's offshore account.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_fail", points: 0 }
        ]
      },
      "call_vendor": {
        text: "You call your known account manager at PaySafe. They have no record of the request. Their email system was compromised by an attacker.",
        options: [
          { text: "Do not process the change, alert the vendor to their breach, and monitor your own systems.", nextNodeId: "end_success", points: 40 }
        ]
      },
      "end_success": {
        text: "Incident Resolved - Massive Financial Loss Prevented.",
        options: [],
        score: 100,
        isSuccess: true,
        explanation: "This is a classic Vendor Email Compromise (VEC). Attackers compromise a trusted third-party and use their actual email systems to send fraudulent invoices or routing changes. ALWAYS use Out-of-Band verification (calling a known number on file, not the number in the email) for financial changes."
      },
      "end_fail": {
        text: "Incident Disaster - Payroll Stolen.",
        options: [],
        score: -60,
        isSuccess: false,
        explanation: "Trusting an email for a financial routing change, even if the sender address is legitimate, is a failure of process. Email accounts get compromised constantly. Financial updates require secondary verification channels."
      }
    }
  },
  {
    id: "sqli_01",
    title: "The Drop Tables",
    description: "The marketing website is returning bizarre database errors.",
    difficulty: "Medium",
    type: "SQL Injection",
    maxScore: 120,
    nodes: {
      "start": {
        text: "The web team reports the customer portal is showing errors that look like raw database syntax directly on the screen when users search for items.",
        options: [
          { text: "Ignore it, it's just a web dev bug.", nextNodeId: "ignore", points: -30 },
          { text: "Check the WAF (Web Application Firewall) logs for anomalous search queries.", nextNodeId: "check_waf", points: 40 },
          { text: "Take the website offline immediately.", nextNodeId: "offline", points: 0 }
        ]
      },
      "check_waf": {
        text: "You see thousands of requests to the search bar containing payloads like `' OR 1=1; DROP TABLE users;--`",
        options: [
          { text: "Enable strict input sanitization/parameterization on the web code and block the attacking IPs.", nextNodeId: "end_success", points: 80 },
          { text: "Just block the attacking IP and wait.", nextNodeId: "end_partial", points: 20 }
        ]
      },
      "offline": {
        text: "The business is furious that you took the entire revenue-generating site offline for a minor error without investigating first.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_fail_biz", points: -20 }
        ]
      },
      "ignore": {
        text: "Two hours later, the entire customer database, including plaintext passwords, is dumped onto a dark web forum.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_fail_data", points: -50 }
        ]
      },
      "end_success": {
        text: "Incident Resolved - Vulnerability Patched.",
        options: [],
        score: 120,
        isSuccess: true,
        explanation: "SQL Injection (SQLi) occurs when untrusted user input is directly concatenated into database queries. The application was leaking DB errors to the screen, confirming the vulnerability to the attacker. Fixing the code (using parameterized queries) and blocking the attack is the correct holistic response."
      },
      "end_partial": {
        text: "Incident Delayed - Vulnerability Remains.",
        options: [],
        score: 60,
        isSuccess: false,
        explanation: "Blocking an IP is a temporary band-aid. The application code is still fundamentally vulnerable to SQLi. Attackers will just use a different VPN/Proxy IP to continue the attack until the code is patched."
      },
      "end_fail_biz": {
        text: "Incident Failed - Disproportionate Response.",
        options: [],
        score: -20,
        isSuccess: false,
        explanation: "While SQLi is severe, immediately taking a production site offline without analyzing the true scope of the attack (or if you can just block the traffic via WAF) causes unnecessary business interruption."
      },
      "end_fail_data": {
        text: "Incident Failed - Total Data Breach.",
        options: [],
        score: -80,
        isSuccess: false,
        explanation: "Database syntax errors rendered in the browser are the loudest possible alarm bells for an active SQL Injection vulnerability. Ignoring them guarantees a full database compromise."
      }
    }
  },
  {
    id: "ddos_01",
    title: "The Silent Ping",
    description: "The main application gateway is unresponsive, but CPU usage is low.",
    difficulty: "Hard",
    type: "DDoS",
    maxScore: 150,
    nodes: {
      "start": {
        text: "Users report the main app is offline. The load balancer is up, CPU/RAM is at 10%, but the connection queue is completely maxed out at 65,535.",
        options: [
          { text: "Reboot the load balancer to clear the queue.", nextNodeId: "reboot", points: -20 },
          { text: "Analyze network traffic captures at the border edge.", nextNodeId: "analyze_pcap", points: 50 }
        ]
      },
      "analyze_pcap": {
        text: "You see thousands of inbound TCP SYN packets from spoofed IPs occurring worldwide. The server is waiting for ACKs that never come, exhausting the connection state table.",
        options: [
          { text: "Increase the size of the server's connection table in the OS.", nextNodeId: "increase_table", points: 20 },
          { text: "Route traffic through a cloud DDoS mitigation scrubbing service (like Cloudflare/Akamai) and enable SYN cookies.", nextNodeId: "end_success", points: 80 }
        ]
      },
      "reboot": {
        text: "You reboot. The queue drops to 0, but within 5 seconds, it hits 65,535 again. The attack is relentless.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_fail_reboot", points: 0 }
        ]
      },
      "increase_table": {
        text: "You increase the queue limit. The attacker's botnet easily scales up, exhausting the new limit and the server's RAM along with it. The server crashes entirely.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_fail_scale", points: 0 }
        ]
      },
      "end_success": {
        text: "Incident Mitigated - App Recovered.",
        options: [],
        score: 150,
        isSuccess: true,
        explanation: "This is a classic TCP SYN Flood DDoS attack. It targets the state table rather than bandwidth. You cannot fight a distributed volumetric attack locally. You must route traffic to a distributed scrubbing edge network layer designed to absorb and filter malicious SYN packets."
      },
      "end_fail_reboot": {
        text: "Incident Failed - Treat the Cause, not Symptom.",
        options: [],
        score: -20,
        isSuccess: false,
        explanation: "Rebooting a server during a DDoS attack is futile. The moment the NIC comes online, the attack resumes. You must analyze the traffic to understand the vector before mitigating."
      },
      "end_fail_scale": {
        text: "Incident Failed - Outgunned.",
        options: [],
        score: 70,
        isSuccess: false,
        explanation: "Attempting to absorb a volumetric DDoS attack by simply scaling up local hardware is a losing battle. Botnets have far more resources than your single load balancer. Edge mitigation is required."
      }
    }
  },
  {
    id: "credstuff_01",
    title: "The Dictionary Reader",
    description: "Unusual login failures across thousands of customer accounts.",
    difficulty: "Medium",
    type: "Credential Stuffing",
    maxScore: 100,
    nodes: {
      "start": {
        text: "The authentication API shows a 400x spike in failed login attempts. Strangely, each username is only failing once or twice, never locking out.",
        options: [
          { text: "Ignore it, failed logins are just user typos.", nextNodeId: "ignore", points: -40 },
          { text: "Implement an aggressive IP block on the attacking subnets.", nextNodeId: "block_ip", points: 20 },
          { text: "Implement a CAPTCHA on the login page and analyze the incoming usernames.", nextNodeId: "add_captcha", points: 50 }
        ]
      },
      "add_captcha": {
        text: "The CAPTCHA immediately halts the automated bot traffic. You cross-reference the attempted usernames and find they match a recent third-party data breach dump.",
        options: [
          { text: "Force a password reset for any user account that the bots successfully guessed the password for.", nextNodeId: "end_success", points: 50 }
        ]
      },
      "block_ip": {
        text: "You block the IPs. Five minutes later, the attack resumes from a completely different set of proxy IPs. It's a game of whack-a-mole.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_whack_mole", points: 0 }
        ]
      },
      "ignore": {
        text: "The bots eventually guess 5,000 correct password combinations. Attackers log into those accounts, drain the stored wallet funds, and you face a class-action lawsuit.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_fail", points: 0 }
        ]
      },
      "end_success": {
        text: "Incident Mitigated - User Accounts Secured.",
        options: [],
        score: 100,
        isSuccess: true,
        explanation: "This is a Credential Stuffing attack. Attackers use automated scripts and stolen username/password pairs from other website breaches, hoping users reused the same password on your site. CAPTCHAs and Rate Limiting ruin the economics of automated stuffing. Forcing resets on compromised pairs secures the accounts."
      },
      "end_whack_mole": {
        text: "Incident Partially Mitigated - Inefficient Response.",
        options: [],
        score: 40,
        isSuccess: false,
        explanation: "IP blocking is ineffective against modern botnets which rotate through thousands of residential proxies. You must implement behavioral/automated friction controls like CAPTCHA or WebCrypto challenges."
      },
      "end_fail": {
        text: "Incident Failed - Massive Account Takeover.",
        options: [],
        score: -40,
        isSuccess: false,
        explanation: "Low-and-slow login failures across many accounts (avoiding the 5-try lockout rule) is the signature of credential stuffing. Ignoring it leads directly to Account Takeovers (ATO)."
      }
    }
  },
  {
    id: "malware_01",
    title: "The Hidden Beacon",
    description: "An EDR alert flags unusual DNS requests from a domain controller.",
    difficulty: "Hard",
    type: "Malware",
    maxScore: 160,
    nodes: {
      "start": {
        text: "Your EDR flags the primary Domain Controller. It's making steady, rhythmic DNS requests to 'jk28s-update.xyz' every exactly 45 seconds.",
        options: [
          { text: "It's just Windows Update. Ignore the alert.", nextNodeId: "ignore", points: -80 },
          { text: "Quarantine the process making the request and sinkhole the domain.", nextNodeId: "isolate", points: 60 }
        ]
      },
      "isolate": {
        text: "You sinkhole the domain. You investigate the quarantined process and find a heavily obfuscated PowerShell script running completely in memory with SYSTEM privileges.",
        options: [
          { text: "Assume it's an isolated event. Delete the script and move on.", nextNodeId: "delete_script", points: -30 },
          { text: "Perform a forensic sweep of all network logs to find the initial infection vector and look for lateral movement.", nextNodeId: "end_success", points: 100 }
        ]
      },
      "ignore": {
        text: "The beaconing continues. Two days later, a massive Ransomware payload drops using the Domain Controller to distribute the encryption keys.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_fail", points: 0 }
        ]
      },
      "delete_script": {
        text: "You delete the script. The next day, it magically reappears. The attacker established persistence via a hidden WMI event subscription you failed to check.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_fail_persist", points: 0 }
        ]
      },
      "end_success": {
        text: "Incident Contained - Advanced Persistent Threat (APT) Neutralized.",
        options: [],
        score: 160,
        isSuccess: true,
        explanation: "Rhythmic 'beaconing' is a hallmark of Command and Control (C2) malware (like Cobalt Strike) checking in with the attacker infrastructure. Finding it on a Domain Controller indicates a catastrophic, deep breach. True eradication requires extensive forensics to find persistence mechanisms."
      },
      "end_fail": {
        text: "Incident Disaster - Domain Controller Compromise ignored.",
        options: [],
        score: -80,
        isSuccess: false,
        explanation: "Domain Controllers should NEVER reach out to unknown external internet domains. Any malicious activity on a DC implies the attacker already has the keys to the kingdom."
      },
      "end_fail_persist": {
        text: "Incident Failed - Incomplete Eradication.",
        options: [],
        score: 30,
        isSuccess: false,
        explanation: "Fileless malware living in memory often has hidden persistence mechanisms (Registry run keys, Scheduled Tasks, WMI subscriptions) that recreate the payload upon deletion or reboot. Eradication must be holistic."
      }
    }
  },
  {
    id: "zeroday_01",
    title: "The Ghost in the Router",
    description: "A published zero-day exploit drops on Twitter on a Friday afternoon.",
    difficulty: "Medium",
    type: "Zero-Day Exploit",
    maxScore: 100,
    nodes: {
      "start": {
        text: "Twitter (X) explodes. A security researcher just dropped a zero-click Remote Code Execution (RCE) exploit for the exact brand of edge firewall your company uses. There is no vendor patch yet.",
        options: [
          { text: "Wait for the vendor to release an official patch on Monday. You don't want to break production.", nextNodeId: "wait_patch", points: -60 },
          { text: "Review the exploit payload methodology. Implement temporary WAF rules or network ACLs to block the specific exploit headers.", nextNodeId: "end_success", points: 100 }
        ]
      },
      "wait_patch": {
        text: "You go home for the weekend. By Saturday morning, automated scanner bots have found your vulnerable firewall and deployed cryptominers across your DMZ.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_fail", points: 0 }
        ]
      },
      "end_success": {
        text: "Incident Mitigated - Zero-Day Survived.",
        options: [],
        score: 100,
        isSuccess: true,
        explanation: "Waiting for an official vendor patch during a public zero-day is a death sentence. Within hours, public exploit code 'Proof of Concepts' are integrated into automated scanner botnets. You must implement virtual patching, ACLs, or disable the vulnerable service outright to survive the interim period."
      },
      "end_fail": {
        text: "Incident Failed - Exploited in the Wild.",
        options: [],
        score: -60,
        isSuccess: false,
        explanation: "In the modern threat landscape, the time between a vulnerability being publicized and active mass exploitation is measured in minutes, not days. You must act aggressively to mitigate unpatched flaws."
      }
    }
  },
  {
    id: "cloud_01",
    title: "The Leaky Bucket",
    description: "An external researcher contacts you about an exposed AWS S3 bucket.",
    difficulty: "Easy",
    type: "Cloud Security",
    maxScore: 100,
    nodes: {
      "start": {
        text: "You receive an email from a security researcher stating they found an open S3 bucket named 'company-prod-backups' containing 500GB of SQL dumps.",
        options: [
          { text: "Immediately change the bucket policy to Private.", nextNodeId: "make_private", points: 50 },
          { text: "Ignore the email, researchers are just looking for bug bounties.", nextNodeId: "ignore", points: -80 }
        ]
      },
      "make_private": {
        text: "You secure the bucket. The data is no longer public. What is the next step?",
        options: [
          { text: "Review CloudTrail logs to see who exactly downloaded objects from that bucket.", nextNodeId: "end_success", points: 50 },
          { text: "Consider the incident closed.", nextNodeId: "end_partial", points: -10 }
        ]
      },
      "ignore": {
        text: "The researcher publishes their findings on a blog. Attackers download the data and hold it for ransom.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_fail", points: 0 }
        ]
      },
      "end_success": {
        text: "Incident Resolved - Breach Scoped.",
        options: [],
        score: 100,
        isSuccess: true,
        explanation: "Securing the bucket is step one. Determining IF the data was accessed by malicious actors (via CloudTrail data events) is step two. You cannot accurately report a data breach to regulators without scoping the exposure."
      },
      "end_partial": {
        text: "Incident Partially Failed - Blind to Impact.",
        options: [],
        score: 40,
        isSuccess: false,
        explanation: "While you stopped the bleeding, failing to investigate the logs means you have no idea if the backups were copied. You must assume a total breach occurred."
      },
      "end_fail": {
        text: "Incident Failed - Public PR Nightmare.",
        options: [],
        score: -80,
        isSuccess: false,
        explanation: "Never ignore responsible disclosure reports. Misconfigured cloud storage is the #1 cause of major data breaches globally."
      }
    }
  },
  {
    id: "supplychain_01",
    title: "The Poisoned Update",
    description: "Your network management software pushes a suspicious automatic update.",
    difficulty: "Hard",
    type: "Supply Chain",
    maxScore: 200,
    nodes: {
      "start": {
        text: "Your core network monitoring tool, 'SolarNode', auto-updates overnight. This morning, EDR flags the SolarNode executable attempting to execute encoded PowerShell.",
        options: [
          { text: "Allow the process, the software is trusted and digitally signed by the vendor.", nextNodeId: "allow", points: -100 },
          { text: "Block the process and isolate the SolarNode server.", nextNodeId: "isolate", points: 100 }
        ]
      },
      "isolate": {
        text: "You isolate the management server. You search the network and find the updated DLL dropped a backdoor that was beginning to map the internal network.",
        options: [
          { text: "Roll back the update, block the C2 domain, and sweep for persistence.", nextNodeId: "end_success", points: 100 }
        ]
      },
      "allow": {
        text: "The PowerShell executes, creating a reverse shell. Because it's a trusted network tool, it has domain admin credentials. The attackers own the entire forest.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_fail", points: 0 }
        ]
      },
      "end_success": {
        text: "Incident Contained - Supply Chain Mitigated.",
        options: [],
        score: 200,
        isSuccess: true,
        explanation: "Supply chain attacks compromise trusted vendors to bypass your perimeter. You correctly trusted your behavioral EDR alerts over the digital signature. Isolating management infrastructure early is crucial."
      },
      "end_fail": {
        text: "Incident Failed - Total Enterprise Collapse.",
        options: [],
        score: -100,
        isSuccess: false,
        explanation: "Ignoring behavioral alerts just because software is 'trusted' is how massive supply chain breaches (like SolarWinds) succeed. Attackers often compromise the vendor's signing certificates."
      }
    }
  },
  {
    id: "wifi_01",
    title: "The Rogue Twin",
    description: "Employees report the corporate Wi-Fi is randomly disconnecting.",
    difficulty: "Medium",
    type: "Network Security",
    maxScore: 100,
    nodes: {
      "start": {
        text: "Multiple users in the lobby complain they keep getting disconnected from 'Corp_Guest' and forced to re-login to a new captive portal.",
        options: [
          { text: "Tell them to restart their laptops.", nextNodeId: "ignore", points: -30 },
          { text: "Check the Wireless Controller for rogue Access Point (AP) alerts.", nextNodeId: "check_wlc", points: 50 },
          { text: "Physically walk to the lobby with a Wi-Fi analyzer.", nextNodeId: "walk_lobby", points: 60 }
        ]
      },
      "check_wlc": {
        text: "The WLC shows a new access point broadcasting the exact BSSID and SSID as your guest network, but with a drastically stronger signal in the lobby area.",
        options: [
          { text: "Initiate a de-auth containment attack against the rogue AP from your enterprise APs.", nextNodeId: "end_success", points: 50 }
        ]
      },
      "walk_lobby": {
        text: "Your analyzer finds a 'Pineapple' device hidden behind a planter, broadcasting the fake network.",
        options: [
          { text: "Confiscate the device and review logs.", nextNodeId: "end_success", points: 40 }
        ]
      },
      "ignore": {
        text: "The attacker intercepts the captive portal logins, stealing VPN credentials for 15 employees.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_fail", points: 0 }
        ]
      },
      "end_success": {
        text: "Incident Resolved - Evil Twin Neutralized.",
        options: [],
        score: 100,
        isSuccess: true,
        explanation: "This is an 'Evil Twin' rogue AP attack. Attackers broadcast a stronger signal to force devices to connect to them instead of the legit AP, allowing Man-in-the-Middle (MitM) credential harvesting. Wireless intrusion prevention systems (WIPS) and physical sweeps are the defense."
      },
      "end_fail": {
        text: "Incident Failed - Credentials Harvested.",
        options: [],
        score: -30,
        isSuccess: false,
        explanation: "Ignoring basic connectivity complaints often masks underlying physical or wireless attacks. Users blindly typing credentials into fake captive portals is a major risk."
      }
    }
  },
  {
    id: "data_01",
    title: "The Accidental Forward",
    description: "A sensitive document is sent to the wrong distribution list.",
    difficulty: "Easy",
    type: "Data Leak",
    maxScore: 100,
    nodes: {
      "start": {
        text: "A frantic HR rep calls. They just emailed the unencrypted spreadsheet of every employee's salary and bonus to the 'All-Company' distribution list.",
        options: [
          { text: "Tell them to send an apology email.", nextNodeId: "apology", points: -50 },
          { text: "Immediately execute an Exchange/M365 message trace and hard purge/recall the specific email from all mailboxes.", nextNodeId: "purge", points: 100 }
        ]
      },
      "purge": {
        text: "You execute a `Search-Mailbox -DeleteContent` script. The email is ripped out of the inboxes of 95% of users before they even opened it.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_success", points: 0 }
        ]
      },
      "apology": {
        text: "The apology email simply highlights the mistake, causing everyone to scramble to read the original email. Salary data is leaked to external competitors.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_fail", points: 0 }
        ]
      },
      "end_success": {
        text: "Incident Resolved - Leak Contained.",
        options: [],
        score: 100,
        isSuccess: true,
        explanation: "Data Loss Prevention (DLP) failures require swift administrative containment. Hard-purging the email via admin tools is the only effective way to stop an internal accidental data leak."
      },
      "end_fail": {
        text: "Incident Failed - Streisand Effect.",
        options: [],
        score: -50,
        isSuccess: false,
        explanation: "Sending an apology or 'please delete' email merely draws attention to the leak (The Streisand Effect). Technical controls (purging) must handle data spills."
      }
    }
  },
  {
    id: "keylogger_01",
    title: "The Slow Typist",
    description: "AV detects a generic keylogger, but misses the payload.",
    difficulty: "Medium",
    type: "Malware",
    maxScore: 100,
    nodes: {
      "start": {
        text: "Windows Defender automatically quarantines a file `svchvst.exe` (note the 'v' instead of 'o') in a user's AppData folder, flagging it as a generic keylogger.",
        options: [
          { text: "Defender got it. No further action needed.", nextNodeId: "ignore", points: -60 },
          { text: "Reset the user's AD password and all cached browser credentials immediately.", nextNodeId: "reset_creds", points: 60 }
        ]
      },
      "reset_creds": {
        text: "You reset their passwords. You then review the logs and see the keylogger was active for 14 days before Defender finally updated and caught it.",
        options: [
          { text: "Also enable MFA for their VPN and email.", nextNodeId: "end_success", points: 40 }
        ]
      },
      "ignore": {
        text: "The keylogger was caught, but it had already transmitted the user's VPN password to Russia yesterday. The attacker logs in that night.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_fail", points: 0 }
        ]
      },
      "end_success": {
        text: "Incident Resolved - Post-Exploitation Mitigated.",
        options: [],
        score: 100,
        isSuccess: true,
        explanation: "Antivirus catching malware is good, but it often catches it AFTER it has already executed and stolen data. Always assume any credentials typed on an infected machine are compromised and force resets."
      },
      "end_fail": {
        text: "Incident Failed - Stolen Credentials.",
        options: [],
        score: -60,
        isSuccess: false,
        explanation: "Removing the keylogger does not retrieve the keys it already stole. Failing to reset passwords after a stealer infection guarantees an account takeover."
      }
    }
  },
  {
    id: "extortion_01",
    title: "The Double Extortion",
    description: "Ransomware operators threaten to leak data.",
    difficulty: "Hard",
    type: "Ransomware",
    maxScore: 100,
    nodes: {
      "start": {
        text: "You successfully restored files from backups after a ransomware attack. However, the attackers email the CEO: 'Pay $1M or we leak the 500GB of PII we stole before encrypting.'",
        options: [
          { text: "Pay the ransom to protect the company reputation.", nextNodeId: "pay", points: -100 },
          { text: "Refuse to pay. Contact law enforcement, legal, and prepare public breach notifications.", nextNodeId: "refuse", points: 100 }
        ]
      },
      "refuse": {
        text: "The attackers leak the data. You face fines, but because you were transparent and engaged incident response counsel early, the regulatory impact is softened.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_success", points: 0 }
        ]
      },
      "pay": {
        text: "You pay the $1M. The attackers leak the data anyway two weeks later because they are criminals. You are out $1M and still face fines.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_fail", points: 0 }
        ]
      },
      "end_success": {
        text: "Incident Managed - The Hard Choice.",
        options: [],
        score: 100,
        isSuccess: true,
        explanation: "Double Extortion is the standard ransomware playbook now. Paying criminals NEVER guarantees they will delete the stolen data. Legal and regulatory transparency is the only viable path forward."
      },
      "end_fail": {
        text: "Incident Failed - Funded Terrorism.",
        options: [],
        score: -100,
        isSuccess: false,
        explanation: "Paying a data extortion demand is universally advised against by the FBI and security professionals. Criminals often keep the data, sell it anyway, or come back for a second ransom."
      }
    }
  },
  {
    id: "phish_02",
    title: "The Invoice Trap",
    description: "A massive invoice spam campaign hits the company.",
    difficulty: "Easy",
    type: "Phishing",
    maxScore: 100,
    nodes: {
      "start": {
        text: "You see 500 emails hit user inboxes titled 'OVERDUE INVOICE - FINAL NOTICE.pdf' containing a malicious macro attachment.",
        options: [
          { text: "Use PowerShell/GraphAPI to delete the emails from the inboxes.", nextNodeId: "delete", points: 80 },
          { text: "Send an email telling people not to click it.", nextNodeId: "email", points: -30 }
        ]
      },
      "delete": {
        text: "The emails are purged. You find 3 users clicked the attachment before you deleted it.",
        options: [
          { text: "Isolate those 3 endpoints and reimage them.", nextNodeId: "end_success", points: 20 }
        ]
      },
      "email": {
        text: "While users read your warning, 45 people had already clicked the 'invoice' in a panic. Network-wide malware outbreak ensues.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_fail", points: 0 }
        ]
      },
      "end_success": {
        text: "Incident Resolved - Rapid Remediation.",
        options: [],
        score: 100,
        isSuccess: true,
        explanation: "Automated threat remediation (auto-purging malicious emails post-delivery) is critical. Users will inevitably click phishing links. Removing the temptation from the inbox is the best defense."
      },
      "end_fail": {
        text: "Incident Failed - Slow Response.",
        options: [],
        score: -30,
        isSuccess: false,
        explanation: "Warnings are too slow for mass spray-and-pray phishing campaigns. Technical containment (purging the payload) must be faster than the user's urge to click."
      }
    }
  },
  {
    id: "api_01",
    title: "The Broken Object",
    description: "A user is accessing records they shouldn't.",
    difficulty: "Medium",
    type: "API Security",
    maxScore: 100,
    nodes: {
      "start": {
        text: "A customer reports they can view other users' billing profiles by changing the `user_id=105` parameter in the URL URL to `user_id=106`.",
        options: [
          { text: "Implement session-based authorization checks heavily on the backend API.", nextNodeId: "fix_api", points: 100 },
          { text: "Just encrypt the ID in the URL so they can't guess it.", nextNodeId: "encrypt_url", points: -50 }
        ]
      },
      "fix_api": {
        text: "The backend now verifies that the requested `user_id` matches the securely stored session ID of the currently logged-in user.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_success", points: 0 }
        ]
      },
      "encrypt_url": {
        text: "You encrypt the ID. An attacker easily bypasses this by copying valid encrypted IDs they find elsewhere in the app. The core vulnerability remains.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_fail", points: 0 }
        ]
      },
      "end_success": {
        text: "Incident Resolved - BOLA Patched.",
        options: [],
        score: 100,
        isSuccess: true,
        explanation: "This is a Broken Object Level Authorization (BOLA/IDOR) vulnerability. The only fix is server-side validation ensuring the authenticated user actually has permission to access the specific requested data object."
      },
      "end_fail": {
        text: "Incident Failed - Security by Obscurity.",
        options: [],
        score: -50,
        isSuccess: false,
        explanation: "Obfuscating or encrypting parameters does not fix authorization logic flaws. It just slows attackers down temporarily. You must fix the underlying authorization check."
      }
    }
  },
  {
    id: "beginner_phishing_01",
    title: "The Suspicious Link",
    description: "You receive an email that looks like it's from your bank. What do you do?",
    difficulty: "Beginner",
    type: "Phishing",
    maxScore: 50,
    nodes: {
      "start": {
        text: "You get an email saying 'Urgent: Your account is locked! Click here to verify your identity: http://secure-bank-login.xyz'. What is your first reaction?",
        options: [
          { text: "Click the link immediately to unlock my account.", nextNodeId: "click_link", points: 0 },
          { text: "Check the sender's email address and hover over the link to see where it really goes.", nextNodeId: "check_details", points: 25 },
          { text: "Delete the email and call my bank's official number from their website.", nextNodeId: "delete_email", points: 25 }
        ]
      },
      "click_link": {
        text: "You clicked the link. It takes you to a page that looks exactly like your bank, asking for your username and password. Do you enter them?",
        options: [
          { text: "Yes, I need to unlock my account.", nextNodeId: "enter_creds", points: 0 },
          { text: "Wait, the web address looks strange (secure-bank-login.xyz). I'll close the tab.", nextNodeId: "close_tab", points: 25 }
        ]
      },
      "check_details": {
        text: "You notice the sender is 'support@random-mail.com' and the link points to a strange website. What do you do now?",
        options: [
          { text: "Report the email as phishing and delete it.", nextNodeId: "end_success", points: 25 }
        ]
      },
      "delete_email": {
        text: "Great choice! Your bank confirms your account is fine and thanks you for being cautious.",
        options: [
          { text: "Finish Scenario", nextNodeId: "end_success", points: 25 }
        ]
      },
      "enter_creds": {
        text: "Oh no! You just gave your bank login to a hacker. They can now access your money.",
        options: [
          { text: "Finish Scenario", nextNodeId: "end_fail", points: 0 }
        ]
      },
      "close_tab": {
        text: "Smart move. You avoided a trap. Always check the website address (URL) before typing passwords.",
        options: [
          { text: "Finish Scenario", nextNodeId: "end_success", points: 25 }
        ]
      },
      "end_success": {
        text: "Congratulations! You successfully identified and avoided a phishing attack.",
        options: [],
        score: 50,
        isSuccess: true,
        explanation: "Phishing emails often use 'urgent' language to make you panic and click without thinking. Always check the sender's address and the actual destination of links."
      },
      "end_fail": {
        text: "Scenario Over. You fell for the phishing trap.",
        options: [],
        score: 0,
        isSuccess: false,
        explanation: "Never enter your passwords on a site you reached via an email link. Navigate to the official website yourself or use their app."
      }
    }
  },
  {
    id: "beginner_vishing_01",
    title: "The Unknown Caller",
    description: "Someone calls you claiming to be from 'Tech Support'.",
    difficulty: "Beginner",
    type: "Vishing",
    maxScore: 50,
    nodes: {
      "start": {
        text: "Your phone rings. A person says, 'Hello, I'm from Microsoft Support. We've detected a virus on your computer. I need to remote in to fix it.' What do you do?",
        options: [
          { text: "Follow their instructions to get the virus removed.", nextNodeId: "follow_caller", points: 0 },
          { text: "Ask them for their employee ID and why they are calling me personally.", nextNodeId: "ask_questions", points: 10 },
          { text: "Hang up immediately. Microsoft doesn't call people like this.", nextNodeId: "hang_up", points: 25 }
        ]
      },
      "follow_caller": {
        text: "They ask you to download a program called 'AnyDesk'. Do you do it?",
        options: [
          { text: "Yes, I want my computer fixed.", nextNodeId: "download_tool", points: 0 },
          { text: "No, this feels wrong. I'll hang up.", nextNodeId: "hang_up", points: 25 }
        ]
      },
      "ask_questions": {
        text: "They get aggressive and say your computer will crash in 5 minutes if you don't help. What now?",
        options: [
          { text: "Panic and do what they say.", nextNodeId: "follow_caller", points: 0 },
          { text: "Realize this is a classic scam tactic. Hang up.", nextNodeId: "hang_up", points: 40 }
        ]
      },
      "download_tool": {
        text: "Once they have access, they lock your computer and demand $500 to unlock it.",
        options: [
          { text: "Finish Scenario", nextNodeId: "end_fail", points: 0 }
        ]
      },
      "hang_up": {
        text: "You hung up and stayed safe. Good job!",
        options: [
          { text: "Finish Scenario", nextNodeId: "end_success", points: 25 }
        ]
      },
      "end_success": {
        text: "Success! You avoided a 'Tech Support' scam.",
        options: [],
        score: 50,
        isSuccess: true,
        explanation: "Scammers use 'Vishing' (voice phishing) to trick you. Legitimate tech companies will never call you out of the blue to tell you about a virus."
      },
      "end_fail": {
        text: "Scenario Over. You gave a stranger control of your computer.",
        options: [],
        score: 0,
        isSuccess: false,
        explanation: "Never give remote access to your computer to someone who calls you. They can steal your files and lock your system."
      }
    }
  },
  {
    id: "beginner_wifi_01",
    title: "The Public Wi-Fi Trap",
    description: "You're at a coffee shop and see 'Free_Public_WiFi'.",
    difficulty: "Beginner",
    type: "Network Security",
    maxScore: 50,
    nodes: {
      "start": {
        text: "You need to check your bank balance quickly. You see an open Wi-Fi network called 'Free_Public_WiFi'. Should you join it?",
        options: [
          { text: "Yes, it's free and fast!", nextNodeId: "join_wifi", points: 0 },
          { text: "No, I'll use my phone's cellular data instead.", nextNodeId: "use_data", points: 25 },
          { text: "I'll join but only use it for reading news, not banking.", nextNodeId: "join_news", points: 15 }
        ]
      },
      "join_wifi": {
        text: "You are connected! Now you go to your bank's website. A warning pops up saying 'This connection is not private'. Do you proceed?",
        options: [
          { text: "Yes, the coffee shop Wi-Fi is probably just a bit old.", nextNodeId: "proceed_anyway", points: 0 },
          { text: "No way! I'm disconnecting right now.", nextNodeId: "disconnect", points: 25 }
        ]
      },
      "use_data": {
        text: "Smart choice. Cellular data is much harder for hackers nearby to intercept than open Wi-Fi.",
        options: [
          { text: "Finish Scenario", nextNodeId: "end_success", points: 25 }
        ]
      },
      "join_news": {
        text: "Using public Wi-Fi for non-sensitive things is okay, but it's still better to be cautious. You finish reading and disconnect.",
        options: [
          { text: "Finish Scenario", nextNodeId: "end_success", points: 35 }
        ]
      },
      "proceed_anyway": {
        text: "A hacker sitting in the corner just intercepted your bank login. This is called a 'Man-in-the-Middle' attack.",
        options: [
          { text: "Finish Scenario", nextNodeId: "end_fail", points: 0 }
        ]
      },
      "disconnect": {
        text: "Safe move. That warning meant someone might be trying to watch your traffic.",
        options: [
          { text: "Finish Scenario", nextNodeId: "end_success", points: 25 }
        ]
      },
      "end_success": {
        text: "Well done! You stayed safe on public Wi-Fi.",
        options: [],
        score: 50,
        isSuccess: true,
        explanation: "Unsecured public Wi-Fi can be easily monitored by hackers. Avoid doing sensitive things like banking or shopping on networks you don't trust."
      },
      "end_fail": {
        text: "Scenario Over. Your data was intercepted.",
        options: [],
        score: 0,
        isSuccess: false,
        explanation: "Never ignore certificate warnings on your browser, especially on public Wi-Fi. It often means your connection is being tampered with."
      }
    }
  }
];
