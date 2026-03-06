export const interactiveScenarios = [
  {
    id: "phishing_incident_01",
    title: "The CEO Fraud",
    description: "Respond to a sophisticated spear-phishing attack targeting the finance department.",
    difficulty: "Medium",
    nodes: {
      "start": {
        text: "You receive an urgent ticket from the Helpdesk: The VP of Finance just wired $50,000 to an unknown vendor after receiving an email from the 'CEO'. What is your immediate first step?",
        options: [
          { text: "Contact the bank immediately to attempt a wire recall.", nextNodeId: "bank_recall" },
          { text: "Analyze the email headers of the 'CEO' email.", nextNodeId: "analyze_headers" },
          { text: "Lock the VP of Finance's account and reset their password.", nextNodeId: "lock_account" }
        ]
      },
      "bank_recall": {
        text: "You instruct Finance to contact the bank. The bank is processing the recall, but it's a race against time. Meanwhile, what do you do with the IT investigation?",
        options: [
          { text: "Analyze the malicious email and extract indicators of compromise (IoCs).", nextNodeId: "analyze_headers_2" },
          { text: "Check email logs to see if anyone else received a similar email.", nextNodeId: "check_logs" }
        ]
      },
      "analyze_headers": {
        text: "You pull the headers. The email originated from a look-alike domain (exampIe.com instead of example.com). It bypassed DMARC because the look-alike domain has valid records. The wire transfer completes while you analyze.",
        options: [
          { text: "Block the look-alike domain on the email gateway.", nextNodeId: "block_domain" },
          { text: "Contact the bank to recall the wire.", nextNodeId: "bank_recall_late" }
        ]
      },
      "analyze_headers_2": {
        text: "You pull the headers. The email originated from a look-alike domain (exampIe.com instead of example.com). It bypassed DMARC because the look-alike domain has valid records.",
        options: [
          { text: "Block the look-alike domain on the email gateway.", nextNodeId: "block_domain" },
          { text: "Search the environment for the sender's IP address.", nextNodeId: "search_ip" }
        ]
      },
      "lock_account": {
        text: "You lock the VP's account. They call IT demanding to know why they are locked out during a critical financial operation. They mention the CEO approved the transfer.",
        options: [
          { text: "Explain it's a suspected phishing attack and analyze the email.", nextNodeId: "analyze_headers" },
          { text: "Unlock the account immediately to avoid blocking business.", nextNodeId: "unlock_account" }
        ]
      },
      "bank_recall_late": {
        text: "You contact the bank. Unfortunately, due to the delay, the funds have already been moved out of the receiving account. The money is lost. Incident Response focuses on the post-mortem.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_failure" }
        ]
      },
      "check_logs": {
         text: "You find 12 other users received similar emails. You initiate a purge of these emails from the mailboxes.",
         options: [
             { text: "Block the sender domain.", nextNodeId: "block_domain" }
         ]
      },
      "block_domain": {
        text: "You successfully block exampIe.com on the email gateway, preventing further emails. The bank notifies you that the $50,000 recall was successful!",
        options: [
          { text: "Finish Incident", nextNodeId: "end_success" }
        ]
      },
      "search_ip": {
          text: "You search for the IP. It resolves to a known basic VPN provider. Not much attribution can be made. You decide to block the domain instead.",
          options: [
              { text: "Block the look-alike domain.", nextNodeId: "block_domain" }
          ]
      },
      "unlock_account": {
        text: "You unlock the account. The attacker, who also had a credential harvesting link in that email, logs in and begins exfiltrating sensitive financial data. The situation has escalated significantly.",
        options: [
          { text: "Finish Incident", nextNodeId: "end_disaster" }
        ]
      },
      "end_success": {
        text: "Incident Resolved Successfully. Swift action containing the financial loss and blocking the threat vector resulted in a great save for the company.",
        options: []
      },
      "end_failure": {
        text: "Incident Resolved with Financial Loss. While the threat was eventually identified, prioritizing analysis over immediate containment procedures cost the company $50,000.",
        options: []
      },
      "end_disaster": {
        text: "Incident Escalated to Major Breach. Failing to communicate risks to VIPs and reversing containment actions led to a massive data breach and financial loss.",
        options: []
      }
    }
  },
  {
    id: "ransomware_outbreak_01",
    title: "Midnight Encryption",
    description: "A ransomware infection is spreading rapidly across the server infrastructure. Time is critical.",
    difficulty: "Hard",
    nodes: {
       "start": {
           text: "It's 2 AM on a Saturday. Monitoring alerts are going off: multiple file servers are experiencing massive read/modify/write operations. A user on the night shift calls reporting all their files end in '.locked'.",
           options: [
               { text: "Isolate the affected subnets immediately via the core switch.", nextNodeId: "isolate_network" },
               { text: "Log into the affected servers to identify the malware process.", nextNodeId: "log_into_servers" },
               { text: "Check the backup server to ensure backups are running.", nextNodeId: "check_backups" }
           ]
       },
       "isolate_network": {
           text: "You isolate the server segment. Services go down globally, but the encryption stops spreading to workstations and other safe zones.",
           options: [
               { text: "Identify the 'Patient Zero' workstation that initiated the file share encryption.", nextNodeId: "find_patient_zero" },
               { text: "Begin restoring servers from backups immediately.", nextNodeId: "restore_servers_early" }
           ]
       },
       "log_into_servers": {
           text: "You RDP into the main file server. The server is incredibly slow. You see a process 'sysx.exe' eating 100% CPU. While you watch, the RDP session drops. The server is fully encrypted and unbootable.",
           options: [
               { text: "Isolate the network.", nextNodeId: "isolate_network_late" },
               { text: "Declare a major incident and page the entire security team.", nextNodeId: "page_team" }
           ]
       },
       "check_backups": {
           text: "You log into the backup appliance. To your horror, the backup files themselves are currently being encrypted. The ransomware has compromised the backup infrastructure.",
           options: [
               { text: "Pull the power cables on the backup SAN.", nextNodeId: "pull_power" },
               { text: "Isolate the backup network segment.", nextNodeId: "isolate_backup_network" }
           ]
       },
       "isolate_network_late": {
           text: "You isolate the network, but it's too late for the core servers, which are now fully encrypted. You need to investigate how it got in.",
           options: [
               { text: "Check VPN and Firewall logs for recent odd access.", nextNodeId: "check_vpn_logs" }
           ]
       },
       "find_patient_zero": {
            text: "Reviewing network traffic from just before the isolation, you identify a workstation 'HR-DESK-04' making thousands of SMB connections.",
            options: [
                { text: "Isolate HR-DESK-04 and image its drive for forensics.", nextNodeId: "forensics_patient_zero" },
                { text: "Wipe HR-DESK-04 immediately.", nextNodeId: "wipe_patient_zero" }
            ]
       },
       "restore_servers_early": {
           text: "You begin restoring servers. However, because you haven't identified patient zero, the malware wakes up on the restored servers and begins encrypting them again.",
           options: [
               { text: "Finish Incident", nextNodeId: "end_loop" }
           ]
       },
       "page_team": {
           text: "The team is paged. Valuable minutes are lost while people wake up and log in. The ransomware spreads to 80% of the infrastructure.",
           options: [
               { text: "Finish Incident", nextNodeId: "end_massive_breach" }
           ]
       },
       "pull_power": {
           text: "You literally pull the power on the SAN. Good news: half the backups are intact. Bad news: the SAN array is corrupted and requires vendor support to rebuild before restoring.",
           options: [
               { text: "Wait for vendor, then restore.", nextNodeId: "end_long_downtime" }
           ]
       },
       "isolate_backup_network": {
           text: "You isolate the backup segment cleanly. 70% of backups are safe. You can use these to recover.",
           options: [
               { text: "Find patient zero before restoring.", nextNodeId: "find_patient_zero" }
           ]
       },
       "check_vpn_logs": {
           text: "You find a compromised VPN account that didn't have MFA enforced. They used this to pivot.",
           options: [
               { text: "Finish Incident", nextNodeId: "end_post_mortem" }
           ]
       },
       "forensics_patient_zero": {
           text: "You identify a malicious payload delivered via a compromised software update. You block the indicator of compromise across the EDR.",
           options: [
               { text: "Begin safe recovery.", nextNodeId: "end_hero" }
           ]
       },
       "wipe_patient_zero": {
           text: "You wipe the machine. You've destroyed the evidence of how they got in. You restore the servers, but the attackers are likely still in the network.",
           options: [
               { text: "Finish Incident", nextNodeId: "end_lingering_threat" }
           ]
       },
       "end_loop": {
           text: "Incident Failed. Restoring before eradicating the threat put you in an infinite loop of encryption. The incident takes weeks to recover from.",
           options: []
       },
       "end_massive_breach": {
           text: "Incident Disaster. Failure to take immediate containment action resulted in total enterprise loss. The company may not survive.",
           options: []
       },
       "end_long_downtime": {
           text: "Incident Resolved (Messy). You saved some backups through drastic physical action, but recovery will take 4x as long due to hardware corruption. Business impact is severe.",
           options: []
       },
       "end_post_mortem": {
           text: "Incident Resolved (Loss). The network is encrypted, but you found the root cause. It will be a completely rebuild from scratch.",
           options: []
       },
       "end_hero": {
           text: "Incident Smashed. Perfect execution. You isolated early, found the root cause, eradicated it, and recovered safely. You are getting a promotion.",
           options: []
       },
       "end_lingering_threat": {
           text: "Incident Resolved (Unsafe). You restored services quickly but destroyed critical evidence. The attackers will likely be back.",
           options: []
       }
    }
  }
];
