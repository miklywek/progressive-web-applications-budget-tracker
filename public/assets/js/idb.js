let db;

const request = indexedDB.open("budget", 1);
request.onupgradeneeded = function (event) {
  // save a reference to the database
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};
// upon a successful
request.onsuccess = function (event) {
  // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
  db = event.target.result;

  // check if app is online, if yes run uploadPizza() function to send all local db data to api
  if (navigator.onLine) {
    // we haven't created this yet, but we will soon, so let's comment it out for now
    checkDatabase();
  }
};

request.onerror = function (event) {
  // log error here
  console.log(event.target.errorCode);
};

// This function will be executed if we attempt to submit a new budget and there's no internet connection
function saveRecord(record) {
  // open a new transaction with the database with read and write permissions
  const transaction = db.transaction(["pending"], "readwrite");

  // access the object store for `new_pizza`
  const store = transaction.objectStore("pending");

  // add record to your store with add method
  pending.add(record);
}

function checkDatabase() {
  // open a transaction on your db
  const transaction = db.transaction(["pending"], "readwrite");

  // access your object store
  const pizzaObjectStore = transaction.objectStore("store");

  // get all records from store and set to a variable
  const getAll = store.getAll();

  // more to come...
  // upon a successful .getAll() execution, run this function
  getAll.onsuccess = function () {
    // if there was data in indexedDb's store, let's send it to the api server
    if (getAll.result.length > 0) {
      fetch("/api/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = db.transaction("pending", "readwrite");
          const store = transaction.objectStore("pending");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

window.addEventListener("online", checkDatabase);
