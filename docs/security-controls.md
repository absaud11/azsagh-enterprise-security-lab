# AZSAGH Security Controls

## Overview

AZSAGH applies multiple security controls across the web application, AWS infrastructure, authentication systems, and internal services.

The project follows a defense-in-depth approach rather than relying on one security mechanism.

---

## 1. Network Exposure

Only required web services are intended to be publicly reachable.

```text
80   HTTP
443  HTTPS
```

Services such as SSH, Kerberos, LDAP, SMB, and Node.js are not intended to be directly exposed to the public Internet.

AWS Security Groups restrict communication between systems.

This reduces the external attack surface.

---

## 2. Private Node.js Backend

The Node.js application listens on:

```text
127.0.0.1:3000
```

This means it accepts direct connections only from WEB01 itself.

Nginx communicates with Node.js locally.

```text
Internet
   |
   | HTTPS
   v
Nginx
   |
   | localhost:3000
   v
Node.js
```

External users cannot directly connect to Node.js port 3000.

---

## 3. HTTPS / TLS

Public web traffic is protected using HTTPS.

TLS provides:

- Encryption
- Server authentication
- Integrity protection

Users access the application through:

```text
HTTPS :443
```

Nginx handles the public TLS connection before forwarding requests to the local Node.js application.

---

## 4. Password Hashing

Website passwords are not stored in plaintext.

The application uses:

```text
Argon2id
```

Conceptually:

```text
Password
   |
   v
Argon2id
   |
   v
Password Hash
   |
   v
SQLite
```

During login, the submitted password is verified against the stored Argon2id hash.

The original password is not decrypted from the database.

---

## 5. Session Security

The application uses server-side sessions.

Session cookies are configured with security properties including:

```text
HttpOnly
Secure
SameSite
```

### HttpOnly

Prevents normal browser JavaScript from reading the session cookie.

### Secure

The cookie is transmitted only through HTTPS.

### SameSite

Helps reduce cross-site request attacks by controlling when the browser sends the cookie.

---

## 6. Authentication and Authorization

Authentication determines who the user is.

Authorization determines what that authenticated user is allowed to access.

The web application separates normal employee access from administrative functions.

Protected endpoints require a valid authenticated session.

Administrative endpoints additionally require the appropriate role.

---

## 7. Rate Limiting

Login requests are rate limited.

This reduces the effectiveness of repeated automated password attempts.

Rate limiting is one layer of protection and does not replace strong passwords or secure authentication.

---

## 8. HTTP Security Headers

The application uses Helmet to apply HTTP security headers.

These headers help protect against several common browser-based security risks.

---

## 9. Active Directory

Enterprise identities are centrally stored on DC1 using Samba Active Directory.

This avoids requiring every internal service to maintain a separate copy of employee identities.

Active Directory provides centralized:

- Users
- Groups
- Identity information
- Authentication integration

---

## 10. Kerberos Authentication

Kerberos is used for enterprise authentication.

A user first authenticates and receives a Ticket Granting Ticket.

```text
User
 ↓
Kerberos
 ↓
TGT
```

The TGT can then be used to obtain service-specific tickets.

Examples:

```text
cifs/files1.corp.azsagh.com
ldap/dc1.corp.azsagh.com
```

Kerberos allows services to authenticate users without requiring the user's password to be repeatedly sent to each service.

---

## 11. LDAP Directory Queries

LDAP is used to query Active Directory information.

LDAP queries can use Kerberos/GSSAPI authentication.

```text
WEB01
   |
   | Kerberos-authenticated LDAP
   v
DC1
   |
   v
Active Directory
```

The application can retrieve directory information without maintaining another copy of enterprise identities.

---

## 12. SMB Authorization

FILES1 provides the internal company SMB share.

Kerberos confirms the user's identity.

SMB permissions determine what that identity may access.

```text
Kerberos
= Who are you?

SMB permissions
= What may you access?
```

Possessing a CIFS Kerberos ticket does not automatically grant permission to every file.

---

## 13. Administrative Access

AWS Systems Manager is used for server administration.

This reduces the need for publicly exposed SSH access.

```text
Administrator
 ↓
AWS authentication
 ↓
Systems Manager
 ↓
EC2
```

SSH and SFTP may operate through this controlled management path.

---

## 14. SFTP

SFTP runs over SSH.

It is used for secure file transfer during administration and deployment.

```text
SFTP
 ↓
SSH
 ↓
Secure administrative connection
```

SFTP is separate from SMB.

- **SFTP** is primarily used for administrative file transfer.
- **SMB** provides shared enterprise file access.

---

## 15. Server Separation

The environment uses separate servers for:

- Public web services
- Identity services
- File services

This provides an additional isolation boundary.

If WEB01 is compromised, the attacker does not automatically gain operating-system-level access to DC1 or FILES1.

Additional network and authentication controls must still be bypassed.

---

## 16. Audit Logging

The application records security-relevant events such as:

```text
LOGIN_SUCCESS
LOGIN_FAILED
LOGOUT
```

Audit records provide visibility into authentication and portal activity.

---

## 17. Secret Management

Sensitive runtime information is excluded from the public repository.

Examples include:

```text
.env
database files
session databases
SSH private keys
Kerberos credential caches
AWS credentials
```

The public repository contains:

```text
.env.example
```

with placeholder values only.

---

## 18. Repository Protection

The `.gitignore` prevents sensitive runtime files from being committed.

Examples include:

```text
.env
*.db
*.sqlite
*.pem
*.key
*.ccache
node_modules/
```

The repository was also checked for common AWS credentials and private-key patterns before publication.

---

## Security Model Summary

AZSAGH uses multiple layers:

```text
Internet
   |
   v
AWS Security Groups
   |
   v
Nginx + TLS
   |
   v
Application Authentication
   |
   v
Authorization
   |
   v
Internal Services
   |
   +--> Active Directory
   +--> Kerberos
   +--> LDAP
   +--> SMB
```

No single control is expected to provide complete protection.

The project demonstrates defense in depth by combining network, operating-system, application, authentication, and authorization controls.

---

## Scope

AZSAGH is an educational cybersecurity lab.

It demonstrates security architecture and enterprise protocols but is not presented as a production-ready enterprise platform.
