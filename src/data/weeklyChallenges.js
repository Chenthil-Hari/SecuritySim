// Represents the single active weekly challenge
const weeklyChallenge = {
    id: 'week_42_2026',
    title: 'Operation: Midnight Sun',
    category: 'Incident Response',
    difficulty: 4, // Very hard
    timeLimit: 120, // 2 minutes
    xpReward: 1500, // Massive XP bounty
    badgeReward: 'midnight_operator',
    description: 'A state-sponsored threat actor is actively exfiltrating data from our cloud environment. You have 2 minutes to identify the compromised container and isolate it before the entire database is leaked.',
    icon: 'Target',
    steps: [
        {
            prompt: 'CloudWatch alerts show a sudden 500% spike in outbound traffic from the EKS cluster. What is your first action?',
            visualType: 'decision',
            options: [
                {
                    text: 'Shut down the entire Kubernetes cluster immediately to stop the leak.',
                    isCorrect: false,
                    feedback: 'DANGER: Shutting down the entire cluster causes a massive outage for all customers and destroys volatile memory needed for forensics.',
                    defenseTip: 'Containment should be targeted, not destructive.'
                },
                {
                    text: 'Query the VPC Flow Logs to identify which specific Pod/Node is sending the traffic.',
                    isCorrect: true,
                    feedback: 'Excellent. You narrowed the malicious traffic down to a single pod: `payment-processing-pod-8f4b`.',
                    defenseTip: 'Always use logs to narrow the scope of an incident before taking action.'
                }
            ]
        },
        {
            prompt: 'You identified the compromised pod (`payment-processing-pod-8f4b`). How do you contain it?',
            visualType: 'decision',
            options: [
                {
                    text: 'Run `kubectl delete pod payment-processing-pod-8f4b`.',
                    isCorrect: false,
                    feedback: 'Kubernetes ReplicaSets will just instantly spin up a new pod to replace it, and the attacker will likely resume the attack.',
                    defenseTip: 'Deleting a pod does not fix the vulnerability or permanently isolate it in a managed cluster.'
                },
                {
                    text: 'Apply a Kubernetes NetworkPolicy to deny all ingress/egress traffic to the pod.',
                    isCorrect: true,
                    feedback: 'Perfect! You have network-isolated the container. It can no longer exfiltrate data, but it remains running so the forensic team can dump its memory.',
                    defenseTip: 'Network isolation (quarantine) is the gold standard for container incident response.'
                }
            ]
        }
    ]
};

export default weeklyChallenge;
