/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom" // modifié 
import userEvent from '@testing-library/user-event'
import mockStore from '../__mocks__/store.js' //
import { localStorageMock } from '../__mocks__/localStorage.js' //
import { ROUTES, ROUTES_PATH } from '../constants/routes.js' //
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from '../views/BillsUI.js' //
import Router from '../app/Router.js' //
import store from '../__mocks__/store.js' //
import Store from "../app/Store.js"; //

jest.mock('../app/store', () => mockStore)


/* 
/// OC 
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
    })
  })
})
 */

// Mock navigation and identify as an employee
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}
// Object.defineProperty(window, : donne de nouvelles valeurs à l'object window
Object.defineProperty(window, 'LocalStorage', {value: localStorageMock}) // répétition 
window.localStorage.setItem('user', JSON.stringify({type: 'Employee'})) // répétition 

// tests

// Test new bill correct display 
describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    beforeEach(() => { // avant les tests de ce describe
      Object.defineProperty(window, 'localStorage', { value: localStorageMock }) // répétition 
      Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } }) // path: '#employee/bill/new'
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' })) // répétition 
      document.body.innerHTML = `<div id="root"></div>`
      Router()      
    })
    test('Then mail icon in vertical layout should be highlighted', () => { // test#6a // SL // OK 
      const icon = screen.getByTestId('icon-mail')
      expect(icon.className).toBe('active-icon')
    })
    test('Then I get a form and can edit a new bill', () => { // test#6b // SL // OK
      const html = NewBillUI({})
      document.body.innerHTML = html
      const contentTitle = screen.getAllByText('Envoyer une note de frais')
      expect(contentTitle).toBeTruthy
    })
  })
})


// Test upload new bill file // f° handleChangeFile()
describe('Given I am on NewBill Page',()=>{
  describe('When I need to upload an image file with the correct extension', ()=>{
    test('Then the file uploads',()=>{ // test#6 ///////////////// // OK ?
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage }) // avant : store: null
      const handleChangeFile = jest.fn(()=> newBill.handleChangeFile) // f° simulée /////////////// jest.fn() : écriture à revoir
      const inputFile = screen.getByTestId('file') // input type = 'file' //////////////
      // queryByTestId when something is not there (getByTestId throw an error if the element is not found)
      // addeventlistener file 
      inputFile.addEventListener('change', handleChangeFile) // change event, pour <input>, <select> ou <textarea> 
      //fire event
      fireEvent.change(inputFile,{ target: { files: [new File(['myTest.png'], 'myTest.png', {type: 'image/png'})] } }) // à revoir 
      expect(handleChangeFile).toHaveBeenCalled() // à revoir 
      expect(inputFile.files[0].name).toBe('myTest.png') // à revoir 
    })
  })
})


// Test create new bill // handleSubmit()
describe('Given I am on NewBill Page',()=>{
  describe("And I submit a valid bill form",()=>{
    test('Then a bill is created', async ()=>{ // test#6d // OK
      document.body.innerHTML = NewBillUI()
      const newBill = new NewBill({ document, onNavigate, store: null, localStorage:window.localStorage }) // store: null 
      //create new bill form
      const handleSubmit = jest.fn(newBill.handleSubmit) // mock f° /////////////// jest.fn() : écriture à revoir
      const newBillForm = screen.getByTestId('form-new-bill') // form
      newBillForm.addEventListener('submit', handleSubmit)
      fireEvent.submit(newBillForm)
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
})

// 
// Test integration PUT // OK 
describe('When I do fill fields in correct format and I click on submit button', () => {
 
  test('fetches update bill API PUT', async () => { // simplifié: put and post create a resource, put used if I name the URL objects
    jest.spyOn(mockStore, 'bills') // jest.spyOn crée une f° simulée (similaire à jest.fn) qui surveille également les appels à objet[methodName] (ici objet mockstore[bills])
    jest.spyOn(console, 'error').mockImplementation(() => {})// Prevent console.error jest error

    Object.defineProperty(window, 'localStorage', { value: localStorageMock }) // Object.defineProperty : nouvelles valeurs à l'objet window
    Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } })

    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
    document.body.innerHTML = `<div id="root"></div>`
    Router()

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    const newBill = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage})
  
    // Submit form
    const form = screen.getByTestId('form-new-bill')
    const handleSubmit = jest.fn((e) => newBill.handleSubmit(e)) ///////////
    form.addEventListener('submit', handleSubmit)

    fireEvent.submit(form)
    await new Promise(process.nextTick) /////////////////////////
    expect(console.error).not.toBeCalled() /////////////////////////
  })
  
  test('fetches error from an API and fails with 500 error', async () => { // 500 : erreur interne du serveur
    jest.spyOn(mockStore, 'bills')
    jest.spyOn(console, 'error').mockImplementation(() => {})// Prevent Console.error jest error

    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } })

    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
    document.body.innerHTML = `<div id="root"></div>`
    Router()

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }

    mockStore.bills.mockImplementationOnce(() => {
      return {
        update : jest.fn().mockRejectedValueOnce(false)
      }
    })
    const newBill = new NewBill({document,  onNavigate, store: mockStore, localStorage: window.localStorage})
  
    // Submit form
    const form = screen.getByTestId('form-new-bill')
    const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
    form.addEventListener('submit', handleSubmit)

    
    fireEvent.submit(form)
    await new Promise(process.nextTick)
    expect(console.error).toBeCalled()
  })
})  