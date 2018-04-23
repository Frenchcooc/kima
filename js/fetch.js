/**
 *
 * Helpers for "fetch" function
 *
 * See more on fetch: https://developer.mozilla.org/docs/Web/API/Fetch_API/Using_Fetch
 *
 */

function fetchLogResult(result) {
  console.log(result);
}

function fetchLogError(error)
{
  console.log('There was an unsupported problem: \n', error);
}

function fetchReadResponseAsJSON(response) {
  return response.json();
}

function handleFetchErrors (response)
{
  if (!response.ok)
  {
    var err = new Error();
        err.response = response;
    throw err;
  }
  return response;
}

function fetchJSON(pathToResource, successCallback, errCallback)
{
  return fetch(pathToResource)
  .then(handleFetchErrors)
  .then(fetchReadResponseAsJSON)
  .then(successCallback ? successCallback : fetchLogResult)
  .catch(errCallback ? function(e) { errCallback(e, e.response); } : fetchLogError);
}
