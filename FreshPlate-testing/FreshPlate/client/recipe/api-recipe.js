const create = async (credentials, recipe) => {
  try {
    let response = await fetch('/api/recipes/', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + credentials.t
      },
      body: recipe
    });
    const data = await response.json();
    console.log('Server response:', data);
    return data;
  } catch (err) {
    console.error('Error creating recipe:', err);
    throw err;
  }
};

const list = async (credentials) => {
  try {
    let response = await fetch('/api/recipes/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + credentials.t
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error('Error fetching recipes:', err);
    throw err;
  }
};

const read = async (params, credentials) => {
  try {
    let response = await fetch('/api/recipes/' + params.recipeId, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + credentials.t
      }
    })
    return await response.json()
  } catch (err) {
    console.log(err)
  }
}

const update = async (params, credentials, recipe) => {
  try {
    let response = await fetch('/api/recipes/' + params.recipeId, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + credentials.t
      },
      body: recipe

    })
    return await response.json()
  } catch (err) {
    console.log(err)
  }
}

const remove = async (params, credentials) => {
  try {
    let response = await fetch('/api/recipes/' + params.recipeId, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + credentials.t
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error('Error deleting recipe:', err);
    throw err;
  }
};

export { create, list, read, update, remove }