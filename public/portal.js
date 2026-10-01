const usernameElement =
  document.querySelector(
    '#username'
  );


const logoutButton =
  document.querySelector(
    '#logout-button'
  );


async function loadUser() {

  const response =
    await fetch(
      '/api/me'
    );


  if (!response.ok) {

    window.location.href =
      '/login.html';

    return;
  }


  const data =
    await response.json();


  usernameElement.textContent =
    data.user.username;

}


logoutButton.addEventListener(
  'click',

  async () => {

    await fetch(
      '/api/logout',
      {
        method:
          'POST'
      }
    );


    window.location.href =
      '/';

  }
);


loadUser();

const httpStatus =
  document.querySelector(
    '#http-status'
  );

const httpsStatus =
  document.querySelector(
    '#https-status'
  );

const nodeStatus =
  document.querySelector(
    '#node-status'
  );

const internalAdminStatus =
  document.querySelector(
    '#internal-admin-status'
  );

const dnsStatus =
  document.querySelector(
    '#dns-status'
  );

const kerberosStatus =
  document.querySelector(
    '#kerberos-status'
  );

const ldapStatus =
  document.querySelector(
    '#ldap-status'
  );

const smbStatus =
  document.querySelector(
    '#smb-status'
  );

const sshSftpStatus =
  document.querySelector(
    '#ssh-sftp-status'
  );


function showServiceStatus(
  element,
  status
) {

  const value =
    status.toUpperCase();

  element.textContent =
    value;

  element.classList.remove(
    'online',
    'offline'
  );

  element.classList.add(
    status === 'online'
      ? 'online'
      : 'offline'
  );
}


async function loadInfrastructure() {

  const elements = [
    httpStatus,
    httpsStatus,
    nodeStatus,
    internalAdminStatus,
    dnsStatus,
    kerberosStatus,
    ldapStatus,
    smbStatus,
    sshSftpStatus
  ];


  try {

    const response =
      await fetch(
        '/api/admin/infrastructure'
      );


    if (!response.ok) {

      throw new Error(
        `HTTP ${response.status}`
      );

    }


    const data =
      await response.json();


    showServiceStatus(
      httpStatus,
      data.web01.http
    );

    showServiceStatus(
      httpsStatus,
      data.web01.https
    );

    showServiceStatus(
      nodeStatus,
      data.web01.node
    );

    showServiceStatus(
      internalAdminStatus,
      data.web01.internalAdmin
    );

    showServiceStatus(
      dnsStatus,
      data.dc1.dns
    );

    showServiceStatus(
      kerberosStatus,
      data.dc1.kerberos
    );

    showServiceStatus(
      ldapStatus,
      data.dc1.ldap
    );

    showServiceStatus(
      smbStatus,
      data.files1.smb
    );

    showServiceStatus(
      sshSftpStatus,
      data.files1.sshSftp
    );

  } catch (error) {

    for (const element of elements) {

      element.textContent =
        'UNAVAILABLE';

      element.classList.remove(
        'online',
        'offline'
      );

    }


    console.error(
      'Infrastructure check failed:',
      error
    );

  }

}


const directoryUserCount =
  document.querySelector(
    '#directory-user-count'
  );

const kerberosSessionCount =
  document.querySelector(
    '#kerberos-session-count'
  );

const eventCount =
  document.querySelector(
    '#event-count'
  );

const directoryUserList =
  document.querySelector(
    '#directory-user-list'
  );

const kerberosSessionList =
  document.querySelector(
    '#kerberos-session-list'
  );

const auditList =
  document.querySelector(
    '#audit-list'
  );

const securityRefresh =
  document.querySelector(
    '#security-refresh'
  );

const securityLastUpdated =
  document.querySelector(
    '#security-last-updated'
  );


function createTicketCard(ticket) {

  const card =
    document.createElement('div');

  card.className =
    'ticket-item';


  const top =
    document.createElement('div');

  top.className =
    'ticket-top';


  const badge =
    document.createElement('span');

  badge.className =
    ticket.type === 'TGT'
      ? 'ticket-badge tgt'
      : 'ticket-badge service';

  badge.textContent =
    ticket.type;


  const state =
    document.createElement('span');

  state.className =
    'ticket-active';

  state.textContent =
    'CACHED';


  top.append(
    badge,
    state
  );


  const service =
    document.createElement('div');

  service.className =
    'ticket-service';

  service.textContent =
    ticket.service;


  const times =
    document.createElement('div');

  times.className =
    'ticket-times';


  const valid =
    document.createElement('span');

  valid.textContent =
    `Valid from: ${ticket.validFrom}`;


  const expires =
    document.createElement('span');

  expires.textContent =
    `Expires: ${ticket.expires}`;


  times.append(
    valid,
    expires
  );


  card.append(
    top,
    service,
    times
  );


  return card;
}


function createDirectoryUser(
  user,
  session
) {

  const item =
    document.createElement('div');

  item.className =
    'directory-user-item';


  const heading =
    document.createElement('div');

  heading.className =
    'directory-user-heading';


  const username =
    document.createElement('strong');

  username.textContent =
    user.username;


  const accountBadge =
    document.createElement('span');

  accountBadge.className =
    user.accountType === 'BUILT_IN'
      ? 'account-badge built-in'
      : 'account-badge user';

  accountBadge.textContent =
    user.accountType === 'BUILT_IN'
      ? 'BUILT-IN'
      : 'USER';


  heading.append(
    username,
    accountBadge
  );


  const details =
    document.createElement('div');

  details.className =
    'directory-status-grid';


  const adStatus =
    document.createElement('div');

  adStatus.innerHTML =
    '<span>AD ACCOUNT</span><strong class="status-good">EXISTS</strong>';


  const kerberosStatus =
    document.createElement('div');


  if (session) {

    kerberosStatus.innerHTML =
      '<span>KERBEROS</span><strong class="status-good">SESSION PRESENT</strong>';

  } else {

    kerberosStatus.innerHTML =
      '<span>KERBEROS</span><strong class="status-muted">NO SESSION</strong>';

  }


  const ticketStatus =
    document.createElement('div');

  ticketStatus.innerHTML =
    `<span>TICKETS</span><strong>${session ? session.tickets.length : 0}</strong>`;


  details.append(
    adStatus,
    kerberosStatus,
    ticketStatus
  );


  item.append(
    heading,
    details
  );


  return item;
}


function createKerberosSession(
  session
) {

  const card =
    document.createElement('div');

  card.className =
    'kerberos-session-item';


  const heading =
    document.createElement('div');

  heading.className =
    'session-heading';


  const principal =
    document.createElement('strong');

  principal.className =
    'session-principal';

  principal.textContent =
    session.principal ||
    session.cache;


  const badge =
    document.createElement('span');

  badge.className =
    'session-badge';

  badge.textContent =
    'SESSION';


  heading.append(
    principal,
    badge
  );


  const count =
    document.createElement('p');

  count.className =
    'session-ticket-count';

  count.textContent =
    `${session.tickets.length} ticket${session.tickets.length === 1 ? '' : 's'}`;


  const tickets =
    document.createElement('div');

  tickets.className =
    'ticket-list';


  if (session.tickets.length === 0) {

    const empty =
      document.createElement('p');

    empty.className =
      'loading-text';

    empty.textContent =
      'No tickets in this cache.';

    tickets.append(empty);

  } else {

    for (
      const ticket
      of session.tickets
    ) {

      tickets.append(
        createTicketCard(ticket)
      );

    }

  }


  card.append(
    heading,
    count,
    tickets
  );


  return card;
}


async function loadIdentityData() {

  try {

    const [
      directoryResponse,
      sessionResponse
    ] =
      await Promise.all([
        fetch(
          '/api/admin/directory-users'
        ),

        fetch(
          '/api/admin/kerberos-sessions'
        )
      ]);


    if (
      !directoryResponse.ok ||
      !sessionResponse.ok
    ) {

      throw new Error(
        'Identity API unavailable'
      );

    }


    const directoryData =
      await directoryResponse.json();

    const sessionData =
      await sessionResponse.json();


    directoryUserCount.textContent =
      directoryData.count;


    kerberosSessionCount.textContent =
      sessionData.sessionCount;


    const sessionsByUser =
      new Map();


    for (
      const session
      of sessionData.sessions
    ) {

      if (
        !session.available ||
        !session.principal
      ) {
        continue;
      }


      const username =
        session.principal
          .split('@')[0]
          .toLowerCase();


      sessionsByUser.set(
        username,
        session
      );

    }


    directoryUserList.replaceChildren();


    for (
      const user
      of directoryData.users
    ) {

      const session =
        sessionsByUser.get(
          user.username.toLowerCase()
        );


      directoryUserList.append(
        createDirectoryUser(
          user,
          session
        )
      );

    }


    kerberosSessionList.replaceChildren();


    const availableSessions =
      sessionData.sessions.filter(
        session =>
          session.available
      );


    if (
      availableSessions.length === 0
    ) {

      const empty =
        document.createElement('p');

      empty.className =
        'loading-text';

      empty.textContent =
        'No Kerberos sessions found.';

      kerberosSessionList.append(
        empty
      );

    } else {

      for (
        const session
        of availableSessions
      ) {

        kerberosSessionList.append(
          createKerberosSession(
            session
          )
        );

      }

    }

  } catch (error) {

    directoryUserCount.textContent =
      '—';

    kerberosSessionCount.textContent =
      '—';

    directoryUserList.textContent =
      'Directory user data unavailable.';

    kerberosSessionList.textContent =
      'Kerberos session data unavailable.';


    console.error(
      'Identity dashboard failed:',
      error
    );

  }

}


function createAuditEvent(log) {

  const item =
    document.createElement('div');

  item.className =
    'audit-item';


  const main =
    document.createElement('div');

  main.className =
    'audit-main';


  const action =
    document.createElement('span');

  action.className =
    log.success
      ? 'audit-action success'
      : 'audit-action failed';

  action.textContent =
    log.action;


  const user =
    document.createElement('span');

  user.className =
    'audit-user';

  user.textContent =
    log.username ||
    'Unknown user';


  main.append(
    action,
    user
  );


  const meta =
    document.createElement('div');

  meta.className =
    'audit-meta';


  const ip =
    document.createElement('span');

  ip.textContent =
    log.ip_address ||
    'No IP';


  const time =
    document.createElement('span');

  time.textContent =
    log.created_at ||
    'Unknown time';


  meta.append(
    ip,
    time
  );


  item.append(
    main,
    meta
  );


  return item;
}


async function loadAuditEvents() {

  try {

    const response =
      await fetch(
        '/api/admin/audit'
      );


    if (!response.ok) {

      throw new Error(
        `HTTP ${response.status}`
      );

    }


    const logs =
      await response.json();


    const visibleLogs =
      logs.slice(0, 8);


    eventCount.textContent =
      logs.length;


    auditList.replaceChildren();


    if (
      visibleLogs.length === 0
    ) {

      const empty =
        document.createElement('p');

      empty.className =
        'loading-text';

      empty.textContent =
        'No security events recorded.';

      auditList.append(
        empty
      );

      return;
    }


    for (
      const log
      of visibleLogs
    ) {

      auditList.append(
        createAuditEvent(log)
      );

    }

  } catch (error) {

    eventCount.textContent =
      '0';

    auditList.textContent =
      'Security event data unavailable.';


    console.error(
      'Audit log check failed:',
      error
    );

  }

}


async function loadSecurityDashboard() {

  securityRefresh.disabled =
    true;

  securityRefresh.textContent =
    'Refreshing...';


  await Promise.all([
    loadIdentityData(),
    loadAuditEvents(),
    loadInfrastructure()
  ]);


  securityLastUpdated.textContent =
    `Last checked: ${new Date().toLocaleString()}`;


  securityRefresh.disabled =
    false;

  securityRefresh.textContent =
    'Refresh';

}


securityRefresh.addEventListener(
  'click',
  loadSecurityDashboard
);


loadSecurityDashboard();
