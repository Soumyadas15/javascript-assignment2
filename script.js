// ============== Classes ==============


/** Employee class **/

class Employee {
  constructor(employeeId, name, address, role) {
    this.employeeId = employeeId;
    this.name = name;
    this.address = address;
    this.role = role;
  }

  updateDetails(name, address, role) {
    this.name = name;
    this.address = address;
    this.role = role;
  }

  getCardHTML() {
    return `
      <div class="card bg-neutral-300 w-full h-[6rem] rounded-lg mb-3 p-6 flex justify-between">
        <div class="w-[50%]">
          <div class="flex items-center gap-2">
            <p id="card-employeeId">${this.employeeId}</p>
            <p class="font-bold">${this.name}</p>
            <p> | </p>
            <p id="card-role" class="">${this.role}</p>
          </div>
          <p id="card-address" class="text-sm text-neutral-500">${this.address}</p>
        </div>
        <div class="w-[20%] flex items-center justify-center gap-2">
          <button id="editBtn" class="bg-blue-500 hover:opacity-75 text-white font-bold py-2 px-4 rounded self-end">Edit</button>
          <button id="deleteBtn" class="bg-red-500 hover:opacity-75 text-white font-bold py-2 px-4 rounded self-end">Delete</button>
        </div>
      </div>
    `;
  }
}


/* 
 
  Opting for a Prefix Tree instead of a simple Array because of it's efficiency and redundance avoidance.
  Time complexity to search employees = O(N * avg(K))
  Where N is the number of employees and K is the average length of an employee name.

*/

class TrieNode {
    constructor() {
        this.children = {};
        this.isEndOfWord = false;
    }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  // Tuntion to add to the tree

  update(word) {
    let current = this.root;
    for (const char of word) {
      if (!current.children[char]) {
        current.children[char] = new TrieNode();
      }
      current = current.children[char];
    }
    current.isEndOfWord = true;
  }

  // Function to dynamically search for employee names

  query(prefix) {
    let current = this.root;
    for (const char of prefix) {
      if (!current.children[char]) {
        return [];
      }
      current = current.children[char];
    }
    return this.findWords(current, prefix);
  }

  findWords(node, prefix, words = []) {
    if (node.isEndOfWord) {
      words.push(prefix);
    }
    for (const char in node.children) {
      this.findWords(node.children[char], prefix + char, words);
    }
    return words;
  }

  // Function to delete an employee

  delete(word) {
    this.deleteNode(this.root, word, 0);
  }

  deleteNode(node, word, index) {
    if (index === word.length) {
      if (node.isEndOfWord) {
        node.isEndOfWord = false;
        return Object.keys(node.children).length === 0;
      }
      return false;
    }

    const char = word[index];
    if (node.children[char]) {
      const shouldDeleteChild = this.deleteNode(
        node.children[char],
        word,
        index + 1
      );
      if (shouldDeleteChild) {
        delete node.children[char];
        return Object.keys(node.children).length === 0;
      }
    }
    return false;
  }
}








// ============== Global Variables ==============

const employeeTrie = new Trie();
const employees = [];







// ============== DOM References ==============

const modal = document.getElementById("myModal");
const editModal = document.getElementById("editModal");
const deleteModal = document.getElementById("deleteModal");
const cardContainer = document
  .getElementById("cardContainer")
  .querySelector(".overflow-auto");








// ============== Helper Functions ==============



/* Adds a card in the container */

function addCard(employee) {
  const cardContainer = document
    .getElementById("cardContainer")
    .querySelector(".overflow-auto");
  cardContainer.insertAdjacentHTML("beforeend", employee.getCardHTML());
}



/* Adds an employee */

function addEmployee(employeeId, name, address, role) {
  const employee = new Employee(employeeId, name, address, role);
  employees.push(employee);
  addCard(employee);
  employeeTrie.update(name.toLowerCase());
}



/* Updates card */

function updateCardDisplay(matchingEmployees) {
  const cardContainer = document
    .getElementById("cardContainer")
    .querySelector(".overflow-auto");
  cardContainer.innerHTML = "";
  matchingEmployees.forEach((employee) => addCard(employee));
}



/* Edits an employee */

function editEmployee(oldName, newName, newAddress, newRole) {
  const employee = employees.find(
    (emp) => emp.name.toLowerCase() === oldName.toLowerCase()
  );
  if (employee) {
    employee.updateDetails(newName, newAddress, newRole);
    employeeTrie.delete(oldName.toLowerCase());
    employeeTrie.update(newName.toLowerCase());

    updateCardDisplay(employees);
  }
}



/* Deletes an employee */

function deleteEmployee(employeeName) {
  const lowerCaseName = employeeName.toLowerCase();
  const index = employees.findIndex(
    (emp) => emp.name.toLowerCase() === lowerCaseName
  );
  if (index > -1) {
    employees.splice(index, 1);
  }

  employeeTrie.deleteNode(lowerCaseName, employeeTrie.root);
  updateCardDisplay(employees);
}








// ============== General Event Listeners ==============



// Opens Modal

document.getElementById("addCardBtn").addEventListener("click", function () {
  document.getElementById("myModal").style.display = "block";
});


// Closes Modal

document.querySelector(".close").addEventListener("click", function () {
  document.getElementById("myModal").style.display = "none";
});


// Handles the addition of employees after taking input from Modal


document.getElementById("submitBtn").addEventListener("click", function () {
  const employeeId = document.getElementById("employeeId").value;
  const name = document.getElementById("employeeName").value;
  const address = document.getElementById("employeeAddress").value;
  const role = document.getElementById("employeeRole").value;

  if (
    name.trim() !== "" &&
    role.trim() !== "" &&
    employeeId.trim() !== "" &&
    address.trim() !== ""
  ) {
    addEmployee(employeeId, name, address, role);
    document.getElementById("myModal").style.display = "none";
    document.getElementById("employeeId").value = "";
    document.getElementById("employeeName").value = "";
    document.getElementById("employeeAddress").value = "";
    document.getElementById("employeeRole").value = "";
  } else {
    alert("Please enter all details for the employee.");
  }
});


// Takes input and triggers the search function of the trie

document
  .getElementById("searchBox")
  .addEventListener("input", function (event) {
    const val = event.target.value.toLowerCase();
    const matches = employeeTrie.query(val);
    const matchingEmployees = employees.filter((emp) =>
      matches.includes(emp.name.toLowerCase())
    );
    updateCardDisplay(matchingEmployees);
  });




window.addEventListener("click", function (event) {
  const modal = document.getElementById("myModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
});









// ============== Employee Edit Functionality ==============

const editEmployeeIdInput = document.getElementById("editEmployeeId");
const editNameInput = document.getElementById("editEmployeeName");
const editRoleInput = document.getElementById("editEmployeeRole");
const editAddressInput = document.getElementById("editEmployeeAddress");
const editSubmitBtn = document.getElementById("editSubmitBtn");
let editingEmployeeName = "";



// ... Employee Edit Event Listeners ...

document
  .getElementById("cardContainer")
  .addEventListener("click", function (event) {
    if (event.target && event.target.id === "editBtn") {
      const card = event.target.closest(".card");
      const id = card.querySelector("#card-employeeId").textContent;
      const name = card.querySelector(".font-bold").textContent;
      const role = card.querySelector("#card-role").textContent;
      const address = card.querySelector("#card-address").textContent;

      editingEmployeeName = name;
      editEmployeeIdInput.value = id;
      editNameInput.value = name;
      editRoleInput.value = role;
      editAddressInput.value = address;
      editModal.style.display = "block";
    }
  });

  

editSubmitBtn.addEventListener("click", function () {
  const newName = editNameInput.value.trim();
  const newRole = editRoleInput.value.trim();
  const newAddress = editAddressInput.value.trim();

  if (newName !== "" && newRole !== "" && newAddress !== "") {
    editEmployee(editingEmployeeName, newName, newAddress, newRole);
    editModal.style.display = "none";
  } else {
    alert("Please enter all details for the employee.");
  }
});



window.addEventListener("click", function (event) {
  if (event.target == editModal) {
    editModal.style.display = "none";
  }
});








// ============== Employee Delete Functionality ==============

const closeDeleteModal = deleteModal.querySelector(".close");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
let deletingEmployeeName = "";



// ... Employee Delete Event Listeners ...

document
  .getElementById("cardContainer")
  .addEventListener("click", function (event) {
    if (event.target && event.target.id === "deleteBtn") {
      const card = event.target.closest(".card");
      deletingEmployeeName = card.querySelector(".font-bold").textContent;
      deleteModal.style.display = "block";
    }
  });



closeDeleteModal.addEventListener("click", function () {
  deleteModal.style.display = "none";
});

cancelDeleteBtn.addEventListener("click", function () {
  deleteModal.style.display = "none";
});



document
  .getElementById("confirmDeleteBtn")
  .addEventListener("click", function () {
    deleteEmployee(deletingEmployeeName);
    deleteModal.style.display = "none";
  });