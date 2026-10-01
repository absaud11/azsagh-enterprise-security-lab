const form =
  document.querySelector(
    '#login-form'
  );


const message =
  document.querySelector(
    '#login-message'
  );


form.addEventListener(
  'submit',

  async event => {

    event.preventDefault();


    message.textContent =
      'Signing in...';


    const username =
      document
        .querySelector(
          '#username'
        )
        .value
        .trim();


    const password =
      document
        .querySelector(
          '#password'
        )
        .value;


    try {

      const response =
        await fetch(
          '/api/login',
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body:
              JSON.stringify({
                username,
                password
              })
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        message.textContent =
          data.error ||
          'Login failed.';

        return;
      }


      window.location.href =
        '/portal';

    } catch {

      message.textContent =
        'Could not contact server.';

    }

  }
);