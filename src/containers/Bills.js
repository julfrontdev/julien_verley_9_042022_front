// Bills

import { ROUTES_PATH } from "../constants/routes.js";
import { formatDate, formatStatus } from "../app/format.js";
import Logout from "./Logout.js";

export default class {
  constructor({ document, onNavigate, store, localStorage }) { // Bills
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const buttonNewBill = document.querySelector(
      `button[data-testid="btn-new-bill"]`
    ); //
    if (buttonNewBill)
      buttonNewBill.addEventListener("click", this.handleClickNewBill); // click
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
    if (iconEye)
      iconEye.forEach((icon) => {
        icon.addEventListener("click", () => this.handleClickIconEye(icon)); // click
      });
    new Logout({ document, localStorage, onNavigate });
  }

  // click new bill event
  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH["NewBill"]); // test#5b3
  };

  // click icon eye event
  handleClickIconEye = (icon) => { // non testée => test d'intégration : simuler un click sur l'oeil
    const billUrl = icon.getAttribute("data-bill-url");
    const imgWidth = Math.floor($("#modaleFile").width() * 0.5); // .width() ... : méthodes JQuery ?
    $("#modaleFile")
      .find(".modal-body")
      .html(
        `<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`
      );
    $("#modaleFile").modal("show");
  };

  getBills = () => {
    // F° à tester #5
    if (this.store) { //test#5b1
      return this.store
        .bills() // fonction ?
        .list() // fonction ?
        .then((snapshot) => {
          const bills = snapshot
            .sort((a, b) => new Date(a.date) - new Date(b.date)) // Bug #1 ligne ajoutée .sort
            .map((doc) => {
              try {
                // try...catch
                return {
                  ...doc,
                  date: formatDate(doc.date), // à mocker avec f° mockImplementation (de Jest), ça doit casser, par ex "throw new error"
                  status: formatStatus(doc.status),
                };
              } catch (e) { // non testée, faire casser le try
                // if for some reason, corrupted data was introduced, we manage here failing formatDate function
                // log the error and return unformatted date in that case
                // console.log(e, "for", doc); // d'origine
                return {
                  ...doc,
                  date: doc.date,
                  status: formatStatus(doc.status),
                };
              }
            });
          //console.log("length", bills.length); // d'origine
          return bills;
        });
    }
  };
}