// URL routages  

import store from "./Store.js" // store paramètres X12  
import Login, { PREVIOUS_LOCATION } from "../containers/Login.js"
import Bills  from "../containers/Bills.js"
import NewBill from "../containers/NewBill.js"
import Dashboard from "../containers/Dashboard.js"

import BillsUI from "../views/BillsUI.js"
import DashboardUI from "../views/DashboardUI.js"

import { ROUTES, ROUTES_PATH } from "../constants/routes.js"

export default () => {
  const rootDiv = document.getElementById('root')
  rootDiv.innerHTML = ROUTES({ pathname: window.location.pathname }) // ROUTES

  // 1/ onNavigate 
  window.onNavigate = (pathname) => {
    window.history.pushState( // Manipulation de l'historique du navigateur 
      {}, // objet état (événement popstate émis à chaque ouverture d'une page par l'utilisateur)
      pathname, // titre 
      window.location.origin + pathname // URL
    )

    if (pathname === ROUTES_PATH['Login']) { // if Login
      rootDiv.innerHTML = ROUTES({ pathname })
      document.body.style.backgroundColor="#0E5AE5"
      new Login({ document, localStorage, onNavigate, PREVIOUS_LOCATION, store }) // cf. containers Login.js

    } else if (pathname === ROUTES_PATH['Bills']) { // else if Bills
      rootDiv.innerHTML = ROUTES({ pathname, loading: true })
      const divIcon1 = document.getElementById('layout-icon1')
      const divIcon2 = document.getElementById('layout-icon2')
      divIcon1.classList.add('active-icon')
      divIcon2.classList.remove('active-icon')
      const bills = new Bills({ document, onNavigate, store, localStorage  }) // Antoine : nouvelle instance de la classe bills (celle par défaut), pour appeler une des f° proposée dans la classe (Bills.js (default))
      bills.getBills().then(data => { // getBills() : cf. containers Bills.js
        rootDiv.innerHTML = BillsUI({ data })
        const divIcon1 = document.getElementById('layout-icon1')
        const divIcon2 = document.getElementById('layout-icon2')
        divIcon1.classList.add('active-icon')
        divIcon2.classList.remove('active-icon')
        new Bills({ document, onNavigate, store, localStorage }) // cf. containers Bills.js
      }).catch(error => { // catch error on Bills // pas de try ? 
        rootDiv.innerHTML = ROUTES({ pathname, error })
      })

    } else if (pathname === ROUTES_PATH['NewBill']) { // else if NewBill
      rootDiv.innerHTML = ROUTES({ pathname, loading: true })
      new NewBill({ document, onNavigate, store, localStorage }) // cf. containers NewBill.js
      const divIcon1 = document.getElementById('layout-icon1')
      const divIcon2 = document.getElementById('layout-icon2')
      divIcon1.classList.remove('active-icon')
      divIcon2.classList.add('active-icon')

    } else if (pathname === ROUTES_PATH['Dashboard']) { // else if  Dashboard
      rootDiv.innerHTML = ROUTES({ pathname, loading: true })
      const bills = new Dashboard({ document, onNavigate, store, bills: [], localStorage })
      bills.getBillsAllUsers().then(bills => {
          rootDiv.innerHTML = DashboardUI({data: {bills}})
          new Dashboard({document, onNavigate, store, bills, localStorage}) // cf. containers Dashboard.js
        }).catch(error => { // catch error on Dashboard // pas de try ? 
        rootDiv.innerHTML = ROUTES({ pathname, error })
      })
    }
  }
  // 2/ onpopstate
  window.onpopstate = (e) => { // cf. historique (MDN)
    const user = JSON.parse(localStorage.getItem('user')) // méthode JSON.parse, construit valeur ou {}
    if (window.location.pathname === "/" && !user) {
      document.body.style.backgroundColor="#0E5AE5" // bleu 
      rootDiv.innerHTML = ROUTES({ pathname: window.location.pathname })
    }
    else if (user) {
      onNavigate(PREVIOUS_LOCATION)
    }
  }

  // if URL / && #(empty)
  if (window.location.pathname === "/" && window.location.hash === "") { // .hash returns #... of the URL
    new Login({ document, localStorage, onNavigate, PREVIOUS_LOCATION, store })
    document.body.style.backgroundColor="#0E5AE5"

  // # not empty
  } else if (window.location.hash !== "") {
    // #(Bills)
    if (window.location.hash === ROUTES_PATH['Bills']) {
      rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, loading: true })
      const divIcon1 = document.getElementById('layout-icon1')
      const divIcon2 = document.getElementById('layout-icon2')
      divIcon1.classList.add('active-icon')
      divIcon2.classList.remove('active-icon')
      const bills = new Bills({ document, onNavigate, store, localStorage  })
      bills.getBills().then(data => {
        rootDiv.innerHTML = BillsUI({ data })
        const divIcon1 = document.getElementById('layout-icon1')
        const divIcon2 = document.getElementById('layout-icon2')
        divIcon1.classList.add('active-icon')
        divIcon2.classList.remove('active-icon')
        new Bills({ document, onNavigate, store, localStorage })
      }).catch(error => {
        rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, error })
      })
    // #(NewBill)
    } else if (window.location.hash === ROUTES_PATH['NewBill']) {
      rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, loading: true })
      new NewBill({ document, onNavigate, store, localStorage })
      const divIcon1 = document.getElementById('layout-icon1')
      const divIcon2 = document.getElementById('layout-icon2')
      divIcon1.classList.remove('active-icon')
      divIcon2.classList.add('active-icon')
    // #(Dashboard)
    } else if (window.location.hash === ROUTES_PATH['Dashboard']) {
      rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, loading: true })
      const bills = new Dashboard({ document, onNavigate, store, bills: [], localStorage })
      bills.getBillsAllUsers().then(bills => {
        rootDiv.innerHTML = DashboardUI({ data: { bills } })
        new Dashboard({ document, onNavigate, store, bills, localStorage })
      }).catch(error => {
        rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, error })
      })
    }
  }

  return null
}

