# AZSAGH Secure Enterprise Lab

## Overview

AZSAGH is a cybersecurity and enterprise infrastructure lab designed to demonstrate how public web services, identity systems, authentication protocols, and internal file services can be separated and secured.

The project combines a public web application with a private enterprise environment using AWS, Active Directory, Kerberos, LDAP, SMB, SSH, SFTP, and modern web security controls.

## Architecture

The lab uses three separate servers:

### WEB01

Public web/application server.

Responsibilities:

- Node.js / Express backend
- Nginx reverse proxy
- HTTPS/TLS
- SQLite application database
- Session management
- Audit logging
- SSH/SFTP administration through AWS Systems Manager

### DC1

Identity and authentication server.

Responsibilities:

- Samba Active Directory Domain Controller
- DNS
- Kerberos
- LDAP

### FILES1

Internal company file server.

Responsibilities:

- SMB file sharing
- Active Directory integration
- Kerberos authentication
- Company shared files

## High-Level Architecture

```text
Internet
   |
   | HTTPS 443
   v
WEB01
   |
   +------> DC1
   |        Active Directory
   |        DNS
   |        Kerberos
   |        LDAP
   |
   +------> FILES1
            SMB
            Company Files
```

## Technologies

- AWS EC2
- AWS Systems Manager
- Ubuntu Server
- Node.js
- Express
- Nginx
- SQLite
- Samba Active Directory
- Kerberos
- LDAP
- SMB
- SSH
- SFTP
- Argon2id
- TLS/HTTPS
- Linux systemd

## Web Security

The application includes:

- Argon2id password hashing
- Server-side sessions
- HttpOnly cookies
- Secure cookies
- SameSite cookie protection
- Rate limiting
- Helmet security headers
- Authentication and authorization
- Audit logging
- Private Node.js listener on localhost
- Nginx reverse proxy
- HTTPS/TLS

Node.js listens only on:

```text
127.0.0.1:3000
```

It is not directly exposed to the Internet.

Public users access the application through Nginx using HTTPS.

## Authentication

Website authentication uses a SQLite database.

Passwords are never stored in plaintext.

They are hashed using Argon2id before being stored.

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

## Active Directory

DC1 provides centralized enterprise identity management.

Examples of directory identities include:

```text
Administrator
Guest
Employee accounts
Service identities
```

Samba provides the Active Directory Domain Controller functionality.

LDAP is used to query directory information.

Kerberos is used to authenticate users and services.

## Kerberos

Kerberos authentication follows this flow:

```text
User
 |
 | Password
 v
Kerberos KDC
 |
 v
TGT
 |
 +------> SMB Service Ticket
 |
 +------> LDAP Service Ticket
```

A TGT proves that the user authenticated to the domain.

A service ticket allows that authenticated identity to authenticate to a specific service.

Example:

```text
cifs/files1.corp.example.com
```

represents a Kerberos ticket for the SMB service on FILES1.

## LDAP

WEB01 can query Active Directory through LDAP using Kerberos/GSSAPI authentication.

LDAP is used to retrieve directory information such as user accounts.

Conceptually:

```text
WEB01
   |
   | LDAP + Kerberos
   v
DC1
   |
   v
Active Directory
```

## SMB File Server

FILES1 provides the internal company share.

Example:

```text
\\files1\company
```

Kerberos authenticates the user.

SMB permissions determine what the user is authorized to do.

Authentication and authorization are separate.

```text
Kerberos
= Who are you?

SMB permissions
= What are you allowed to access?
```

## SSH and SFTP

SSH is used for secure remote administration.

SFTP runs over SSH and is used for secure file transfer.

In this lab, administrative access is routed through AWS Systems Manager rather than exposing SSH directly to the public Internet.

```text
Administrator
     |
     v
AWS Systems Manager
     |
     v
SSH
     |
     v
WEB01
```

## Network Security

Only necessary public services are exposed.

Typical public services:

```text
80  HTTP
443 HTTPS
```

Internal services such as:

```text
22   SSH
88   Kerberos
389  LDAP
445  SMB
3000 Node.js
```

are not intended to be directly exposed to the public Internet.

AWS Security Groups control which systems are allowed to communicate with each service.

## Why Three Servers?

The services are separated for three main reasons:

1. Security  
   Compromising the public web server does not automatically compromise the identity server or company file server.

2. Isolation  
   Each server has its own operating system, permissions, and network controls.

3. Reliability  
   One service can be maintained or restarted without taking down the entire environment.

## Audit Logging

The application records security events such as:

```text
LOGIN_SUCCESS
LOGIN_FAILED
LOGOUT
```

These records are stored in the application database and displayed through the administrative dashboard.

## Security Design Principles

The project demonstrates:

- Least privilege
- Network segmentation
- Defense in depth
- Centralized identity
- Secure authentication
- Password hashing
- Session protection
- Private internal services
- Restricted administrative access
- Audit logging
- Separation of public and internal services

## Project Purpose

This project was created as a practical cybersecurity learning environment.

The goal is to understand how enterprise web applications, identity systems, authentication protocols, networking, and security controls work together in a realistic environment.

## Disclaimer

This repository is intended for educational and lab purposes.

No real credentials, private keys, production secrets, Kerberos credential caches, database files, or AWS account identifiers are included.
