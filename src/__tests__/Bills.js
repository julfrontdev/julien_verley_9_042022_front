/**
 * @jest-environment jsdom
 */

import {fireEvent,screen,waitFor} from "@testing-library/dom" //
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";
import {ROUTES} from '../constants/routes'
import BillsContainer from '../containers/Bills' //
import store from '../__mocks__/store.js';

jest.mock("../app/store", () => mockStore)

// tests#5 

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    // #5a : Ajout de la mention "expect"
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // Test d'intégration : on crée un faux dom
      // Object.defineProperty(window, : donne de nouvelles valeurs à l'objet window
      Object.defineProperty(window, "localStorage", { value: localStorageMock,}); // non modifié 
      Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH["Bills"] },}); // ajoutée // Bills = '#employee/bills'
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" })); // non modifié
      document.body.innerHTML = `<div id="root"></div>`; // modifié en template literal
      router();
      // window.onNavigate(ROUTES_PATH.Bills) // supprimé
      // await waitFor(() => screen.getByTestId('icon-window')) // supprimé
      const windowIcon = screen.getByTestId("icon-window"); // ByTestId find by data-testid attribute
      // icone testée // icon-email (test casse OK)
      expect(windowIcon.className).toBe("active-icon"); // OK
    });

    // Ne pas toucher
    test("Then bills should be ordered from earliest to latest", () => {
      // Test d'intégration : on crée un faux dom
      document.body.innerHTML = BillsUI({ data: bills }); 
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono); // revoir [...dates] //////////
      expect(dates).toEqual(datesSorted);
    });
  });


  // #5b tests unitaires Bills : 
  describe("Given I am connected as an employee", () => {

    test("When I have no store, then I get no bills", () => { // test#5b1 OK
      const bills = new Bills({ store: null, document }); // déclaration de store: null (position ne compte pas)
      expect(bills.getBills()).toBe(undefined);
    });

    test("When I have store, then I get bills and list of bills", async () => { // test#5b2 OK
      const bills = new Bills({ store: mockStore, document }); // Pourquoi store puis document ? /////
      const billsRetrieved = await bills.getBills();
      expect(billsRetrieved.length).toBe(4);
    });
  });

 
  describe('Given I am connected as an employee', () => {
    describe('When I navigate on Bills page and I click on new bill button', () => {
  
      test('Then opens a modal form', () => { // test#5b3 OK 
        const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname })} 
        // vérifie que je suis sur le bon "lien" (pathname http://127.0.0.1:8080/   #employee/bill/new   )
        Object.defineProperty(window, 'localStorage', { value: localStorageMock }) 
        // utilise le mock de Jest dans le localstorage (base de donnée éphémère dans le navigateur)
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' })) 
        // stocke dans le localstorage le type d'utilisateur user : employee (converted in JSON)
        document.body.innerHTML = BillsUI({ data: bills }) 
        // affichage des bills
        const bill = new Bills({ document, onNavigate, store: null, bills, localStorage: window.localStorage }) // 
        $.fn.modal = jest.fn() // jest.fn() = mock function (en principe renvoie undefined)
        // $ = document.queryselector...
        // test de la f° de la modale ?  
      
        // fonction dans Bills.js
        const handleClickNewBill = jest.fn((e) => bill.handleClickNewBill) // f° simulée /////////////////// jest.fn() : écriture à revoir
  
        // fire event
        const iconNewBill = screen.getByTestId('btn-new-bill')
        iconNewBill.addEventListener('click', handleClickNewBill) 
        fireEvent.click(iconNewBill)
        expect(handleClickNewBill).toHaveBeenCalled()
  
        const modal = screen.getAllByTestId('form-new-bill')
        expect(modal).toBeTruthy()
      })
    })
  })
});

// #5c : test d'intégration GET Bills
describe('Given I am connected as an employee',()=>{
  describe('When I navigate on Bills page',()=>{

    // Test de l'UI ?  
    test("Then fetches bills from mock API GET", async () => { // test#5c1 OK
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@b" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills) 
    
      //const contentHeader = await screen.getByText("Mes notes de frais") // manquait l'asynchrone 
      const contentHeader = await waitFor(() => screen.getByText("Mes notes de frais")) 
      // ByText find by element text content
      // waitFor gère l'asynchrone de getByText qui est une promise
      // callback : (() => screen.getByText("Mes notes de frais"))
      expect(contentHeader).toBeTruthy()
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy()
    })

    describe("When an error occurs on API", () => { 
     beforeEach(() => { // runs before each test
       jest.spyOn(store, "bills") // jest.spyOne(object, methodName)
       Object.defineProperty(window, 'localStorage', { value: localStorageMock })
       window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: "a@b" }))
       const root = document.createElement("div")
       root.setAttribute("id", "root")
       document.body.appendChild(root)
       router()
     })
     
     // test#5c2
     test("Then fetches bills from an API and fails with 404 message error", async () => { // 404 : source introuvable  
       mockStore.bills.mockImplementationOnce(() => { // store ?
         return {
           list : () =>  {
             return Promise.reject(new Error("Erreur 404"))
           }
         }})

         window.onNavigate(ROUTES_PATH.Bills)
         await new Promise(process.nextTick)
         const message = await waitFor(() => screen.getByText(/Erreur 404/))
         expect(message).toBeTruthy()
     })
 
     // test#5c3
     test("Then fetches messages from an API and fails with 500 message error", async () => { // 500 : erreur interne du serveur
       mockStore.bills.mockImplementationOnce(() => { // store ?
         return {
           list : () =>  {
             return Promise.reject(new Error("Erreur 500"))
           }
         }})
 
         window.onNavigate(ROUTES_PATH.Bills)
         await new Promise(process.nextTick)
         const message = await waitFor(() => screen.getByText(/Erreur 500/))
         expect(message).toBeTruthy()
     })
   })
  })
})


/*
const test = ({ firstName, lastName }) => { // destructuration d'objet
  console.log(firstName, lastName);
};

const julien = { firstName: 'Julien', lastName: 'Verley' };
test(julien);

const { firstName, lastName } = julien; // affectation par décomposition.
*/