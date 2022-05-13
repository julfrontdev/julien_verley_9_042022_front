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

// test #1 
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock,}); 
      Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH["Bills"] },}); // added
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" })); 
      document.body.innerHTML = `<div id="root"></div>`; 
      router();
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon.className).toBe("active-icon"); // added
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills }); 
      const dates = screen
        .getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono); 
      expect(dates).toEqual(datesSorted);
    });
  });


  // tests #2
  describe("Given I am connected as an employee", () => {

    test("When I have no store, then I get no bills", () => { 
      const bills = new Bills({ store: null, document }); 
      expect(bills.getBills()).toBe(undefined);
    });

    test("When I have store, then I get bills and list of bills", async () => { 
      const bills = new Bills({ store: mockStore, document }); 
      const billsRetrieved = await bills.getBills();
      expect(billsRetrieved.length).toBe(4);
    });
  });

 // tests #3
  describe('Given I am connected as an employee', () => {
    describe('When I navigate on Bills page and I click on new bill button', () => {
  
      test('Then opens a modal form', () => { 
        const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname })} 
        Object.defineProperty(window, 'localStorage', { value: localStorageMock }) 
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' })) 
        document.body.innerHTML = BillsUI({ data: bills }) 
        const bill = new Bills({ document, onNavigate, store: null, bills, localStorage: window.localStorage })
        $.fn.modal = jest.fn()  
        const handleClickNewBill = jest.fn((e) => bill.handleClickNewBill) 
        // fire event
        const iconNewBill = screen.getByTestId('btn-new-bill')
        iconNewBill.addEventListener('click', handleClickNewBill) 
        fireEvent.click(iconNewBill)
        expect(handleClickNewBill).toHaveBeenCalled() //
        const modal = screen.getAllByTestId('form-new-bill')
        expect(modal).toBeTruthy() // 
      })
    })
  })
});

// GET Bills integration tests
describe('Given I am connected as an employee',()=>{
  describe('When I navigate on Bills page',()=>{

    // Integration test #1
    test("Then fetches bills from mock API GET", async () => { 
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@b" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills) 
      const contentHeader = await waitFor(() => screen.getByText("Mes notes de frais")) 
      expect(contentHeader).toBeTruthy()
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy()
    })

    // Integration tests #2 #3 
    describe("When an error occurs on API", () => { 
      beforeEach(() => {
        jest.spyOn(store, "bills")
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: "a@b" }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })
      
      // Integration test #2
      test("Then fetches bills from an API and fails with 404 message error", async () => { 
        mockStore.bills.mockImplementationOnce(() => {
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
  
      // Integration test #3
      test("Then fetches messages from an API and fails with 500 message error", async () => { 
        mockStore.bills.mockImplementationOnce(() => { 
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