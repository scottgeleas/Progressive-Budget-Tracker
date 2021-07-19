const request = window.indexedDB.open("OfflineBudget", 1);

request.onsuccess = event => {
    console.log(request.result.name);
};

request.onupgradeneeded = ({ target }) => {
    const db = target.result;
    const objectStore = db.createObjectStore("transactions");
};

request.onsuccess = () => {
    saveData()
};

function saveRecord(data) {
    const db = request.result;
    const transaction = db.transaction(["transactions"], "readwrite");
    const transactionStore = transaction.objectStore("transactions");
    console.log(data)
    // Adds data to our objectStore
    transactionStore.add(data);
};

function saveData() {
    const db = request.result;
    const transaction = db.transaction(["transactions"], "readwrite");
    const transactionStore = transaction.objectStore("transactions");
    const allData = transactionStore.getAll();

    allData.onsuccess = () => {
        console.log(allData)
        if (allData.result.length > 0) {
        fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(allData),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            }).then(response => {
                return response.json();
            })
            .then(data => {
                const db = request.result;
                const transaction = db.transaction(["transactions"], "readwrite");
                const transactionStore = transaction.objectStore("transactions");
                transactionStore.clear();
            });
        }
    };
};

window.addEventListener("online", saveData)