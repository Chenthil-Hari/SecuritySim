export const campaignData = {
    season: 1,
    title: "Operation Black Byte",
    description: "A mysterious ransomware group is targeting the city's infrastructure. Infiltrate their network and stop the final payload.",
    stages: [
        {
            id: 1,
            title: "The Initial Hook",
            description: "A suspicious HR email has been flagged by the system.",
            scenarioId: "phishing-1",
            storyIntro: "Welcome to the team, Analyst. We've got a live one. A suspicious email just bypassed our filters and hit the HR director's inbox. We believe it's the opening move of a larger campaign by 'Black Byte'. Don't let them in.",
            storyOutro: "Good catch. HR reported the email and we've blocked the domain. But tracing the origin revealed something troubling—this wasn't a generic blast. It was targeted. They're already inside the perimeter.",
            position: { x: 10, y: 50 },
            type: "phishing"
        },
        {
            id: 2,
            title: "Pretexting Protocol",
            description: "Someone is calling the help desk pretending to be the lead engineer.",
            scenarioId: "scam-call-2",
            storyIntro: "The hackers are getting bold. They're now using voice calls to bypass our second-factor authentication. Someone is calling from what looks like an internal line. Keep your cool.",
            storyOutro: "You handled that perfectly. They didn't get the override code. However, our network logs show a huge spike in outbound traffic from the secondary server. They're siphoning something.",
            position: { x: 25, y: 30 },
            type: "scam"
        },
        {
            id: 3,
            title: "The Parking Lot Plug",
            description: "A suspicious USB drive was found near the server room entrance.",
            scenarioId: "malware-2",
            storyIntro: "Physical security has been breached. One of our janitors found a USB drive labeled 'Q4 Salary Data' right next to the server racks. It's a classic bait. IT needs you to analyze the risk.",
            storyOutro: "Disaster averted. That drive was loaded with a kernel-level rootkit. If that had been plugged into a workstation, 'Black Byte' would have had full administrative access to our payroll system.",
            position: { x: 40, y: 60 },
            type: "malware"
        },
        {
            id: 4,
            title: "The CEO Gambit",
            description: "A high-pressure email from the 'CEO' requesting an urgent wire transfer.",
            scenarioId: "phishing-2",
            storyIntro: "They're going for the top. The Finance VP received an urgent transfer request from what looks like the CEO's personal account. They know the CEO is currently on a flight and unreachable. It's up to you to verify.",
            storyOutro: "The VP is breathing a sigh of relief. That $45,000 would have vanished into a crypto-mixer in seconds. Our counter-intel team just tracked the email server to an offshore facility linked to Black Byte.",
            position: { x: 55, y: 20 },
            type: "phishing"
        },
        {
            id: 5,
            title: "The Tailgate Trap",
            description: "A delivery person is trying to bypass biometric security.",
            scenarioId: "social-eng-1",
            storyIntro: "Standard operating procedure: No one enters without a badge. We've received reports of a suspicious delivery person hanging around the service entrance. Be prepared to stand your ground.",
            storyOutro: "That wasn't a delivery driver. Security found a Wi-Fi pineapple hidden inside the pizza boxes. They were planning to set up a rogue access point inside the building. We're closing the net on them.",
            position: { x: 70, y: 50 },
            type: "social"
        },
        {
            id: 6,
            title: "The LinkedIn Leak",
            description: "Recruiters are targeting our developers to harvest internal credentials.",
            scenarioId: "social-eng-2",
            storyIntro: "Black Byte is playing the long game. They're impersonating high-end recruiters to get our engineers to share system architectures. One of our lead devs just got a suspicious offer.",
            storyOutro: "Excellent work identifying the phishing profile. We've alerted the rest of the dev team. But while we were focused on LinkedIn, a silent alarm went off in the high-security vault. They've found a backdoor.",
            position: { x: 85, y: 30 },
            type: "social"
        },
        {
            id: 7,
            title: "Voice Clone Crisis",
            description: "Simulated AI voice attack on the emergency response team.",
            scenarioId: "scam-call-1",
            storyIntro: "This is getting scary. They're using AI-cloned voices of the CTO's family to demand server emergency access. The pressure is on. Stay focused on the facts, not the emotions.",
            storyOutro: "You saved more than just data today. The CTO was about to cave. Now that we've blocked the synthetic voice signal, we've managed to trace the connection back to a local ISP. They're close.",
            position: { x: 100, y: 70 },
            type: "scam"
        },
        {
            id: 8,
            title: "The Scareware Wave",
            description: "A massive internal popup infection is causing panic in Operations.",
            scenarioId: "malware-1",
            storyIntro: "Total chaos in the Ops room. Every monitor is flashing red warnings. It's a distraction—Black Byte is trying to mask their final move by causing a local panic. Dispel the fear.",
            storyOutro: "Panic subsided. You've cleaned the scareware, but our scanners just picked up a 10GB data transfer headed to an external IP. They're stealing the infrastructure blueprints!",
            position: { x: 115, y: 40 },
            type: "malware"
        },
        {
            id: 9,
            title: "The Prize Pitfall",
            description: "The final phishing attempt aimed at the system administrator.",
            scenarioId: "phishing-3",
            storyIntro: "The SysAdmin just got 'notified' of a major security award. It's their final attempt to get the master decryption keys before we lock them out forever. Don't let them win.",
            storyOutro: "The doors are locked. The SysAdmin is safe. We've gathered enough forensic evidence from these attempts to locate Black Byte's primary command server. It's time for the final confrontation.",
            position: { x: 130, y: 10 },
            type: "phishing"
        },
        {
            id: 10,
            title: "Shutdown: Black Byte",
            description: "The final stand against the ransomware master node.",
            scenarioId: "final-black-byte",
            storyIntro: "We're in their house now. This is the master node. They're throwing everything at us—every trick in the book. Hold the line, Analyst. Shutdown Black Byte for good.",
            storyOutro: "Connection terminated. The master node is down. 'Operation Black Byte' is a success. You've protected the city's infrastructure and proven yourself as a Master Analyst. Level Up!",
            position: { x: 145, y: 50 },
            type: "final"
        }
    ]
};
