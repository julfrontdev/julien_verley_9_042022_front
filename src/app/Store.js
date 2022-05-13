// Store 

const jsonOrThrowIfError = async (response) => { // async (transforme (le return de) la fonction en promesse)
  if(!response.ok) throw new Error((await response.json()).message) // await (permet d'attendre le résultat de la promesse)
  return response.json()
}

// Api
class Api { // jsonOrThrowIfError
  constructor({baseUrl}) {
    this.baseUrl = baseUrl;
  }
  async get({url, headers}) { // url ? headers ?
    return jsonOrThrowIfError(await fetch(`${this.baseUrl}${url}`, {headers, method: 'GET'})) // fetch
  }
  async post({url, data, headers}) {
    return jsonOrThrowIfError(await fetch(`${this.baseUrl}${url}`, {headers, method: 'POST', body: data})) // post : pour créer 
  }
  async delete({url, headers}) {
    return jsonOrThrowIfError(await fetch(`${this.baseUrl}${url}`, {headers, method: 'DELETE'}))
  }
  async patch({url, data, headers}) {
    return jsonOrThrowIfError(await fetch(`${this.baseUrl}${url}`, {headers, method: 'PATCH', body: data})) // patch : pour màj modifier corriger
  }
}

// getHeaders //////////////////////////////////
const getHeaders = (headers) => { // getHeaders : cryptage etc. 
  const h = { }
  if (!headers.noContentType) h['Content-Type'] = 'application/json'
  const jwt = localStorage.getItem('jwt')
  if (jwt && !headers.noAuthorization) h['Authorization'] = `Bearer ${jwt}` // récupération du token crypté
  return {...h, ...headers}
}

// ApiEntity
class ApiEntity { // constructor initialise un objet (permet de construire un objet)
  constructor({key, api}) { // ? objet {key, api} ?
    this.key = key; // this.key prend la valeur de key (passé en paramètre)
    this.api = api; // this.api prend la valeur de api (passé en paramètre)
  }
  // ApiEntity.select
  async select({selector, headers = {}}) { // headers : partie invisible de la requête (informations cryptées, network, géolocalisation etc.), body : parties visibles du site 
    return await (this.api.get({url: `/${this.key}/${selector}`, headers: getHeaders(headers)}))
    // ? Que sont key ? selector ? headers ?
  }
  // ApiEntity.list
  async list({headers = {}} = {}) {
    return await (this.api.get({url: `/${this.key}`, headers: getHeaders(headers)}))
  }
  // ApiEntity.update
  async update({data, selector, headers = {}}) {
    return await (this.api.patch({url: `/${this.key}/${selector}`, headers: getHeaders(headers), data}))
    // ? Que sont key ? selector ? headers ? data ?
  }
  // ApiEntity.create
  async create({data, headers = {}}) {
    return await (this.api.post({url: `/${this.key}`, headers: getHeaders(headers), data}))
  }
  // ApiEntity.delete
  async delete({selector, headers = {}}) {
    return await (this.api.delete({url: `/${this.key}/${selector}`, headers: getHeaders(headers)}))
  }
}

// Store
class Store {
  constructor() {
    this.api = new Api({baseUrl: 'http://localhost:5678'}) 
    // Cf. back : L'API est accessible sur le port `5678` en local, c'est à dire `http://localhost:5678`
  }

  user = uid => (new ApiEntity({key: 'users', api: this.api})).select({selector: uid}) // uid = unique id 
  users = () => new ApiEntity({key: 'users', api: this.api})
  login = (data) => this.api.post({url: '/auth/login', data, headers: getHeaders({noAuthorization: true})})

  ref = (path) => this.store.doc(path)

  bill = bid => (new ApiEntity({key: 'bills', api: this.api})).select({selector: bid})
  bills = () => new ApiEntity({key: 'bills', api: this.api})
}

export default new Store()