/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

// Bills.js, for employees

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    // #5a : Ajout de la mention "expect"
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      }); // non modifié
      Object.defineProperty(window, "location", {
        value: { hash: ROUTES_PATH["Bills"] },
      }); // ajoutée // ??
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" })); // non modifié
      document.body.innerHTML = `<div id="root"></div>`; // modifié en template literal
      router();
      // window.onNavigate(ROUTES_PATH.Bills) // supprimé
      // await waitFor(() => screen.getByTestId('icon-window')) // supprimé
      const windowIcon = screen.getByTestId("icon-window"); // icone à tester
      expect(windowIcon.className).toBe("active-icon"); // OK
    });

    // Ne pas toucher
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });

  // #5b : Couvrir un max de "statements" 80%
  // describe(When...)
});
