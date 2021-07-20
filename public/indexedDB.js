const request = window.indexedDB.open("OfflineBudget", 1);

let db;

request.onupgradeneeded = ({ target }) => {
    const db = target.result;
    const objectStore = db.createObjectStore("transactions", {
        autoIncrement: true,
        keyPath: "id",
    });
};

request.onsuccess = (req) => {
    db = req.target.result
    if (navigator.onLine) {
        saveData();
    }
};

function saveRecord(data) {
    const transaction = db.transaction(["transactions"], "readwrite");
    const transactionStore = transaction.objectStore("transactions");
    // Adds data to our objectStore
    transactionStore.add(data);
}

// gets index db data & sends data to online server
function saveData() {
    const transaction = db.transaction(["transactions"], "readwrite");
    const transactionStore = transaction.objectStore("transactions");
    const allData = transactionStore.getAll();

    allData.onsuccess = () => {
        if (allData.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(allData.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                },
            })
                .then((response) => {
                    return response.json();
                })
                .then(() => {
                    const transaction = db.transaction(
                        ["transactions"],
                        "readwrite"
                    );
                    const transactionStore =
                        transaction.objectStore("transactions");
                    transactionStore.clear();
                });
        }
    };
}

window.addEventListener("online", saveData);
