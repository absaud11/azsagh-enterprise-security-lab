const serviceGrid =
  document.querySelector(
    '#service-grid'
  );


async function loadServices() {

  try {

    const response =
      await fetch(
        '/api/services'
      );


    if (!response.ok) {
      throw new Error(
        'Request failed'
      );
    }


    const services =
      await response.json();


    serviceGrid.innerHTML =
      services
        .map(
          service => `

            <article class="card">

              <h3>
                ${service.name}
              </h3>

              <p>
                ${service.purpose}
              </p>

            </article>

          `
        )
        .join('');

  } catch {

    serviceGrid.textContent =
      'Services temporarily unavailable.';

  }

}


loadServices();